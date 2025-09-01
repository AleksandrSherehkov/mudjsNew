import { store, onConnected, onDisconnected } from './store.js';
import Telnet from './telnet';

const PROTO_VERSION = 'DreamLand Web Client/2.1';

let wsUrl = 'wss://dreamland.rocks/dreamland';
let ws;

if (globalThis.location.hash === '#build') {
  wsUrl = 'wss://dreamland.rocks/buildplot';
} else if (globalThis.location.hash === '#local') {
  wsUrl = 'ws://localhost:1234';
}

function rpccmd(cmd, ...args) {
  if (ws) {
    ws.send(
      JSON.stringify({
        command: cmd,
        args: args,
      })
    );
  }
}

function send(text) {
  rpccmd('console_in', text + '\n');
}

function process(s) {
  const terminal = document.querySelector('.terminal');
  if (terminal) {
    const event = new CustomEvent('output', { detail: s });
    terminal.dispatchEvent(event);
  }
}

// attach default RPC handlers
document.addEventListener('DOMContentLoaded', function () {
  const telnet = new Telnet();
  const rpcEvents = document.getElementById('rpc-events');

  telnet.handleRaw = function (s) {
    process(s);
  };

  if (rpcEvents) {
    rpcEvents.addEventListener('rpc-console_out', function (e) {
      const b = e.detail;
      telnet.process(b);
    });

    rpcEvents.addEventListener('rpc-alert', function (e) {
      const b = e.detail;
      alert(b);
    });

    rpcEvents.addEventListener('rpc-version', function (e) {
      const [version, nonce] = e.detail;
      console.log('rpc-version', version, nonce);

      if (version !== PROTO_VERSION) {
        process(
          '\n\u001b[1;31mВерсия клиента (' +
            PROTO_VERSION +
            ') не совпадает с версией сервера (' +
            version +
            ').\n' +
            'Обнови страницу, если не поможет - почисти кеши.\u001b[0;37m\n'
        );
        ws.close();
      }

      ws.nonce = nonce;
    });
  }
});

function connect() {
  ws = new WebSocket(wsUrl, ['binary']);

  ws.binaryType = 'arraybuffer';

  ws.onmessage = function (e) {
    let b = new Uint8Array(e.data);
    b = String.fromCharCode.apply(null, b);
    b = decodeURIComponent(escape(b));
    b = JSON.parse(b);
    
    const rpcEvents = document.getElementById('rpc-events');
    if (rpcEvents) {
      const event = new CustomEvent('rpc-' + b.command, { detail: b.args });
      rpcEvents.dispatchEvent(event);
    }
  };

  ws.onopen = function () {
    send('1');
  };

  ws.onclose = function () {
    process(
      '\u001b[1;31m#################### DISCONNECTED ####################\u001b[0;37m\n'
    );
    ws = null;
    store.dispatch(onDisconnected());
  };

  process('Connecting....\n');
  store.dispatch(onConnected());
}

export { send, rpccmd, connect, ws };
