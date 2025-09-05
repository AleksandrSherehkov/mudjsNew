import getSessionId from './sessionid.js';
import placeholders from './data/placeholders.json';

const sessionId = getSessionId();
var lastLocation, locationChannel;

if ('BroadcastChannel' in window) {
  locationChannel = new BroadcastChannel('location');

  locationChannel.onmessage = function (e) {
    if (e.data.what === 'where am i' && lastLocation) {
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
      sessionId: sessionId,
    });
  }
}

/** 
  Choose a placeholder text for the main command input. Placeholders are 
  kept in a json file, per each area and room vnum or generic ones (*).
  Room placeholders can be an array of hint commands, or an entire hint string.
 */
function createPlaceholder(loc) {
  if (!placeholders) return '';

  var areahint = placeholders[loc.area] || placeholders['*'];
  if (!areahint) return '';

  var roomhints = areahint[loc.vnum] || areahint['*'];
  if (!roomhints) return '';

  if (typeof roomhints === 'string') return roomhints;

  if (Array.isArray(roomhints)) {
    var index;

    if (roomhints.length === 0) return '';

    // When just entered a new room, show the first hint as the 'main' one.
    if (!lastLocation || loc.vnum !== lastLocation.vnum) index = 0;
    else index = Math.floor(Math.random() * roomhints.length);

    return 'Введи команду, например: ' + roomhints[index];
  }

  return '';
}

document.addEventListener('DOMContentLoaded', function () {
  const rpcEvents = document.getElementById('rpc-events');
  if (rpcEvents) {
    rpcEvents.addEventListener('rpc-prompt', function (e) {
      const b = e.detail[0];
      const loc = {
        area: b.area,
        vnum: b.vnum,
      };
      const inputElement = document.querySelector('#input input');
      if (inputElement) {
        inputElement.setAttribute('placeholder', createPlaceholder(loc));
      }
      bcastLocation(loc);
    });
  }
});

export default function getLastLocation() {
  return lastLocation;
}
