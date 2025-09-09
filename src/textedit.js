import loader from '@monaco-editor/loader';
import { rpccmd } from './websock';
import { setupSpeechRecognition } from './speech';

let monacoEditor = null;
let recognition = null;

/* =========================
 * A11y: скрытый live-элемент
 * ========================= */
function ensureAriaAnnouncer() {
  let ariaAnnouncer = document.getElementById('aria-announce');
  if (ariaAnnouncer) return ariaAnnouncer;

  ariaAnnouncer = document.createElement('div');
  ariaAnnouncer.id = 'aria-announce';
  ariaAnnouncer.setAttribute('aria-live', 'polite');
  ariaAnnouncer.setAttribute('role', 'status');
  Object.assign(ariaAnnouncer.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    clip: 'rect(1px, 1px, 1px, 1px)',
    clipPath: 'inset(50%)',
  });
  document.body.appendChild(ariaAnnouncer);
  return ariaAnnouncer;
}

/* =========================
 * Параметры редактора по ширине
 * ========================= */
function getResponsiveEditorParams() {
  const minWidth = 360;
  const maxWidth = 1440;
  const width = Math.max(minWidth, Math.min(window.innerWidth, maxWidth));
  const percent = (width - minWidth) / (maxWidth - minWidth);

  const fontSize = +(7.5 + (18 - 7.5) * Math.pow(percent, 0.8)).toFixed(2);
  const lineHeight = Math.round(fontSize * 1.5);
  const paddingValue = Math.round(0 + 20 * percent);

  return {
    fontSize,
    lineHeight,
    padding: { top: paddingValue, bottom: paddingValue },
  };
}

/* =========================
 * Help IDs (autocomplete без jQuery)
 * ========================= */
function initHelpIds() {
  const input = document.querySelector('#textedit-modal input');
  if (!input) return;

  // контейнер для подсказок
  let list = document.getElementById('textedit-help-suggestions');
  const removeList = () => {
    const el = document.getElementById('textedit-help-suggestions');
    if (el) el.remove();
  };
  const buildList = () => {
    removeList();
    list = document.createElement('ul');
    list.id = 'textedit-help-suggestions';
    list.className = 'autocomplete-suggestions';
    input.parentNode && input.parentNode.appendChild(list);
    return list;
  };

  fetch('hedit.json', { cache: 'no-cache' })
    .then(r => r.json())
    .then(data => {
      // data: [{id, kw}, ...]
      const topics = Array.isArray(data)
        ? data.map(item => ({
            value: `${item.id}: ${String(item.kw || '').toLowerCase()}`,
            id: item.id,
            title: String(item.kw || ''),
          }))
        : [];

      const render = value => {
        const v = String(value || '')
          .trim()
          .toLowerCase();
        removeList();
        if (!v) return;
        const matches = topics.filter(t => t.value.includes(v)).slice(0, 20);

        const ul = buildList();
        if (!matches.length) {
          const li = document.createElement('li');
          li.className = 'no-suggestion';
          li.textContent = 'Справка не найдена';
          ul.appendChild(li);
          return;
        }

        matches.forEach((m, idx) => {
          const li = document.createElement('li');
          li.className = 'autocomplete-suggestion';
          li.textContent = `${m.id}: ${m.title}`;
          li.addEventListener('click', () => {
            // при выборе — фокус в редактор
            removeList();
            const editorEl = document.querySelector('#textedit-modal .editor');
            if (editorEl) editorEl.focus();
          });
          // автофокус на первом (аналог autoSelectFirst)
          if (idx === 0) li.setAttribute('data-first', 'true');
          ul.appendChild(li);
        });
      };

      input.addEventListener('input', () => render(input.value));
      input.addEventListener('keydown', e => {
        if (e.key === 'Escape') removeList();
        if (e.key === 'Enter') {
          // эмулируем выбор первого
          const first = document.querySelector(
            '#textedit-help-suggestions .autocomplete-suggestion[data-first="true"]'
          );
          if (first) {
            first.click();
            e.preventDefault();
          }
        }
      });
      input.addEventListener('blur', () => {
        // небольшая задержка, чтобы успел отработать click
        setTimeout(removeList, 150);
      });
    })
    .catch(() => {
      console.log('Cannot retrieve help ids.');
      input.style.display = 'none';
    });
}

/* =========================
 * Голосовой ввод
 * ========================= */
function initVoiceRecognition() {
  if (recognition) recognition.abort();
  const langSelect = document.querySelector('#voice-lang');
  const lang = (langSelect && langSelect.value) || 'ru-RU';

  recognition = setupSpeechRecognition({
    lang,
    buttonSelector: '#start-voice',
    onResult: transcript => {
      if (!monacoEditor) return;
      const currentText = monacoEditor.getValue();
      monacoEditor.setValue(currentText + ' ' + transcript);
    },
    onError: event => {
      console.error('Speech recognition error:', event?.error);
    },
  });
}

/* =========================
 * Инициализация
 * ========================= */
document.addEventListener('DOMContentLoaded', () => {
  ensureAriaAnnouncer();

  loader.init().then(monaco => {
    const editorElement = document.querySelector('#textedit-modal .editor');
    if (!editorElement) return;

    const { fontSize, lineHeight, padding } = getResponsiveEditorParams();
    monacoEditor = monaco.editor.create(editorElement, {
      value: '',
      accessibilitySupport: 'on',
      language: 'plaintext',
      theme: 'vs-dark',
      wordWrap: 'wordWrapColumn',
      wordWrapColumn: 80,
      wrappingIndent: 'same',
      lineNumbers: 'off',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize,
      lineHeight,
      fontFamily: 'Roboto Mono, monospace',
      padding,
      automaticLayout: true,
      rulers: [80],
      renderWhitespace: 'boundary',
      cursorSmoothCaretAnimation: true,
      glyphMargin: false,
      lineDecorationsWidth: 0,
      folding: false,
      renderLineHighlight: 'none',
    });

    // Голос
    initVoiceRecognition();
    const langSel = document.querySelector('#voice-lang');
    if (langSel) {
      langSel.addEventListener('change', () => initVoiceRecognition());
    }

    // A11y: оповещение при достижении 80 символов в строке
    monacoEditor.onDidChangeModelContent(() => {
      const model = monacoEditor.getModel();
      const pos = monacoEditor.getPosition();
      if (!model || !pos) return;
      const line = model.getLineContent(pos.lineNumber);
      if (line.length === 80) {
        const a11y = ensureAriaAnnouncer();
        a11y.textContent = `Вы достигли 80 символов на строке ${pos.lineNumber}.`;
      }
    });

    // Респонсив-настройки при ресайзе
    window.addEventListener('resize', () => {
      if (!monacoEditor) return;
      const { fontSize, lineHeight, padding } = getResponsiveEditorParams();
      monacoEditor.updateOptions({ fontSize, lineHeight, padding });
    });

    // Открытие редактора по RPC
    const rpcEvents = document.getElementById('rpc-events');
    if (rpcEvents) {
      rpcEvents.addEventListener('rpc-editor_open', event => {
        const [text, arg] = Array.isArray(event.detail) ? event.detail : [];
        if (monacoEditor) monacoEditor.setValue(text || '');

        const modalEl = document.getElementById('textedit-modal');
        if (modalEl && window.bootstrap?.Modal) {
          const modal = new window.bootstrap.Modal(modalEl);
          modal.show();

          const helpInput = document.querySelector('#textedit-modal input');
          if (arg === 'help') {
            if (helpInput) helpInput.style.display = '';
            initHelpIds();
          } else if (helpInput) {
            helpInput.style.display = 'none';
          }

          // Кнопки: сохраняем и отменяем (each open → один обработчик)
          const saveBtn = document.querySelector(
            '#textedit-modal .save-button'
          );
          const cancelBtn = document.querySelector(
            '#textedit-modal .cancel-button'
          );

          if (saveBtn) {
            saveBtn.addEventListener(
              'click',
              e => {
                e.preventDefault();
                const val = monacoEditor ? monacoEditor.getValue() : '';
                rpccmd('editor_save', val);
              },
              { once: true }
            );
          }
          if (cancelBtn) {
            cancelBtn.addEventListener(
              'click',
              e => {
                e.preventDefault();
                modal.hide();
              },
              { once: true }
            );
          }
        }
      });
    }
  });
});
