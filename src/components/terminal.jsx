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

function terminalInit(wrapElement) {
  const terminal = wrapElement.querySelector('.terminal');

  const append = chunk => {
    terminal.appendChild(chunk);

    while (terminal.innerHTML.length > maxBytesOnScreen) {
      const firstChild = terminal.firstElementChild;
      if (firstChild) {
        terminal.removeChild(firstChild);
      }
    }

    wrapElement.scrollTop = terminal.offsetHeight;
  };
  const atBottom = () => {
    const lastMessage = terminal.lastElementChild;
    if (!lastMessage) return true;

    const lastMessageRect = lastMessage.getBoundingClientRect();
    const wrapRect = wrapElement.getBoundingClientRect();

    const lastMessageBottom = lastMessageRect.top + lastMessageRect.height;
    const wrapBottom = wrapRect.top + wrapRect.height;

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
    wrapElement.scrollTop = 0;
    terminal.innerHTML = '';

    return loadTop(null, maxBytesOnScreen).then(() => {
      wrapElement.scrollTop = terminal.offsetHeight;
      scrolling = false;
    }); // scroll to the bottom
  };

  // Custom event handlers
  const handleScrollToBottom = () => scrollToBottom();
  wrapElement.addEventListener('scroll-to-bottom', handleScrollToBottom);

  const handleOutput = (e) => {
    const txt = e.detail;
    const span = document.createElement('span');
    span.innerHTML = ansi2html(txt);

    manip.colorParseAndReplace(span);
    manip.manipParseAndReplace(span);

    terminal.dispatchEvent(new CustomEvent('output-html', { detail: span.innerHTML }));
  };

  // this may not be called from outside of terminal logic.
  const handleOutputHtml = (e) => {
    const html = e.detail;
    historyDb
      .then(db => db.append(html))
      .then(id => {
        const chunk = document.createElement('div');
        chunk.innerHTML = html;
        chunk.setAttribute('data-chunk-id', id);

        // Add accessibility attributes to manip commands
        const manipCmds = chunk.querySelectorAll('.manip-cmd');
        manipCmds.forEach(cmd => {
          cmd.setAttribute('role', 'link');
          cmd.setAttribute('tabindex', '0');
        });

        // only append a DOM node if we're at the bottom
        if (autoScrollEnabled) {
          append(chunk);
        } else {
          wrapElement.dispatchEvent(new CustomEvent('bump-unread'));
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
            trigger.dispatchEvent(new CustomEvent('text', { detail: line }));
          }
        });
      });
  };

  terminal.addEventListener('output', handleOutput);
  terminal.addEventListener('output-html', handleOutputHtml);

  const handleScroll = () => {
    autoScrollEnabled = atBottom();

    // We are already handling a scroll event.
    // Don't trigger another database operation until the current one completed.
    if (scrolling) {
      return;
    }

    // Load top chunks while scrolling up.
    if (wrapElement.scrollTop < scrollThreshold) {
      let firstChunk = terminal.querySelector('div[data-chunk-id]:first-child');

      // terminal is empty, can't scroll
      if (!firstChunk) return;

      let rect = firstChunk.getBoundingClientRect();
      let off = rect.top;
      let fstId = parseInt(firstChunk.getAttribute('data-chunk-id'));

      if (fstId === firstChunkId) {
        // We're at the very top, no need to load anything
        return;
      }

      loadTop(fstId, bytesToLoad).then(() => {
        while (terminal.innerHTML.length > maxBytesOnScreen) {
          const lastChild = terminal.lastElementChild;
          if (lastChild) {
            terminal.removeChild(lastChild);
          }
        }

        let newRect = firstChunk.getBoundingClientRect();
        wrapElement.scrollTop = wrapElement.scrollTop + newRect.top - off;
        scrolling = false;
      });

      return;
    }

    // Load bottom chunks while scrolling down.
    if (
      wrapElement.scrollTop >
      terminal.offsetHeight - wrapElement.offsetHeight - scrollThreshold
    ) {
      let lastChunk = terminal.querySelector('div[data-chunk-id]:last-child');

      // terminal is empty, can't scroll
      if (!lastChunk) return;

      let rect = lastChunk.getBoundingClientRect();
      let off = rect.top;
      let lstId = parseInt(lastChunk.getAttribute('data-chunk-id'));

      // The last html element in the DOM is the last sent message,
      // so we're at the bottom, no need to load anything.
      if (lstId === lastChunkId) {
        // Check if we can reset the unread counter and return
        if (atBottom()) {
          wrapElement.dispatchEvent(new CustomEvent('reset-unread'));
        }

        return;
      }

      loadBottom(lstId, bytesToLoad).then(() => {
        while (terminal.innerHTML.length > maxBytesOnScreen) {
          const firstChild = terminal.firstElementChild;
          if (firstChild) {
            terminal.removeChild(firstChild);
          }
        }

        let newRect = lastChunk.getBoundingClientRect();
        wrapElement.scrollTop = wrapElement.scrollTop + newRect.top - off;
        scrolling = false;
      });

      return;
    }
  };

  wrapElement.addEventListener('scroll', handleScroll);

  scrollToBottom().then(() => {
    const echo = html => terminal.dispatchEvent(new CustomEvent('output-html', { detail: html }));

    echo('<hr>');
    echo(
      ansi2html(
        '\u001b[1;31m#################### ИСТОРИЯ ЧАТА ЗАГРУЖЕНА ####################\u001b[0;37m\n'
      )
    );
    echo('<hr>');
  });

  return () => {
    wrapElement.removeEventListener('scroll-to-bottom', handleScrollToBottom);
    wrapElement.removeEventListener('scroll', handleScroll);
    terminal.removeEventListener('output', handleOutput);
    terminal.removeEventListener('output-html', handleOutputHtml);
  };
}

const Terminal = forwardRef(({ bumpUnread, resetUnread }, ref) => {
  const wrap = useRef();

  useEffect(() => terminalInit(wrap.current), [wrap]);

  useEffect(() => {
    const current = wrap.current;
    const handleBumpUnread = () => bumpUnread();
    current.addEventListener('bump-unread', handleBumpUnread);
    return () => current.removeEventListener('bump-unread', handleBumpUnread);
  }, [bumpUnread]);

  useEffect(() => {
    const current = wrap.current;
    const handleResetUnread = () => resetUnread();
    current.addEventListener('reset-unread', handleResetUnread);
    return () => current.removeEventListener('reset-unread', handleResetUnread);
  }, [resetUnread]);

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
      scrollToBottom: () => wrap.current.dispatchEvent(new CustomEvent('scroll-to-bottom')),
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
