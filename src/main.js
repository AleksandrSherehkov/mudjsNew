import * as bootstrap from 'bootstrap';
// Expose Bootstrap to global scope for use in other modules
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

window.addEventListener('beforeunload', function () {
  return 'leaving already?';
});

document.addEventListener('DOMContentLoaded', function () {
  const logsButton = document.getElementById('logs-button');
  if (logsButton) {
    logsButton.addEventListener('click', function (e) {
      var logs = [];

      e.preventDefault();

      historydb
        .then(function (db) {
          return db.load(null, false, 100000000, function (key, value) {
            logs.push(value);
          });
        })
        .then(function () {
          var blobOpts = { type: 'text/html' },
            blob = new Blob(logs, blobOpts),
            url = URL.createObjectURL(blob);

          logs = null;

          // create a link
          var link = document.createElement('a');
          link.href = url;
          link.download = 'mudjs.log';

          // click on it
          setTimeout(function () {
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent(
              'click',
              true,
              true,
              window,
              1,
              0,
              0,
              0,
              0,
              false,
              false,
              false,
              false,
              0,
              null
            );
            link.dispatchEvent(event);
          }, 10);
        });
    });
  }

  const mapButton = document.getElementById('map-button');
  if (mapButton) {
    mapButton.addEventListener('click', function (e) {
      e.preventDefault();

      if (!lastLocation()) {
        return;
      }

      var basefilename = lastLocation().area.replace(/\.are$/, '');
      var mapfile = '/maps/' + basefilename + '.html?sessionId=' + sessionId;
      window.open(mapfile);
    });
  }

  connect();
  initTerminalFontSize();

  /*
   * Handlers for plus-minus buttons to change terminal font size.
   */
  var fontDelta = 2;
  var terminalFontSizeKey = 'terminalFontSize';

  function changeFontSize(delta) {
    var terminal = document.querySelector('.terminal');
    if (terminal) {
      var style = window.getComputedStyle(terminal);
      var fontSize = parseFloat(style.fontSize);
      terminal.style.fontSize = (fontSize + delta) + 'px';
      localStorage.setItem(terminalFontSizeKey, fontSize + delta);
      propertiesStorage['terminalFontSize'] = fontSize + delta;
      localStorage.properties = JSON.stringify(propertiesStorage);
    }
  }

  function initTerminalFontSize() {
    var cacheFontSize = localStorage.properties
      ? JSON.parse(localStorage.properties)['terminalFontSize']
      : propertiesStorage;
    if (cacheFontSize != null) {
      var terminal = document.querySelector('.terminal');
      if (terminal) {
        terminal.style.fontSize = cacheFontSize + 'px';
      }
    }
  }

  const fontPlusButton = document.getElementById('font-plus-button');
  if (fontPlusButton) {
    fontPlusButton.addEventListener('click', function (e) {
      e.preventDefault();
      changeFontSize(fontDelta);
    });
  }

  const fontMinusButton = document.getElementById('font-minus-button');
  if (fontMinusButton) {
    fontMinusButton.addEventListener('click', function (e) {
      e.preventDefault();
      changeFontSize(-fontDelta);
    });
  }

  /* Save layout size */
  const layoutSplitters = document.querySelectorAll('.layout-splitter');
  layoutSplitters.forEach(splitter => {
    splitter.addEventListener('click', function () {
      propertiesStorage['terminalLayoutWidth'] =
        document.querySelector('.terminal-wrap').getBoundingClientRect().width ||
        0;
      propertiesStorage['panelLayoutWidth'] =
        document.querySelector('#panel-wrap').getBoundingClientRect().width || 0;
      propertiesStorage['mapLayoutWidth'] =
        document.querySelector('#map-wrap').getBoundingClientRect().width || 0;
      localStorage.properties = JSON.stringify(propertiesStorage);
    });
  });
});
