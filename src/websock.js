import { store, onConnected, onDisconnected } from './store.js';
import Telnet from './telnet';

const PROTO_VERSION = 'DreamLand Web Client/2.1';

let wsUrl = 'wss://dreamland.rocks/dreamland';
let ws = null;

if (globalThis.location.hash === '#build') {
  wsUrl = 'wss://dreamland.rocks/buildplot';
} else if (globalThis.location.hash === '#local') {
  wsUrl = 'ws://localhost:1234';
}

function rpccmd(cmd, ...args) {
  if (ws) {
    ws.send(JSON.stringify({ command: cmd, args }));
  }
}

function send(text) {
  rpccmd('console_in', text + '\n');
}

function processOutput(s) {
  document.querySelectorAll('.terminal').forEach(termEl => {
    termEl.dispatchEvent(new CustomEvent('output', { detail: s }));
  });
}

/* =========================
 * Telnet + RPC event wiring
 * ========================= */
const telnet = new Telnet();
telnet.handleRaw = s => {
  processOutput(s);
};

function attachRpcHandlers() {
  const rpc = document.getElementById('rpc-events');
  if (!rpc) return;

  // console_out: первый аргумент detail[0]
  rpc.addEventListener('rpc-console_out', e => {
    const payload = Array.isArray(e.detail) ? e.detail[0] : e.detail;
    telnet.process(payload);
  });

  // alert: первый аргумент detail[0]
  rpc.addEventListener('rpc-alert', e => {
    const msg = Array.isArray(e.detail) ? e.detail[0] : e.detail;
    if (msg != null) alert(String(msg));
  });

  // version: [version, nonce]
  rpc.addEventListener('rpc-version', e => {
    const version = e.detail?.[0];
    const nonce = e.detail?.[1];
    console.log('rpc-version', version, nonce);

    if (version !== PROTO_VERSION) {
      processOutput(
        `\n\u001b[1;31mВерсия клиента (${PROTO_VERSION}) не совпадает с версией сервера (${version}).\n` +
          'Обнови страницу, если не поможет - почисти кеши.\u001b[0;37m\n'
      );
      if (ws) ws.close();
      return;
    }
    if (ws) ws.nonce = nonce;
  });
}

// Подключаем обработчики, когда DOM готов
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachRpcHandlers, {
    once: true,
  });
} else {
  attachRpcHandlers();
}

/* =========================
 * WebSocket lifecycle
 * ========================= */
function connect() {
  ws = new WebSocket(wsUrl, ['binary']);
  ws.binaryType = 'arraybuffer';

  ws.onmessage = e => {
    let b = new Uint8Array(e.data);
    // Декодирование, совместимое с оригиналом
    b = String.fromCharCode.apply(null, b);
    b = decodeURIComponent(escape(b));
    const msg = JSON.parse(b);

    const rpc = document.getElementById('rpc-events');
    if (rpc) {
      const eventName = 'rpc-' + msg.command;
      const detailData = msg.args || [];
      rpc.dispatchEvent(new CustomEvent(eventName, { detail: detailData }));
    }
  };

  ws.onopen = () => {
    send('1');
  };

  ws.onclose = () => {
    processOutput(
      '\u001b[1;31m#################### DISCONNECTED ####################\u001b[0;37m\n'
    );
    ws = null;
    store.dispatch(onDisconnected());
  };

  processOutput('Connecting....\n');
  store.dispatch(onConnected());
}

export { send, rpccmd, connect, ws };
