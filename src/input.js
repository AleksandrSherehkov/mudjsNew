import { send } from './websock.js';

function echo(txt) {
  // как в оригинале: пустые/ложные значения игнорируем
  if (!txt) return;

  const outputDiv = document.createElement('div');
  outputDiv.classList.add('echo-with-anchor');
  outputDiv.setAttribute('aria-hidden', 'true');
  outputDiv.textContent = String(txt) + '\n';

  // эквивалент $('.terminal').trigger('output-html', [html])
  document.querySelectorAll('.terminal').forEach(termEl => {
    termEl.dispatchEvent(
      new CustomEvent('output-html', { detail: outputDiv.outerHTML })
    );
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const triggersElem = document.getElementById('triggers');
  if (!triggersElem) return;

  // эквивалент $('#triggers').on('input', (e, text) => send(text))
  triggersElem.addEventListener('input', event => {
    const text = event.detail; // ожидаем CustomEvent с detail = текст
    if (text) send(text);
  });
});

export { echo };
