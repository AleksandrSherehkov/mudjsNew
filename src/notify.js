import { onDocumentReady, on, trigger } from './utils/domUtils.js';

let notificationPermission = Notification.permission;

// Один раз реєструємо обробник після першого кліку
document.addEventListener('click', () => {
  if ('Notification' in window && notificationPermission !== 'granted') {
    Notification.requestPermission().then(perm => {
      notificationPermission = perm;
    });
  }
}, { once: true });

// Реєстрація події при готовності документа
onDocumentReady(function () {
  if ('Notification' in window && notificationPermission === 'granted') {
    on('#rpc-events', 'rpc-notify', function (e) {
      if (document.hidden) {
        new Notification(e.detail[0]);
      }
    });
  }
});

// Функція виклику повідомлення
export default function notify(txt) {
  trigger('#rpc-events', 'rpc-notify', [txt]);
}
