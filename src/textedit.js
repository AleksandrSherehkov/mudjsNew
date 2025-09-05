import $ from './jquery-shim.js';
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

// Helper function to wait for DOM element to be available
function waitForElement(selector, maxAttempts = 50, delay = 100) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    function checkElement() {
      attempts++;
      const element = document.querySelector(selector);
      
      if (element) {
        resolve(element);
      } else if (attempts >= maxAttempts) {
        reject(new Error(`Element ${selector} not found after ${maxAttempts} attempts`));
      } else {
        setTimeout(checkElement, delay);
      }
    }
    
    checkElement();
  });
}

$(document).ready(() => {
  loader.init().then(async monaco => {
    try {
      // Wait for the modal element to be available in the DOM
      const editorElement = await waitForElement('#textedit-modal .editor');
      
      console.log('Monaco editor container found for textedit-modal');
      
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

      // Only set up event handlers if Monaco editor was created successfully
      if (monacoEditor) {
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

        $('#rpc-events').on('rpc-editor_open', async (e, text, arg) => {
          // If Monaco editor wasn't initialized yet, try to initialize it now
          if (!monacoEditor) {
            try {
              const editorElement = await waitForElement('#textedit-modal .editor', 10, 100);
              console.log('Reinitializing Monaco editor for textedit-modal');
              
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

              // Set up event handlers for the newly created editor
              if (monacoEditor) {
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
              }
            } catch (error) {
              console.warn('Failed to reinitialize Monaco editor on modal open:', error);
            }
          }
          
          if (monacoEditor) {
            monacoEditor.setValue(text || '');
          }
          
          // Use Bootstrap 5 native Modal API instead of jQuery
          const modalElement = document.getElementById('textedit-modal');
          if (modalElement) {
            const modal = new window.bootstrap.Modal(modalElement);
            modal.show();

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
                const val = monacoEditor ? monacoEditor.getValue() : '';
                rpccmd('editor_save', val);
              });

            $('#textedit-modal .cancel-button')
              .off()
              .click(e => {
                e.preventDefault();
                modal.hide();
              });
          }
        });
      }
    } catch (error) {
      console.warn('Monaco editor container element not found initially. Selector: #textedit-modal .editor. Will try to initialize on demand.', error);
      // Don't return here - continue with event handler setup
    }
  });
});
