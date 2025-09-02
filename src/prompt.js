import 'devbridge-autocomplete';

document.addEventListener('DOMContentLoaded', function () {
  // Обработка клика по элементам с data-hint
  document.body.addEventListener('click', function (e) {
    const target = e.target.closest('[data-hint]');
    if (target) {
      const modalElement = document.getElementById(target.dataset.hint);
      if (modalElement && window.bootstrap && window.bootstrap.Modal) {
        const modal = new window.bootstrap.Modal(modalElement);
        modal.toggle();
      }
      e.stopPropagation();
      e.preventDefault();
    }
  });

  // Слушаем события от сервера и обновляем глобальный mudprompt
  const rpcEvents = document.getElementById('rpc-events');
  if (rpcEvents) {
    rpcEvents.addEventListener('rpc-prompt', function (e) {
      const b = e.detail;
      if (window.mudprompt === undefined) {
        window.mudprompt = b;
      } else {
        Object.assign(window.mudprompt, b);
      }
    });
  }
});
