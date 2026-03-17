let currentRecognition = null;

const LEADING_PUNCTUATION_RE = /^[,.;:!?)]/;

export function setupSpeechRecognition({
  lang = 'en-US',
  onResult,
  onError,
  buttonSelector,
}) {
  const isSupported =
    'webkitSpeechRecognition' in globalThis ||
    'SpeechRecognition' in globalThis;

  if (!isSupported) {
    console.warn('Speech recognition not supported.');
    if (buttonSelector) {
      document.querySelector(buttonSelector)?.setAttribute('disabled', true);
    }
    return null;
  }

  // Завершаем старую сессию
  if (currentRecognition) {
    currentRecognition.abort();
    currentRecognition = null;
  }

  const SpeechRecognition =
    globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  currentRecognition = recognition;
  let lastTranscript = '';

  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = event => {
    const transcript = Array.from(event.results)
      .slice(event.resultIndex)
      .filter(result => result.isFinal || recognition.interimResults)
      .map(result => result[0]?.transcript ?? '')
      .join(' ')
      .trim();

    if (!transcript || transcript === lastTranscript) {
      return;
    }

    lastTranscript = transcript;
    onResult?.(transcript);
  };

  recognition.onerror = event => {
    console.error('Speech recognition error:', event.error);
    onError?.(event);
    toggleVoiceButtonClass(false);
  };

  recognition.onstart = () => {
    toggleVoiceButtonClass(true);
    playBeep(600); // старт
  };

  recognition.onend = () => {
    if (currentRecognition === recognition) {
      currentRecognition = null;
    }
    toggleVoiceButtonClass(false);
    playBeep(800); // конец
  };

  const toggleVoiceButtonClass = state => {
    const btn = document.querySelector(buttonSelector);
    if (btn) btn.classList.toggle('mic-on', state);
  };

  if (buttonSelector) {
    const button = document.querySelector(buttonSelector);
    if (button) {
      // Удаляем старый обработчик
      const clone = button.cloneNode(true);
      button.parentNode.replaceChild(clone, button);

      clone.addEventListener('click', () => {
        try {
          recognition.start();
        } catch (err) {
          console.warn('Recognition start failed:', err.message);
        }
      });
    }
  }

  return recognition;
}

export function mergeSpeechTranscript(currentText, transcript) {
  const normalizedTranscript = transcript.trim();

  if (!normalizedTranscript) {
    return currentText;
  }

  if (!currentText) {
    return normalizedTranscript;
  }

  if (LEADING_PUNCTUATION_RE.test(normalizedTranscript)) {
    return currentText.trimEnd() + normalizedTranscript;
  }

  if (/\s$/.test(currentText)) {
    return currentText + normalizedTranscript;
  }

  return `${currentText} ${normalizedTranscript}`;
}

function playBeep(frequency = 800, duration = 150) {
  const ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  oscillator.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration / 1000);
}
