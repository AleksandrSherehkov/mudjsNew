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
document.addEventListener('DOMContentLoaded', function () {
  if ('Notification' in window && notificationPermission === 'granted') {
    const rpcEvents = document.getElementById('rpc-events');
    if (rpcEvents) {
      rpcEvents.addEventListener('rpc-notify', function (e) {
        if (document.hidden) {
          new Notification(e.detail[0]);
        }
      });
    }
  }
});

// Функція виклику повідомлення
export default function notify(txt) {
  const rpcEvents = document.getElementById('rpc-events');
  if (rpcEvents) {
    rpcEvents.dispatchEvent(new CustomEvent('rpc-notify', { detail: [txt] }));
  }
}
