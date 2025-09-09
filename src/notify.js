let notificationPermission = Notification.permission;
let clickHandlerAttached = false;

// Один раз регистрируем обработчик после первого клика
function attachClickHandler() {
  if (clickHandlerAttached) return;
  clickHandlerAttached = true;
  
  document.addEventListener('click', () => {
    if ('Notification' in window && notificationPermission !== 'granted') {
      Notification.requestPermission().then(perm => {
        notificationPermission = perm;
      });
    }
  }, { once: true });
}

// Регистрация события при готовности документа
function setupNotifications() {
  if ('Notification' in window && notificationPermission === 'granted') {
    const rpcEvents = document.getElementById('rpc-events');
    if (rpcEvents) {
      rpcEvents.addEventListener('rpc-notify', function (e) {
        if (document.hidden) {
          new Notification(e.detail);
        }
      });
    }
  }
}

// Инициализация
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    attachClickHandler();
    setupNotifications();
  });
} else {
  attachClickHandler();
  setupNotifications();
}

// Функция вызова уведомления
export default function notify(txt) {
  const rpcEvents = document.getElementById('rpc-events');
  if (rpcEvents) {
    rpcEvents.dispatchEvent(new CustomEvent('rpc-notify', { detail: txt }));
  }
}
