import loader from '@monaco-editor/loader';
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

// Simple autocomplete replacement without jQuery dependency
function createAutocomplete(input, options) {
  let suggestionContainer = null;
  let currentSuggestions = [];
  let selectedIndex = -1;

  function showSuggestions(suggestions) {
    hideSuggestions();
    
    if (suggestions.length === 0) {
      if (options.showNoSuggestionNotice) {
        const notice = document.createElement('div');
        notice.className = 'autocomplete-suggestions';
        notice.innerHTML = `<div class="autocomplete-suggestion">${options.noSuggestionNotice}</div>`;
        input.parentNode.appendChild(notice);
        suggestionContainer = notice;
      }
      return;
    }

    suggestionContainer = document.createElement('div');
    suggestionContainer.className = 'autocomplete-suggestions';
    
    suggestions.forEach((suggestion, index) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-suggestion';
      item.textContent = suggestion.value;
      item.dataset.index = index;
      
      item.addEventListener('click', () => {
        input.value = suggestion.value;
        hideSuggestions();
        if (options.onSelect) options.onSelect();
      });
      
      suggestionContainer.appendChild(item);
    });
    
    input.parentNode.appendChild(suggestionContainer);
    currentSuggestions = suggestions;
  }

  function hideSuggestions() {
    if (suggestionContainer) {
      suggestionContainer.remove();
      suggestionContainer = null;
    }
    currentSuggestions = [];
    selectedIndex = -1;
  }

  function selectSuggestion(index) {
    const items = suggestionContainer?.querySelectorAll('.autocomplete-suggestion');
    if (!items) return;
    
    items.forEach(item => item.classList.remove('autocomplete-suggestion-selected'));
    if (index >= 0 && index < items.length) {
      items[index].classList.add('autocomplete-suggestion-selected');
      selectedIndex = index;
    }
  }

  input.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase();
    if (value.length < 1) {
      hideSuggestions();
      return;
    }

    const filtered = options.lookup.filter(item => 
      item.value.toLowerCase().includes(value)
    ).slice(0, options.lookupLimit || 10);
    
    showSuggestions(filtered);
    if (options.autoSelectFirst && filtered.length > 0) {
      selectSuggestion(0);
    }
  });

  input.addEventListener('keydown', (e) => {
    if (!suggestionContainer) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectSuggestion(Math.min(selectedIndex + 1, currentSuggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectSuggestion(Math.max(selectedIndex - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && currentSuggestions[selectedIndex]) {
          input.value = currentSuggestions[selectedIndex].value;
          hideSuggestions();
          if (options.onSelect) options.onSelect();
        }
        break;
      case 'Escape':
        hideSuggestions();
        break;
    }
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !suggestionContainer?.contains(e.target)) {
      hideSuggestions();
    }
  });
}

function initHelpIds() {
  const heditLookup = document.querySelector('#textedit-modal input');
  if (!heditLookup) return;

  fetch('hedit.json')
    .then(response => response.json())
    .then(data => {
      const topics = data.map(item => ({
        value: `${item.id}: ${item.kw.toLowerCase()}`,
        data: item.id,
      }));

      createAutocomplete(heditLookup, {
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
    })
    .catch(() => {
      console.log('Cannot retrieve help ids.');
      heditLookup.style.display = 'none';
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

    initVoiceRecognition(monacoEditor);

    // 🔄 Перезапуск речи при смене языка
    const voiceLang = document.querySelector('#voice-lang');
    if (voiceLang) {
      voiceLang.addEventListener('change', () => {
        initVoiceRecognition(monacoEditor);
      });
    }

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
        const text = e.detail?.[0];
        const arg = e.detail?.[1];
        
        monacoEditor.setValue(text || '');
        
        // Use Bootstrap 5 native Modal API instead of jQuery
        const modalElement = document.getElementById('textedit-modal');
        const modal = new window.bootstrap.Modal(modalElement);
        modal.show();

        const modalInput = document.querySelector('#textedit-modal input');
        if (arg === 'help') {
          if (modalInput) modalInput.style.display = 'block';
          initHelpIds();
        } else {
          if (modalInput) modalInput.style.display = 'none';
        }

        // Remove any existing event listeners
        const saveButton = document.querySelector('#textedit-modal .save-button');
        const cancelButton = document.querySelector('#textedit-modal .cancel-button');
        
        if (saveButton) {
          const newSaveButton = saveButton.cloneNode(true);
          saveButton.parentNode.replaceChild(newSaveButton, saveButton);
          
          newSaveButton.addEventListener('click', (e) => {
            e.preventDefault();
            const val = monacoEditor.getValue();
            rpccmd('editor_save', val);
          });
        }

        if (cancelButton) {
          const newCancelButton = cancelButton.cloneNode(true);
          cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
          
          newCancelButton.addEventListener('click', (e) => {
            e.preventDefault();
            modal.hide();
          });
        }
      });
    }
  });
});
