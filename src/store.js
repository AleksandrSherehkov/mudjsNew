import { combineReducers, legacy_createStore as createStore } from 'redux';

// Reducer для з'єднання
const connection = (state = {}, action) => {
  switch (action.type) {
    case 'CONNECTED':
      return { ...state, connected: true };
    case 'DISCONNECTED':
      return { ...state, connected: false };
    default:
      return state;
  }
};

// Reducer для промпта
const prompt = (state = null, action) => {
  switch (action.type) {
    case 'DISCONNECTED':
      return null;
    case 'NEW_PROMPT':
      return { ...(state || {}), ...action.changes };
    default:
      return state;
  }
};

// Екшени
const onConnected = () => ({ type: 'CONNECTED' });
const onDisconnected = () => ({ type: 'DISCONNECTED' });
const onNewPrompt = changes => ({ type: 'NEW_PROMPT', changes });

// Комбінований reducer та store
const reducer = combineReducers({ connection, prompt });
const store = createStore(reducer);

// Підписка на подію 'rpc-prompt' для оновлення стану prompt
function attachRpcPromptListener() {
  const rpcEventsElem = document.getElementById('rpc-events');
  if (!rpcEventsElem) return;
  rpcEventsElem.addEventListener('rpc-prompt', event => {
    const b = event?.detail || {};
    store.dispatch(onNewPrompt(b));
  });
}

// Якщо DOM вже готовий — підключаємо одразу; інакше — після завантаження
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachRpcPromptListener, {
    once: true,
  });
} else {
  attachRpcPromptListener();
}

export { store, onConnected, onDisconnected };
