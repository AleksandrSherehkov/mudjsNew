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
      return { ...state, ...action.changes };
    default:
      return state;
  }
};

// Екшени
const onConnected = () => ({ type: 'CONNECTED' });
const onDisconnected = () => ({ type: 'DISCONNECTED' });
const onNewPrompt = changes => ({ type: 'NEW_PROMPT', changes });

// Комбінований reducer
const reducer = combineReducers({ connection, prompt });

// ✅ Створюємо store без middleware
const store = createStore(reducer);

// Прив'язуємо івент на зміну промпта
document.addEventListener('DOMContentLoaded', () => {
  const rpcEvents = document.getElementById('rpc-events');
  if (rpcEvents) {
    rpcEvents.addEventListener('rpc-prompt', (e) => {
      const b = e.detail;
      store.dispatch(onNewPrompt(b));
    });
  }
});

export { store, onConnected, onDisconnected };
