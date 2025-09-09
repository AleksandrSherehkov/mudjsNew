document.addEventListener('DOMContentLoaded', () => {
  // Клик по любому элементу с атрибутом data-hint → открыть/закрыть соответствующий Bootstrap-модал
  document.body.addEventListener('click', e => {
    const hintElem = e.target.closest('[data-hint]');
    if (!hintElem) return;

    const modalId = hintElem.getAttribute('data-hint');
    const modalElement = document.getElementById(modalId);
    if (modalElement && window.bootstrap?.Modal) {
      new window.bootstrap.Modal(modalElement).toggle();
    }

    e.stopPropagation();
    e.preventDefault();
  });

  // Обновление глобального объекта prompt из RPC-события
  const rpcEvents = document.getElementById('rpc-events');
  if (rpcEvents) {
    rpcEvents.addEventListener('rpc-prompt', event => {
      const b = event?.detail || {};
      if (window.mudprompt === undefined) {
        window.mudprompt = { ...b };
      } else {
        Object.assign(window.mudprompt, b);
      }
    });
  }
});
