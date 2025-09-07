import loader from '@monaco-editor/loader';
import { send } from './websock.js';
import notify from './notify.js';

// Configure Monaco Editor to use local assets instead of CDN
loader.config({ 
  paths: { 
    vs: '/node_modules/monaco-editor/min/vs'
  }
});

const echo = txt => {
  const terminal = document.querySelector('.terminal');
  if (terminal) {
    terminal.dispatchEvent(new CustomEvent('output', { detail: txt }));
  }
};

let keydown = function () {};

// Create a jQuery-like utility for backwards compatibility with user settings
const createDOMUtility = () => {
  const utility = (selector) => {
    if (typeof selector === 'string') {
      const element = document.querySelector(selector);
      return {
        on: (eventType, handler) => {
          if (element) {
            element.addEventListener(eventType, handler);
          }
        },
        off: (eventType, handler) => {
          if (element) {
            if (handler) {
              element.removeEventListener(eventType, handler);
            } else {
              // If no handler specified, clone the element to remove all listeners
              const newElement = element.cloneNode(true);
              element.parentNode?.replaceChild(newElement, element);
            }
          }
        },
        trigger: (eventType, data) => {
          if (element) {
            element.dispatchEvent(new CustomEvent(eventType, { detail: data }));
          }
        },
        val: () => element ? element.value : '',
        text: () => element ? element.textContent : ''
      };
    }
    return utility;
  };
  return utility;
};

const applySettings = s => {
  const settings = `return function(params) {
    'use strict';
    let { keydown, notify, send, echo, $, mudprompt } = params;
    (function() { ${s} })();
    return { keydown };
  }`;

  const exports = Function(settings)()({
    keydown,
    notify,
    send,
    echo,
    $: createDOMUtility(),
    mudprompt: window.mudprompt,
  });

  keydown = exports.keydown;
};

let editor;

document.addEventListener('DOMContentLoaded', function () {
  function hashCode(s) {
    let hash = 0;
    if (!s) return hash;

    for (let i = 0; i < s.length; i++) {
      const chr = s.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }

    return hash;
  }

  // Function to initialize settings regardless of Monaco Editor status
  function initializeSettings(contents) {
    const contentsHash = '' + hashCode(contents);
    const settingsHash = '' + hashCode(localStorage.settings);

    if (contentsHash !== localStorage.defaultsHash) {
      if (
        localStorage.defaultsHash &&
        localStorage.settings &&
        localStorage.settings !== contents &&
        settingsHash !== localStorage.settingsBackupHash
      ) {
        localStorage.settingsBackup = localStorage.settings;
        localStorage.settingsBackupHash = settingsHash;
      }

      localStorage.settings = contents;
      localStorage.defaultsHash = contentsHash;
    }

    // Always try to apply settings, even if editor fails to load
    try {
      const settingsToApply = localStorage.settings || contents || '';
      if (settingsToApply) {
        applySettings(settingsToApply);
      }
    } catch (e) {
      console.log('Error applying settings:', e);
      echo(e);
    }
  }

  fetch('defaults.js')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(function (contents) {
      // Initialize settings first (fallback)
      initializeSettings(contents);

      // Then try to initialize Monaco Editor
      loader.init().then(monaco => {
        const editorContainer = document.querySelector('#settings-modal .editor');
        if (!editorContainer) {
          console.log('Editor container not found');
          return;
        }

        editor = monaco.editor.create(editorContainer, {
          value: localStorage.settings || '',
          language: 'javascript',
          theme: 'vs-dark',
          fontSize: 16,
          wordWrap: 'on',
          lineNumbers: 'off',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 20, bottom: 20 },
          tabSize: 4,
          insertSpaces: false,
          detectIndentation: true,
          formatOnType: true,
        });

        const saveButton = document.getElementById('settings-save-button');
        if (saveButton) {
          saveButton.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove old event listeners from triggers
            const triggers = document.querySelectorAll('.trigger');
            triggers.forEach(trigger => {
              // Clone the node to remove all event listeners
              const newTrigger = trigger.cloneNode(true);
              trigger.parentNode.replaceChild(newTrigger, trigger);
            });

            const val = editor.getValue();
            applySettings(val);
            localStorage.settings = val;
          });
        }
      }).catch(error => {
        console.error('Monaco Editor failed to load:', error);
        // Monaco Editor failed, but settings are already applied from fallback above
        
        // Still need to handle save button for basic functionality
        const saveButton = document.getElementById('settings-save-button');
        if (saveButton) {
          saveButton.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Monaco Editor not available, settings already applied from localStorage');
          });
        }
      });
    })
    .catch(error => {
      console.error('Error loading defaults.js:', error);
      // Try to apply settings from localStorage as last resort
      try {
        if (localStorage.settings) {
          applySettings(localStorage.settings);
        }
      } catch (e) {
        console.error('Failed to apply localStorage settings:', e);
      }
    });
});

export function getKeydown() {
  return keydown;
}
