import getSessionId from './sessionid.js';
import placeholders from './data/placeholders.json';

const sessionId = getSessionId();
let lastLocation;
let locationChannel;

// Канал вещания текущей локации между вкладками
if ('BroadcastChannel' in window) {
  locationChannel = new BroadcastChannel('location');
  locationChannel.onmessage = e => {
    if (e?.data?.what === 'where am i' && lastLocation) {
      bcastLocation(lastLocation);
    }
  };
}

function bcastLocation(loc) {
  lastLocation = loc;
  if (locationChannel) {
    locationChannel.postMessage({
      what: 'location',
      location: lastLocation,
      sessionId,
    });
  }
}

/**
 * Выбор текста placeholder для главного поля ввода.
 * Подсказки хранятся в JSON по area/vnum или в '*'.
 */
function createPlaceholder(loc) {
  if (!placeholders || !loc) return '';

  const areahint = placeholders[loc.area] || placeholders['*'];
  if (!areahint) return '';

  const roomhints = areahint[loc.vnum] || areahint['*'];
  if (!roomhints) return '';

  if (typeof roomhints === 'string') return roomhints;

  if (Array.isArray(roomhints)) {
    if (roomhints.length === 0) return '';
    let index;
    // При входе в новую комнату — первый хинт как основной
    if (!lastLocation || loc.vnum !== lastLocation.vnum) index = 0;
    else index = Math.floor(Math.random() * roomhints.length);
    return 'Введи команду, например: ' + roomhints[index];
  }

  return '';
}

document.addEventListener('DOMContentLoaded', () => {
  // Подписка на обновление prompt от сервера
  const rpcEvents = document.getElementById('rpc-events');
  if (!rpcEvents) return;

  rpcEvents.addEventListener('rpc-prompt', event => {
    const b = event?.detail || {};
    const loc = { area: b.area, vnum: b.vnum };

    const inputField = document.querySelector('#input input');
    if (inputField) {
      inputField.setAttribute('placeholder', createPlaceholder(loc));
    }
    bcastLocation(loc);
  });
});

export default function getLastLocation() {
  return lastLocation;
}
