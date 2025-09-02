import { onDocumentReady, on, trigger, createElement } from './utils/domUtils.js';
import { send } from './websock.js';

function echo(txt) {
  if (!txt) return;

  if (txt.length !== 0) {
    const output = createElement('div', {
      class: 'echo-with-anchor',
      'aria-hidden': 'true',
      text: txt + '\n'
    });

    trigger('.terminal', 'output-html', [output.outerHTML]);
  } else {
    trigger('.terminal', 'output', '\n');
  }
}

onDocumentReady(function () {
  on('#triggers', 'input', function (e) {
    const text = e.detail[0];
    send(text);
  });
});

export { echo };
