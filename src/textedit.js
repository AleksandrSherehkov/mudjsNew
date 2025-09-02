import loader from '@monaco-editor/loader';
import 'devbridge-autocomplete';
import { rpccmd } from './websock';
import { setupSpeechRecognition } from './speech';

let monacoEditor;
let recognition = null;

// ⬇️ Скрытый элемент для озвучки
const ariaAnnouncer = document.createElement('div');
ariaAnnouncer.setAttribute('id', 'aria-announce');
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

function initHelpIds() {
  const heditLookup = document.querySelector('#textedit-modal input');

  fetch('hedit.json')
    .then(response => response.json())
    .then(data => {
      const topics = data.map(item => ({
        value: `${item.id}: ${item.kw.toLowerCase()}`,
        data: item.id,
      }));

      // Using devbridge-autocomplete with jQuery-like interface for autocomplete
      // Note: This library may still need jQuery under the hood
      if (heditLookup && window.jQuery) {
        window.jQuery(heditLookup).autocomplete({
          lookup: topics,
          lookupLimit: 20,
          autoSelectFirst: true,
          showNoSuggestionNotice: true,
          noSuggestionNotice: 'Справка не найдена',
          onSelect: () => {
            const editor = document.querySelector('#textedit-modal .editor');
            if (editor) editor.focus();
          },
        });
      }
    })
    .catch(() => {
      console.log('Cannot retrieve help ids.');
      const input = document.querySelector('#textedit-modal input');
      if (input) input.style.display = 'none';
    });
}

function initVoiceRecognition(monaco) {
  if (recognition) recognition.abort();

  recognition = setupSpeechRecognition({
    lang: document.querySelector('#voice-lang').value || 'ru-RU',
    buttonSelector: '#start-voice',
    onResult: transcript => {
      const currentText = monaco.getValue();
      monaco.setValue(currentText + ' ' + transcript);
    },
    onError: event => {
      console.error('Speech recognition error:', event.error);
    },
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loader.init().then(monaco => {
    const editorElement = document.querySelector('#textedit-modal .editor');
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

    initVoiceRecognition(monacoEditor);

    // 🔄 Перезапуск речи при смене языка
    document.querySelector('#voice-lang').addEventListener('change', () => {
      initVoiceRecognition(monacoEditor);
    });

    monacoEditor.onDidChangeModelContent(() => {
      const model = monacoEditor.getModel();
      const pos = monacoEditor.getPosition();
      const line = model.getLineContent(pos.lineNumber);
      if (line.length === 80) {
        ariaAnnouncer.textContent = `Вы достигли 80 символов на строке ${pos.lineNumber}.`;
      }
    });

    window.addEventListener('resize', () => {
      if (monacoEditor) {
        const { fontSize, lineHeight, padding } = getResponsiveEditorParams();
        monacoEditor.updateOptions({ fontSize, lineHeight, padding });
      }
    });

    const rpcEvents = document.getElementById('rpc-events');
    if (rpcEvents) {
      rpcEvents.addEventListener('rpc-editor_open', (e) => {
        const [text, arg] = e.detail;
        monacoEditor.setValue(text || '');
        
        // Use Bootstrap 5 native Modal API instead of jQuery
        const modalElement = document.getElementById('textedit-modal');
        const modal = new window.bootstrap.Modal(modalElement);
        modal.show();

        const input = document.querySelector('#textedit-modal input');
        if (arg === 'help') {
          if (input) input.style.display = 'block';
          initHelpIds();
        } else {
          if (input) input.style.display = 'none';
        }

        const saveButton = document.querySelector('#textedit-modal .save-button');
        const cancelButton = document.querySelector('#textedit-modal .cancel-button');

        // Remove previous event listeners by cloning and replacing elements
        const newSaveButton = saveButton.cloneNode(true);
        const newCancelButton = cancelButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newSaveButton, saveButton);
        cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

        newSaveButton.addEventListener('click', (e) => {
          e.preventDefault();
          const val = monacoEditor.getValue();
          rpccmd('editor_save', val);
        });

        newCancelButton.addEventListener('click', (e) => {
          e.preventDefault();
          modal.hide();
        });
      });
    }
  });
});
