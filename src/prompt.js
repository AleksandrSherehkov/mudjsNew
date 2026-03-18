import 'devbridge-autocomplete';

document.addEventListener('DOMContentLoaded', function () {
  // Открытие подсказочных модалок по клику (работает и по вложенным узлам)
  document.body.addEventListener(
    'click',
    function (e) {
      const trigger = e.target.closest('[data-hint]');
      if (!trigger) return;

      const idOrSelector = trigger.getAttribute('data-hint') || '';
      const modalId = idOrSelector.startsWith('#')
        ? idOrSelector.slice(1)
        : idOrSelector;

      const modalElement = document.getElementById(modalId);
      if (modalElement && window.bootstrap && window.bootstrap.Modal) {
        e.preventDefault(); // чтобы не "проваливаться" по ссылкам и т.п.
        new window.bootstrap.Modal(modalElement).toggle();
      }
    },
    { passive: false }
  );

  // Слушаем события от сервера и обновляем глобальный mudprompt
  const rpcEvents = document.getElementById('rpc-events');
  if (rpcEvents) {
    rpcEvents.addEventListener('rpc-prompt', function (e) {
      const b = e.detail[0];
      if (window.mudprompt === undefined) {
        window.mudprompt = b;
      } else {
        Object.assign(window.mudprompt, b);
      }
    });
  }
});
