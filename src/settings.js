import loader from '@monaco-editor/loader';
import { send } from './websock.js';
import notify from './notify.js';

// Эхо в терминал (замена $('.terminal').trigger('output', [txt]))
const echo = txt => {
  document.querySelectorAll('.terminal').forEach(termEl => {
    termEl.dispatchEvent(new CustomEvent('output', { detail: txt }));
  });
};

let keydown = function () {};

const applySettings = s => {
  // Выполняем пользовательский код настроек в замкнутом окружении
  // и возвращаем объект с функциями/обработчиками (в частности keydown)
  const factorySource = `return function(params) {
    'use strict';
    let { keydown, notify, send, echo, mudprompt } = params;
    (function() { ${s} })();
    return { keydown };
  }`;

  const factory = Function(factorySource)();
  const exports = factory({
    keydown,
    notify,
    send,
    echo,
    mudprompt: window.mudprompt,
  });

  if (exports && typeof exports.keydown === 'function') {
    keydown = exports.keydown;
  }
};

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

document.addEventListener('DOMContentLoaded', () => {
  // Загружаем defaults.js как текст (аналог $.ajax с overrideMimeType)
  fetch('defaults.js', { cache: 'no-cache' })
    .then(r => r.text())
    .then(contents => {
      const contentsHash = String(hashCode(contents));
      const settingsHash = String(hashCode(localStorage.settings));

      if (contentsHash !== localStorage.defaultsHash) {
        if (
          localStorage.defaultsHash &&
          settingsHash !== localStorage.defaultsHash
        ) {
          // Пользователь менял настройки — не перезаписываем, только лог
          console.log(settingsHash + ': ' + localStorage.defaultsHash);
        } else {
          // Настроек нет/они совпадали с прежними дефолтами — обновляем на новые дефолты
          localStorage.settings = contents;
        }
        localStorage.defaultsHash = contentsHash;
      }

      // Инициализация Monaco editor
      return loader.init().then(monaco => {
        const editorHost = document.querySelector('#settings-modal .editor');
        if (!editorHost) return;

        const editor = monaco.editor.create(editorHost, {
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

        // Пробуем применить настройки при загрузке
        try {
          applySettings(editor.getValue());
        } catch (e) {
          console.log(e);
          echo(String(e));
        }

        // Сохранение настроек
        const saveBtn = document.getElementById('settings-save-button');
        if (saveBtn) {
          saveBtn.addEventListener('click', e => {
            e.preventDefault();

            // В jQuery-версии тут было: $('.trigger').off('input.myNamespace text.myNamespace')
            // У нативных слушателей нет пространств имён — предполагаем,
            // что пользовательский код сам корректно перевешивает нужные обработчики.

            const val = editor.getValue();
            try {
              applySettings(val);
              localStorage.settings = val;
              echo('Настройки сохранены.\n');
            } catch (err) {
              console.log(err);
              echo('Ошибка применения настроек: ' + String(err) + '\n');
            }
          });
        }
      });
    })
    .catch(err => {
      console.log(err);
      echo('Не удалось загрузить defaults.js\n');
    });
});

export function getKeydown() {
  return keydown;
}
