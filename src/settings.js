import loader from '@monaco-editor/loader';
import { send } from './websock.js';
import notify from './notify.js';

const echo = txt => {
  const terminal = document.querySelector('.terminal');
  if (terminal) {
    terminal.dispatchEvent(new CustomEvent('output', { detail: txt }));
  }
};

let keydown = function () {};

const createDOMUtility = () => {
  const store = new WeakMap();

  const byOriginal = new WeakMap();

  const normalize = evtName => {
    if (!evtName) return { dom: '', key: '' };
    const [dom] = evtName.split('.', 1);
    return { dom, key: evtName };
  };

  const ensureMaps = el => {
    if (!store.has(el)) store.set(el, new Map());
    if (!byOriginal.has(el)) byOriginal.set(el, new Map());
    return { events: store.get(el), originals: byOriginal.get(el) };
  };

  const utility = selector => {
    if (typeof selector !== 'string') return utility;
    const element = document.querySelector(selector);

    return {
      on: (eventType, handler) => {
        if (!element || !eventType || !handler) return;
        const { dom, key } = normalize(eventType);
        const wrapped = e => {
          const args = Array.isArray(e.detail) ? e.detail : [e.detail];

          handler(e, ...args);
        };

        const { events, originals } = ensureMaps(element);
        if (!events.has(key)) events.set(key, new Set());
        events.get(key).add(wrapped);

        if (!originals.has(key)) originals.set(key, new Map());
        originals.get(key).set(handler, wrapped);

        element.addEventListener(dom, wrapped);
      },

      off: (eventType, handler) => {
        if (!element || !eventType) return;

        const { dom, key } = normalize(eventType);
        const events = store.get(element);
        const originals = byOriginal.get(element);
        if (!events || !events.has(key)) return;

        if (handler && originals && originals.has(key)) {
          const map = originals.get(key);
          const wrapped = map.get(handler);
          if (wrapped) {
            element.removeEventListener(dom, wrapped);
            events.get(key).delete(wrapped);
            map.delete(handler);
          }
          return;
        }

        for (const wrapped of events.get(key)) {
          element.removeEventListener(dom, wrapped);
        }
        events.delete(key);
        if (originals && originals.has(key)) originals.get(key).clear();
      },

      trigger: (eventType, data) => {
        if (!element || !eventType) return;
        const { dom } = normalize(eventType);
        element.dispatchEvent(new CustomEvent(dom, { detail: data }));
      },

      val: () => (element ? element.value : ''),
      text: () => (element ? element.textContent : ''),
    };
  };

  return utility;
};

const applySettings = s => {
  const settings = `return function(params) {
    'use strict';
    let { keydown, notify, send, echo, $, mudprompt } = params;
    (function(){ ${s} })();
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

  // Загружаем defaults.js в редактор и в localStorage при изменении версии
  fetch('defaults.js')
    .then(response => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.text();
    })
    .then(function (contents) {
      const contentsHash = '' + hashCode(contents);
      const settingsHash = '' + hashCode(localStorage.settings);

      if (contentsHash !== localStorage.defaultsHash) {
        // Резервная копия прошлых пользовательских настроек (если они отличались)
        if (
          localStorage.defaultsHash &&
          localStorage.settings &&
          localStorage.settings !== contents &&
          settingsHash !== localStorage.settingsBackupHash
        ) {
          localStorage.settingsBackup = localStorage.settings;
          localStorage.settingsBackupHash = settingsHash;
        }
        // Обновляем настройки на новые дефолты
        localStorage.settings = contents;
        localStorage.defaultsHash = contentsHash;
      }

      // Инициализация Monaco
      loader.init().then(monaco => {
        const editorContainer = document.querySelector(
          '#settings-modal .editor'
        );
        if (!editorContainer) return;

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

        // Применяем настройки при открытии
        try {
          applySettings(editor.getValue());
        } catch (e) {
          console.log(e);
          echo(String(e));
        }

        // Сохранение: без каких-либо cloneNode/replaceChild!
        const saveButton = document.getElementById('settings-save-button');
        if (saveButton) {
          saveButton.addEventListener('click', function (e) {
            e.preventDefault();
            const val = editor.getValue();
            try {
              applySettings(val); // ваши настройки сами снимут/перевесят свои слушатели
              localStorage.settings = val;
              notify('Настройки сохранены.');
            } catch (err) {
              console.error(err);
              echo(String(err));
            }
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
