// src/components/windowletsPanel/playerMessagesStore.js

import $ from 'jquery';

const MAX_MESSAGES = 50;
const globalMessages = [];

const listeners = new Set();

const notifyListeners = () => {
  const current = [...globalMessages];
  listeners.forEach(listener => listener(current));
};

// Працює постійно незалежно від монтованих компонентів
const handler = (e, text) => {
  const triggers = {
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

  const found = Object.entries(triggers).find(([key]) => text.includes(key));

  if (found) {
    const [, type] = found;
    globalMessages.push({ text, type });
    if (globalMessages.length > MAX_MESSAGES) {
      globalMessages.splice(0, globalMessages.length - MAX_MESSAGES);
    }
    notifyListeners();
  }
};

if (typeof window !== 'undefined' && !window._playerChatInitialized) {
  $('.trigger').on('text', handler);
  window._playerChatInitialized = true;
}

// API
export function subscribeToMessages(callback) {
  listeners.add(callback);
  callback([...globalMessages]); // init
  return () => listeners.delete(callback);
}
