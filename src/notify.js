let notificationPermission = Notification.permission;

// Один раз реєструємо обробник після першого кліку
document.addEventListener('click', function requestNotificationPermission() {
  if ('Notification' in window && notificationPermission !== 'granted') {
    Notification.requestPermission().then(perm => {
      notificationPermission = perm;
    });
  }
  // Remove this event listener after first click
  document.removeEventListener('click', requestNotificationPermission);
}, { once: true });

// Реєстрація події при готовності документа
document.addEventListener('DOMContentLoaded', function () {
  if ('Notification' in window && notificationPermission === 'granted') {
    const rpcEvents = document.getElementById('rpc-events');
    if (rpcEvents) {
      rpcEvents.addEventListener('rpc-notify', function (e) {
        const text = e.detail;
        if (document.hidden) {
          new Notification(text);
        }
      });
    }
  }
});

// Функція виклику повідомлення
export default function notify(txt) {
  const rpcEvents = document.getElementById('rpc-events');
  if (rpcEvents) {
    const event = new CustomEvent('rpc-notify', { detail: txt });
    rpcEvents.dispatchEvent(event);
  }
}
