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
      terminal.dispatchEvent(new CustomEvent('output-html', { detail: output.outerHTML }));
    }
  } else {
    const terminal = document.querySelector('.terminal');
    if (terminal) {
      terminal.dispatchEvent(new CustomEvent('output', { detail: '\n' }));
    }
  }
}

// Set up triggers event listener when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  const triggers = document.getElementById('triggers');
  if (triggers) {
    triggers.addEventListener('input', function (e) {
      send(e.detail);
    });
  }
});

export { echo };
