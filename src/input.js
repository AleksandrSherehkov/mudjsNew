import { send } from './websock.js';

function echo(txt) {
  if (!txt) return;

  if (txt.length !== 0) {
    const output = document.createElement('div');
    output.className = 'echo-with-anchor';
    output.setAttribute('aria-hidden', 'true');
    output.textContent = txt + '\n';

    const terminal = document.querySelector('.terminal');
    if (terminal) {
      const event = new CustomEvent('output-html', { detail: output.outerHTML });
      terminal.dispatchEvent(event);
    }
  } else {
    const terminal = document.querySelector('.terminal');
    if (terminal) {
      const event = new CustomEvent('output', { detail: '\n' });
      terminal.dispatchEvent(event);
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const triggers = document.getElementById('triggers');
  if (triggers) {
    triggers.addEventListener('input', function (e) {
      const text = e.detail;
      send(text);
    });
  }
});

export { echo };
