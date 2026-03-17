import { useState, useEffect } from 'react';

// Called every time from render(). This function can conventially be called
// only from another use* or from render.
export function usePrompt() {
  // Get state (prompt) and setter function for this state.
  const [prompt, setPrompt] = useState(window.mudprompt || {});

  // Subscribe to prompt events only after initial render.
  // Describe the function to be called when 2nd argument changes,
  // in this case called only once.
  useEffect(() => {
    // This event handler will cause the state (prompt) to change.
    const handlePromptUpdate = (e) => setPrompt(Object.assign({}, prompt, e.detail[0]));

    // Subscribes to the custom rpc-prompt event, triggering prompt state change every time.
    const rpcEvents = document.getElementById('rpc-events');
    if (rpcEvents) {
      rpcEvents.addEventListener('rpc-prompt', handlePromptUpdate);
    }

    // This function will be called when a component (that uses this state) is about to be unmounted.
    return () => {
      if (rpcEvents) {
        rpcEvents.removeEventListener('rpc-prompt', handlePromptUpdate);
      }
    };
  });

  // Returns current state value, to be used inside a component's render() function.
  return prompt;
}
