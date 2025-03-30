import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { subscribeToMessages } from '../../playerMessagesStore';

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
        <div key={i}>{msg}</div>
      ))}
    </Box>
  );
}
