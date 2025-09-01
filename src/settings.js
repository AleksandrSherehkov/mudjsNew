import loader from '@monaco-editor/loader';
import { send } from './websock.js';
import notify from './notify.js';

const echo = txt => {
  const terminal = document.querySelector('.terminal');
  if (terminal) {
    const event = new CustomEvent('output', { detail: txt });
    terminal.dispatchEvent(event);
  }
};

let keydown = function () {};

const applySettings = s => {
  const settings = `return function(params) {
    'use strict';
    let { keydown, notify, send, echo, mudprompt } = params;
    (function() { ${s} })();
    return { keydown };
  }`;

  const exports = Function(settings)()({
    keydown,
    notify,
    send,
    echo,
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

  fetch('defaults.js')
    .then(response => response.text())
    .then(function (contents) {
      const contentsHash = '' + hashCode(contents);
      const settingsHash = '' + hashCode(localStorage.settings);

      if (contentsHash !== localStorage.defaultsHash) {
        if (
          localStorage.defaultsHash &&
          settingsHash !== localStorage.defaultsHash
        ) {
          console.log(settingsHash + ': ' + localStorage.defaultsHash);
        } else {
          localStorage.settings = contents;
        }
        localStorage.defaultsHash = contentsHash;
      }

      loader.init().then(monaco => {
        const editorElement = document.querySelector('#settings-modal .editor');
        editor = monaco.editor.create(editorElement, {
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

        try {
          applySettings(editor.getValue());
        } catch (e) {
          console.log(e);
          echo(e);
        }

        const saveButton = document.getElementById('settings-save-button');
        if (saveButton) {
          saveButton.addEventListener('click', function (e) {
            e.preventDefault();

            const trigger = document.querySelector('.trigger');
            if (trigger) {
              // Remove existing event listeners
              const newTrigger = trigger.cloneNode(true);
              trigger.parentNode.replaceChild(newTrigger, trigger);
            }
            
            const val = editor.getValue();
            applySettings(val);
            localStorage.settings = val;
          });
        }
      });
    })
    .catch(error => {
      console.error('Error loading defaults.js:', error);
    });
});

export function getKeydown() {
  return keydown;
}
