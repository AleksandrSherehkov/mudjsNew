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
  const triggers = [
    'говоришь',
    'говорит',
    'произносишь',
    'произносит',
    'внероли',
    'ПОЕТ',
    'ПОЕШ',
    'кричишь',
    'кричит',
    'болтаешь',
    'болтает',
    'OOC',
    'поздравляешь',
    'поздравляет',
    'SHALAFI',
    'INVADER',
    'BATTLERAGER',
    'KNIGHT',
    'RULER',
    'CHAOS',
    'HUNTER',
    'LION',
    'GHOST',
    'FLOWER CHILDREN',
  ];

  const matchesTrigger = triggers.some(trigger => text.includes(trigger));

  if (matchesTrigger) {
    globalMessages.push(text);
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
