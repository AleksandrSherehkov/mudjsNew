import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { subscribeToMessages } from '../../playerMessagesStore';

// 💬 Иконки по типу
const getIcon = (type = '') => {
  switch (type) {
    case 'say':
    case 'pronounce':
      return '🗣️';
    case 'shout':
      return '📣';
    case 'talk':
      return '💬';
    case 'sing':
      return '🎵';
    case 'ooc':
      return '🎭';
    case 'congrats':
      return '🎉';

    case 'clan-shalafi':
      return '🧠';
    case 'clan-invader':
      return '☠️';
    case 'clan-battlerager':
      return '🪓';
    case 'clan-knight':
      return '🛡️';
    case 'clan-ruler':
      return '👑';
    case 'clan-chaos':
      return '💥';
    case 'clan-hunter':
      return '🏹';
    case 'clan-lion':
      return '🦁';
    case 'clan-ghost':
      return '👻';
    case 'clan-flowers':
      return '🌸';

    default:
      return '💭';
  }
};

export default function PlayerMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(setMessages);
    return () => unsubscribe();
  }, []);

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        backgroundColor: '#111',
        color: '#ccc',
        padding: '0.5em',
        fontSize: '0.85em',
      }}
    >
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`chat-line ${msg.type || ''}`}
          style={{
            fontWeight: msg.fromMe ? 'bold' : 'normal',

            backgroundColor: msg.fromMe ? '#222' : 'transparent',
            borderLeft: msg.fromMe ? '3px solid #66ff66' : 'none',
            paddingLeft: '0.3em',
            borderRadius: '2px',
          }}
        >
          <span style={{ marginRight: '0.5em' }}>{getIcon(msg.type)}</span>
          {msg.text}
        </div>
      ))}
    </Box>
  );
}
