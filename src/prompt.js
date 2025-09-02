import { onDocumentReady, onDelegate, on, attr } from './utils/domUtils.js';

onDocumentReady(function () {
  // Обработка клика по элементам с data-hint
  onDelegate('body', 'click', '[data-hint]', function (e) {
    const modalElement = document.getElementById(attr(this, 'data-hint'));
    if (modalElement && window.bootstrap && window.bootstrap.Modal) {
      const modal = new window.bootstrap.Modal(modalElement);
      modal.toggle();
    }
    e.stopPropagation();
    e.preventDefault();
  });

  // Слушаем события от сервера и обновляем глобальный mudprompt
  on('#rpc-events', 'rpc-prompt', function (e) {
    const b = e.detail[0];
    if (window.mudprompt === undefined) {
      window.mudprompt = b;
    } else {
      Object.assign(window.mudprompt, b);
    }
  });
});
