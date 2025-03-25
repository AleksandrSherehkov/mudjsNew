import $ from 'jquery';
import loader from '@monaco-editor/loader';
import 'devbridge-autocomplete';
import { rpccmd } from './websock';

let monacoEditor;

// ⬇️ Создаём скрытый элемент для озвучки
const ariaAnnouncer = document.createElement('div');
ariaAnnouncer.setAttribute('id', 'aria-announce');
ariaAnnouncer.setAttribute('aria-live', 'polite');
ariaAnnouncer.setAttribute('role', 'status');
ariaAnnouncer.style.position = 'absolute';
ariaAnnouncer.style.width = '1px';
ariaAnnouncer.style.height = '1px';
ariaAnnouncer.style.overflow = 'hidden';
ariaAnnouncer.style.clip = 'rect(1px, 1px, 1px, 1px)';
ariaAnnouncer.style.clipPath = 'inset(50%)';
document.body.appendChild(ariaAnnouncer);

// Универсальный адаптивный стиль для редактора
function getResponsiveEditorParams() {
  const minWidth = 360;
  const maxWidth = 1440;
  const width = Math.max(minWidth, Math.min(window.innerWidth, maxWidth));
  const percent = (width - minWidth) / (maxWidth - minWidth);

  const fontSize = +(8 + (18 - 8) * percent).toFixed(2);
  const lineHeight = Math.round(fontSize * 1.5);
  const paddingValue = Math.round(0 + 20 * percent);

  return {
    fontSize,
    lineHeight,
    padding: { top: paddingValue, bottom: paddingValue },
  };
}

function initHelpIds() {
  const heditLookup = $('#textedit-modal input');

  $.get(
    'hedit.json',
    function (data) {
      const topics = $.map(data, item => ({
        value: `${item.id}: ${item.kw.toLowerCase()}`,
        data: item.id,
      }));

      heditLookup.autocomplete({
        lookup: topics,
        lookupLimit: 20,
        autoSelectFirst: true,
        showNoSuggestionNotice: true,
        noSuggestionNotice: 'Справка не найдена',
        onSelect: () => $('#textedit-modal .editor').focus(),
      });
    },
    'json'
  ).fail(() => {
    console.log('Cannot retrieve help ids.');
    $('#textedit-modal input').hide();
  });
}

$(document).ready(() => {
  loader.init().then(monaco => {
    const editorElement = $('#textedit-modal .editor')[0];
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

    let recognition;
    const isSpeechRecognitionSupported =
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

    if (isSpeechRecognitionSupported) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU'; // или 'uk-UA', 'en-US'
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = event => {
        const transcript = event.results[0][0].transcript;
        const currentText = monacoEditor.getValue();
        monacoEditor.setValue(currentText + ' ' + transcript);
      };

      recognition.onerror = event => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        console.log('Voice input ended');
      };

      $('#start-voice').click(() => {
        recognition.start();
      });
    } else {
      console.warn('Speech recognition is not supported in this browser.');
      $('#start-voice').hide();
    }

    // ✅ Добавляем отслеживание длины строки и озвучку
    monacoEditor.onDidChangeModelContent(() => {
      const model = monacoEditor.getModel();
      const pos = monacoEditor.getPosition();
      const line = model.getLineContent(pos.lineNumber);
      if (line.length === 80) {
        ariaAnnouncer.textContent = `Вы достигли 80 символов на строке ${pos.lineNumber}.`;
      }
    });

    // Обновление параметров при ресайзе
    window.addEventListener('resize', () => {
      if (monacoEditor) {
        const { fontSize, lineHeight, padding } = getResponsiveEditorParams();
        monacoEditor.updateOptions({ fontSize, lineHeight, padding });
      }
    });

    $('#rpc-events').on('rpc-editor_open', (e, text, arg) => {
      monacoEditor.setValue(text || '');
      $('#textedit-modal').modal('show');

      if (arg === 'help') {
        $('#textedit-modal input').show();
        initHelpIds();
      } else {
        $('#textedit-modal input').hide();
      }

      $('#textedit-modal .save-button')
        .off()
        .click(e => {
          e.preventDefault();
          const val = monacoEditor.getValue();
          rpccmd('editor_save', val);
        });

      $('#textedit-modal .cancel-button')
        .off()
        .click(e => {
          e.preventDefault();
          $('#textedit-modal').modal('hide');
        });
    });
  });
});
