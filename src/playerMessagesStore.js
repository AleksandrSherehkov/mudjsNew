const MAX_MESSAGES = 50;
const globalMessages = [];
const listeners = new Set();

function notifyListeners() {
  const snapshot = [...globalMessages];
  listeners.forEach(listener => listener(snapshot));
}

// Классификация сообщений по ключевым словам
const TRIGGERS = {
  говоришь: 'say',
  говорит: 'say',
  произносишь: 'pronounce',
  произносит: 'pronounce',
  внероли: 'ooc',
  ПОЕТ: 'sing',
  ПОЕШ: 'sing',
  кричишь: 'shout',
  кричит: 'shout',
  болтаешь: 'talk',
  болтает: 'talk',
  OOC: 'ooc',
  поздравляешь: 'congrats',
  поздравляет: 'congrats',
  SHALAFI: 'clan-shalafi',
  INVADER: 'clan-invader',
  BATTLERAGER: 'clan-battlerager',
  KNIGHT: 'clan-knight',
  RULER: 'clan-ruler',
  CHAOS: 'clan-chaos',
  HUNTER: 'clan-hunter',
  LION: 'clan-lion',
  GHOST: 'clan-ghost',
  'FLOWER CHILDREN': 'clan-flowers',
};

function classifyMessage(text) {
  if (!text) return null;
  const entry = Object.entries(TRIGGERS).find(([key]) => text.includes(key));
  if (!entry) return null;
  const [, type] = entry;
  const fromMe = text.startsWith('** Ты ') || text.startsWith('Ты ');
  return { text, type, fromMe };
}

function addMessage(text) {
  const rec = classifyMessage(text);
  if (!rec) return; // игнор, если не подходит под триггеры

  globalMessages.push(rec);
  if (globalMessages.length > MAX_MESSAGES) {
    globalMessages.splice(0, globalMessages.length - MAX_MESSAGES);
  }
  notifyListeners();
}

export const clearMessages = () => {};

if (typeof window !== 'undefined' && !window._playerChatInitialized) {
  // слушаем кастомные события 'text' от элементов с классом .trigger
  document.querySelectorAll('.trigger').forEach(elem => {
    elem.addEventListener('text', event => {
      const line = event?.detail;
      if (typeof line === 'string') addMessage(line);
    });
  });
  window._playerChatInitialized = true;
}

export function subscribeToMessages(callback) {
  listeners.add(callback);
  callback([...globalMessages]); // сразу отдаём текущее состояние
  return () => listeners.delete(callback);
}
