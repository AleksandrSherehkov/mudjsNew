import * as bootstrap from 'bootstrap';

window.bootstrap = bootstrap;

import PropertiesStorage from './properties';
import { connect } from './websock';
import lastLocation from './location';
import getSessionId from './sessionid.js';
import historydb from './historydb';

import './notify';
import './input';
import './settings';
import './prompt';
import './textedit';
import './cs';

import './main.css';

const sessionId = getSessionId();
let propertiesStorage = PropertiesStorage;

// Предупреждение при попытке закрыть вкладку/страницу
window.addEventListener('beforeunload', e => {
  e.preventDefault();
  // Эквивалент `return 'leaving already?'` для современных браузеров
  e.returnValue = 'leaving already?';
});

document.addEventListener('DOMContentLoaded', () => {
  // Кнопка "Логи": выгрузка логов и скачивание
  const logsBtn = document.getElementById('logs-button');
  if (logsBtn) {
    logsBtn.addEventListener('click', e => {
      e.preventDefault();
      let logs = [];
      historydb
        .then(db =>
          db.load(null, false, 100000000, (key, value) => {
            logs.push(value);
          })
        )
        .then(() => {
          const blob = new Blob(logs, { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          logs = null;

          const link = document.createElement('a');
          link.href = url;
          link.download = 'mudjs.log';

          setTimeout(() => {
            const event = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            link.dispatchEvent(event);
          }, 10);
        });
    });
  }

  // Кнопка "Карта": открытие карты текущей области
  const mapBtn = document.getElementById('map-button');
  if (mapBtn) {
    mapBtn.addEventListener('click', e => {
      e.preventDefault();
      if (!lastLocation()) return;
      const basefilename = lastLocation().area.replace(/\.are$/, '');
      const mapfile = `/maps/${basefilename}.html?sessionId=${sessionId}`;
      window.open(mapfile);
    });
  }

  // Управление размером шрифта терминала
  const fontDelta = 2;
  const terminalFontSizeKey = 'terminalFontSize';

  connect();
  initTerminalFontSize();

  function changeFontSize(delta) {
    const terminalEl = document.querySelector('.terminal');
    if (!terminalEl) return;
    const style = window.getComputedStyle(terminalEl).fontSize;
    const fontSize = parseFloat(style);
    const next = fontSize + delta;
    terminalEl.style.fontSize = next + 'px';
    localStorage.setItem(terminalFontSizeKey, String(next));
    propertiesStorage[terminalFontSizeKey] = next;
    localStorage.properties = JSON.stringify(propertiesStorage);
  }

  function initTerminalFontSize() {
    const cache = localStorage.properties
      ? JSON.parse(localStorage.properties)
      : propertiesStorage;
    const v =
      cache && cache[terminalFontSizeKey] != null
        ? cache[terminalFontSizeKey]
        : undefined;
    if (v != null) {
      const terminalEl = document.querySelector('.terminal');
      if (terminalEl) terminalEl.style.fontSize = v + 'px';
    }
  }

  // Кнопки увеличения/уменьшения шрифта:
  const fontPlusBtn = document.getElementById('font-plus-button');
  if (fontPlusBtn)
    fontPlusBtn.addEventListener('click', e => {
      e.preventDefault();
      changeFontSize(fontDelta);
    });

  const fontMinusBtn = document.getElementById('font-minus-button');
  if (fontMinusBtn)
    fontMinusBtn.addEventListener('click', e => {
      e.preventDefault();
      changeFontSize(-fontDelta);
    });

  // Сохранение размеров окон при клике по сплиттерам
  document.querySelectorAll('.layout-splitter').forEach(splitter => {
    splitter.addEventListener('click', () => {
      propertiesStorage['terminalLayoutWidth'] =
        document.querySelector('.terminal-wrap')?.getBoundingClientRect()
          .width || 0;
      propertiesStorage['panelLayoutWidth'] =
        document.querySelector('#panel-wrap')?.getBoundingClientRect().width ||
        0;
      propertiesStorage['mapLayoutWidth'] =
        document.querySelector('#map-wrap')?.getBoundingClientRect().width || 0;
      localStorage.properties = JSON.stringify(propertiesStorage);
    });
  });
});
