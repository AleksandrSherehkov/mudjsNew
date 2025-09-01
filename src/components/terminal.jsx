import React from 'react';
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

import historyDb from '../historydb';
import ansi2html from '../ansi2html';
import manip from '../manip';
import { processTriggers } from './sysCommands/action';

// TODO: the following parameters should be replaced with two numbers - viewport size (in pixels) and the threshold (in pixels)
const bytesToLoad = 100000; // how much stuff to load from the database in one go, when we hit the threshold (bytes)
const scrollThreshold = 1000; // when to start loading more data (px)
const maxBytesOnScreen = 1000000;

var firstChunkId = -1; // id of the first chunk in history (only set when scrolled to the very top)
var lastChunkId = -1; // id of the last chunk sent to the terminal
var scrolling = false;
var autoScrollEnabled = true;

const loadChunks = (startId, direction, maxlen) => {
  const chunks = [];

  return historyDb
    .then(db =>
      db.load(startId, direction, maxlen, (id, value) =>
        chunks.push({ id, value })
      )
    )
    .then(() => {
      // direction is backward, we start from the very bottom => the first returned record has the last chunk id
      if (!startId && direction && chunks.length > 0)
        lastChunkId = chunks[0].id;

      // direction is backward, we have initial key and no records returned => initial key is the first one in the database
      if (startId && direction && chunks.length === 0) firstChunkId = startId;

      return chunks.map(({ id, value }) => {
        const div = document.createElement('div');
        div.innerHTML = value;
        div.setAttribute('data-chunk-id', id);
        return div;
      });
    });
};

function terminalInit(wrap) {
  const terminal = wrap.querySelector('.terminal');

  const append = chunk => {
    terminal.appendChild(chunk);

    while (terminal.innerHTML.length > maxBytesOnScreen) {
      if (terminal.firstElementChild) {
        terminal.removeChild(terminal.firstElementChild);
      }
    }

    wrap.scrollTop = terminal.scrollHeight;
  };
  
  const atBottom = () => {
    const lastMessage = terminal.lastElementChild;
    if (!lastMessage) return true;

    const lastMessageRect = lastMessage.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    
    const lastMessageBottom = lastMessageRect.bottom;
    const wrapBottom = wrapRect.bottom;

    const isAtBottom = lastMessageBottom <= wrapBottom;

    return isAtBottom;
  };

  const loadTop = (startId, len) => {
    scrolling = true;

    return loadChunks(startId, true, len).then(chunks =>
      chunks.forEach(chunk => terminal.insertBefore(chunk, terminal.firstChild))
    );
  };

  const loadBottom = (startId, len) => {
    scrolling = true;

    return loadChunks(startId, false, len).then(chunks =>
      chunks.forEach(chunk => terminal.appendChild(chunk))
    );
  };

  const scrollToBottom = () => {
    wrap.scrollTop = 0;
    terminal.innerHTML = '';

    return loadTop(null, maxBytesOnScreen).then(() => {
      wrap.scrollTop = terminal.scrollHeight;
      scrolling = false;
    }); // scroll to the bottom
  };

  wrap.addEventListener('scroll-to-bottom', () => scrollToBottom());

  terminal.addEventListener('output', function (e) {
    const txt = e.detail;
    const span = document.createElement('span');
    span.innerHTML = ansi2html(txt);

    manip.colorParseAndReplace(span);
    manip.manipParseAndReplace(span);

    const outputEvent = new CustomEvent('output-html', { detail: span.innerHTML });
    terminal.dispatchEvent(outputEvent);
  });

  // this may not be called from outside of terminal logic.
  terminal.addEventListener('output-html', function (e) {
    const html = e.detail;
    historyDb
      .then(db => db.append(html))
      .then(id => {
        const chunk = document.createElement('div');
        chunk.innerHTML = html;
        chunk.setAttribute('data-chunk-id', id);

        const manipCmds = chunk.querySelectorAll('.manip-cmd');
        manipCmds.forEach(function (element) {
          element.setAttribute('role', 'link');
          element.setAttribute('tabindex', '0');
        });
        // only append a DOM node if we're at the bottom
        if (autoScrollEnabled) {
          append(chunk);
        } else {
          const bumpEvent = new CustomEvent('bump-unread', { detail: [] });
          wrap.dispatchEvent(bumpEvent);
        }

        lastChunkId = id;

        // Transform output into clean text and call user-defined triggers.
        const chunkCopy = chunk.cloneNode(true);
        const noTriggers = chunkCopy.querySelectorAll('.no-triggers');
        noTriggers.forEach(el => el.remove());
        
        const lines = chunkCopy.textContent.replace(/\xa0/g, ' ').split('\n');
        lines.forEach(line => {
          processTriggers(line);
          const trigger = document.querySelector('.trigger');
          if (trigger) {
            const event = new CustomEvent('text', { detail: '' + line });
            trigger.dispatchEvent(event);
          }
        });
      });
  });

  wrap.addEventListener('scroll', () => {
    autoScrollEnabled = atBottom();

    // We are already handling a scroll event.
    // Don't trigger another database operation until the current one completed.
    if (scrolling) {
      // Prevent scrolling, so that the user won't hit the limits of the scrolling window.
      // e.preventDefault();
      return;
    }

    // Load top chunks while scrolling up.
    if (wrap.scrollTop < scrollThreshold) {
      let firstChunk = terminal.querySelector('div[data-chunk-id]:first-child');

      // terminal is empty, can't scroll
      if (!firstChunk) return;

      let firstRect = firstChunk.getBoundingClientRect();
      let firstOff = firstRect.top;
      let fstId = parseInt(firstChunk.getAttribute('data-chunk-id'));

      if (fstId === firstChunkId) {
        // We're at the very top, no need to load anything
        return;
      }

      loadTop(fstId, bytesToLoad).then(() => {
        while (terminal.innerHTML.length > maxBytesOnScreen) {
          if (terminal.lastElementChild) {
            terminal.removeChild(terminal.lastElementChild);
          }
        }

        const newFirstRect = firstChunk.getBoundingClientRect();
        wrap.scrollTop = wrap.scrollTop + newFirstRect.top - firstOff;
        scrolling = false;
      });

      return;
    }

    // Load bottom chunks while scrolling down.
    if (
      wrap.scrollTop >
      terminal.scrollHeight - wrap.clientHeight - scrollThreshold
    ) {
      let lastChunk = terminal.querySelector('div[data-chunk-id]:last-child');

      // terminal is empty, can't scroll
      if (!lastChunk) return;

      let lastRect = lastChunk.getBoundingClientRect();
      let lastOff = lastRect.top;
      let lstId = parseInt(lastChunk.getAttribute('data-chunk-id'));

      // The last html element in the DOM is the last sent message,
      // so we're at the bottom, no need to load anything.
      if (lstId === lastChunkId) {
        // Check if we can reset the unread counter and return
        if (atBottom()) {
          const resetEvent = new CustomEvent('reset-unread', { detail: [] });
          wrap.dispatchEvent(resetEvent);
        }

        return;
      }

      loadBottom(lstId, bytesToLoad).then(() => {
        while (terminal.innerHTML.length > maxBytesOnScreen) {
          if (terminal.firstElementChild) {
            terminal.removeChild(terminal.firstElementChild);
          }
        }

        const newLastRect = lastChunk.getBoundingClientRect();
        wrap.scrollTop = wrap.scrollTop + newLastRect.top - lastOff;
        scrolling = false;
      });

      return;
    }
  });

  scrollToBottom().then(() => {
    const echo = html => {
      const event = new CustomEvent('output-html', { detail: html });
      terminal.dispatchEvent(event);
    };

    echo('<hr>');
    echo(
      ansi2html(
        '\u001b[1;31m#################### ИСТОРИЯ ЧАТА ЗАГРУЖЕНА ####################\u001b[0;37m\n'
      )
    );
    echo('<hr>');
  });

  return () => {
    // Clean up event listeners - in vanilla JS this requires more careful tracking
    // For now, we'll rely on React's cleanup
  };
}

const Terminal = forwardRef(({ bumpUnread, resetUnread }, ref) => {
  const wrap = useRef();

  useEffect(() => terminalInit(wrap.current), [wrap]);

  useEffect(() => {
    const current = wrap.current;
    if (current) {
      current.addEventListener('bump-unread', bumpUnread);
      return () => current.removeEventListener('bump-unread', bumpUnread);
    }
  }, [wrap, bumpUnread]);

  useEffect(() => {
    const current = wrap.current;
    if (current) {
      current.addEventListener('reset-unread', resetUnread);
      return () => current.removeEventListener('reset-unread', resetUnread);
    }
  }, [wrap, resetUnread]);

  useEffect(() => {
    const enableAutoScroll = () => {
      autoScrollEnabled = true; // Включаем автоскролл
    };

    document.addEventListener('click', enableAutoScroll);
    document.addEventListener('keydown', enableAutoScroll);
    document.addEventListener('input', enableAutoScroll);
    document.addEventListener('change', enableAutoScroll);

    return () => {
      document.removeEventListener('click', enableAutoScroll);
      document.removeEventListener('keydown', enableAutoScroll);
      document.removeEventListener('input', enableAutoScroll);
      document.removeEventListener('change', enableAutoScroll);
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      scrollToBottom: () => {
        const current = wrap.current;
        if (current) {
          const event = new CustomEvent('scroll-to-bottom', { detail: [] });
          current.dispatchEvent(event);
        }
      },
    }),
    [wrap]
  );

  return (
    <div className="terminal-wrap" ref={wrap}>
      <div
        className="terminal"
        aria-live="polite"
        aria-relevant="additions"
      ></div>
    </div>
  );
});

export default Terminal;
