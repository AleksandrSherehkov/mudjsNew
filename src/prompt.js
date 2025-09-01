import 'devbridge-autocomplete';

document.addEventListener('DOMContentLoaded', function () {
  // Обработка клика по элементам с data-hint
  document.body.addEventListener('click', function (e) {
    const target = e.target.closest('[data-hint]');
    if (target) {
      const hintId = target.getAttribute('data-hint');
      const modalElement = document.getElementById(hintId);
      if (modalElement) {
        // For Bootstrap 4, we need to trigger the modal manually
        if (window.bootstrap && window.bootstrap.Modal) {
          const modal = new window.bootstrap.Modal(modalElement);
          modal.toggle();
        } else if (modalElement.classList.contains('modal')) {
          // Fallback for older Bootstrap versions
          modalElement.style.display = modalElement.style.display === 'block' ? 'none' : 'block';
          modalElement.classList.toggle('show');
        }
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
