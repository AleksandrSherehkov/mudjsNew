import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import $ from 'jquery';

// 🧠 Глобальное хранилище сообщений (в модуле)
const globalMessages = [];

export default function PlayerMessages() {
  const [messages, setMessages] = useState([...globalMessages]);

  useEffect(() => {
    const handler = (e, text) => {
      const triggers = [
        'говоришь',
        'говорит',
        'произносишь',
        'произносит',
        'внероли',
        'ПОЕТ',
        'поешь',
        'кричишь',
        'кричит',
        'болтаешь',
        'болтает',
        'OOC',
        'поздравляешь',
        'поздравляет',
        'SHALAFI',
        'INVAYDER',
      ];

      const matchesTrigger = triggers.some(trigger => text.includes(trigger));
      const matchesBracketed = /\[[^\]]+\]/.test(text); // [что-угодно]

      if (matchesTrigger || matchesBracketed) {
        globalMessages.push(text);
        if (globalMessages.length > 50) {
          globalMessages.splice(0, globalMessages.length - 50);
        }
        setMessages([...globalMessages]);
      }
    };

    $('.trigger').on('text', handler);
    return () => $('.trigger').off('text', handler);
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
        <div key={i}>{msg}</div>
      ))}
    </Box>
  );
}
