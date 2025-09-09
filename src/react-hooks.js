import { useState, useEffect } from 'react';

export function usePrompt() {
  const [prompt, setPrompt] = useState(window.mudprompt || {});

  useEffect(() => {
    const rpcEventsElem = document.getElementById('rpc-events');
    if (!rpcEventsElem) return;

    const handlePromptUpdate = event => {
      const b = event?.detail || {};
      setPrompt(prev => ({ ...prev, ...b }));
    };

    rpcEventsElem.addEventListener('rpc-prompt', handlePromptUpdate);

    // Очистка при размонтировании
    return () => {
      rpcEventsElem.removeEventListener('rpc-prompt', handlePromptUpdate);
    };
  }, []);

  return prompt;
}
