// Simplified wrapper to minimize changes to complex terminal logic
const $ = (selector) => {
  if (typeof selector === 'function') {
    // Handle $(function() {}) pattern
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', selector);
    } else {
      selector();
    }
    return null;
  }
  
  if (typeof selector === 'string') {
    const element = document.querySelector(selector);
    if (!element) return { 
      find: () => ({ each: () => {}, length: 0 }),
      on: () => {},
      trigger: () => {},
      html: () => '',
      text: () => '',
      clone: () => ({ find: () => ({ remove: () => {} }), text: () => '' }),
      attr: () => '',
      appendTo: () => {},
      append: () => '',
      remove: () => {},
      length: 0
    };
    
    return {
      find: (sel) => {
        const elements = Array.from(element.querySelectorAll(sel));
        return {
          each: (callback) => elements.forEach((el, i) => callback.call(el, i)),
          length: elements.length
        };
      },
      on: (event, handler) => {
        element.addEventListener(event, (e) => {
          // Convert to jQuery-like event format
          handler(e, e.detail ? e.detail[0] : undefined);
        });
      },
      trigger: (event, data) => {
        const customEvent = new CustomEvent(event, { detail: data, bubbles: true });
        element.dispatchEvent(customEvent);
      },
      html: (content) => {
        if (content === undefined) return element.innerHTML;
        element.innerHTML = content;
        return this;
      },
      text: () => element.textContent,
      clone: () => {
        const cloned = element.cloneNode(true);
        return {
          find: (sel) => ({
            remove: () => {
              const found = cloned.querySelectorAll(sel);
              found.forEach(el => el.remove());
            }
          }),
          text: () => cloned.textContent
        };
      },
      attr: (name, value) => {
        if (value === undefined) return element.getAttribute(name);
        element.setAttribute(name, value);
        return this;
      },
      appendTo: (target) => {
        if (typeof target === 'string') {
          const targetEl = document.querySelector(target);
          if (targetEl) targetEl.appendChild(element);
        } else if (target && target.appendChild) {
          target.appendChild(element);
        }
      },
      append: (content) => {
        if (typeof content === 'string') {
          element.insertAdjacentHTML('beforeend', content);
        } else if (content && content.nodeType) {
          element.appendChild(content);
        }
        return this;
      },
      remove: () => element.remove(),
      length: 1,
      get: (index) => element
    };
  }
  
  return {};
};

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
  const terminal = find(wrap, '.terminal')[0];

  const appendToTerminal = chunk => {
    terminal.appendChild(chunk);

    while (terminal.innerHTML.length > maxBytesOnScreen) {
      const firstChild = terminal.firstElementChild;
      if (firstChild) firstChild.remove();
    }

    wrap.scrollTop = terminal.offsetHeight;
  };
  const atBottom = () => {
    const lastMessage = terminal.children().last();
    if (lastMessage.length === 0) return true;

    const lastMessageBottom =
      lastMessage.offset().top + lastMessage.outerHeight();
    const wrapBottom = wrap.offset().top + wrap.outerHeight();

    const isAtBottom = lastMessageBottom <= wrapBottom;

    return isAtBottom;
  };

  const loadTop = (startId, len) => {
    scrolling = true;

    return loadChunks(startId, true, len).then(chunks =>
      chunks.forEach(chunk => terminal.prepend(chunk))
    );
  };

  const loadBottom = (startId, len) => {
    scrolling = true;

    return loadChunks(startId, false, len).then(chunks =>
      chunks.forEach(chunk => terminal.append(chunk))
    );
  };

  const scrollToBottom = () => {
    wrap.scrollTop(0);
    terminal.empty();

    return loadTop(null, maxBytesOnScreen).then(() => {
      wrap.scrollTop(terminal.height());
      scrolling = false;
    }); // scroll to the bottom
  };

  wrap.on('scroll-to-bottom', () => scrollToBottom());

  terminal.on('output', function (e, txt) {
    const span = $('<span/>');
    span.html(ansi2html(txt));

    manip.colorParseAndReplace(span);
    manip.manipParseAndReplace(span);

    terminal.trigger('output-html', [span.html()]);
  });

  // this may not be called from outside of terminal logic.
  terminal.on('output-html', function (e, html) {
    historyDb
      .then(db => db.append(html))
      .then(id => {
        const $chunk = $('<div>').append(html).attr('data-chunk-id', id);

        $chunk.find('.manip-cmd').each(function () {
          $(this).attr('role', 'link').attr('tabindex', 0);
        });
        // only append a DOM node if we're at the bottom
        if (autoScrollEnabled) {
          appendToTerminal($chunk);
        } else {
          wrap.trigger('bump-unread', []);
        }

        lastChunkId = id;

        // Transform output into clean text and call user-defined triggers.
        const $chunkCopy = $chunk.clone();
        $chunkCopy.find('.no-triggers').remove();
        const lines = $chunkCopy.text().replace(/\xa0/g, ' ').split('\n');
        lines.forEach(line => {
          processTriggers(line);
          $('.trigger').trigger('text', ['' + line]);
        });
        // lines.forEach(line => $('.trigger').trigger('text', [''+line]));
      });
  });

  wrap.on('scroll', () => {
    autoScrollEnabled = atBottom();

    // We are already handling a scroll event.
    // Don't trigger another database operation until the current one completed.
    if (scrolling) {
      // Prevent scrolling, so that the user won't hit the limits of the scrolling window.
      // e.preventDefault();
      return;
    }

    // Load top chunks while scrolling up.
    if (wrap.scrollTop() < scrollThreshold) {
      let $fst = terminal.find('div[data-chunk-id]:first-child');

      // terminal is empty, can't scroll
      if ($fst.length === 0) return;

      let off = $fst.offset().top;
      let fstId = parseInt($fst.attr('data-chunk-id'));

      if (fstId === firstChunkId) {
        // We're at the very top, no need to load anything
        return;
      }

      loadTop(fstId, bytesToLoad).then(() => {
        while (terminal.html().length > maxBytesOnScreen)
          terminal.children(':last').remove();

        wrap.scrollTop(wrap.scrollTop() + $fst.offset().top - off);
        scrolling = false;
      });

      return;
    }

    // Load bottom chunks while scrolling down.
    if (
      wrap.scrollTop() >
      terminal.height() - wrap.height() - scrollThreshold
    ) {
      let $lst = terminal.find('div[data-chunk-id]:last-child');

      // terminal is empty, can't scroll
      if ($lst.length === 0) return;

      let off = $lst.offset().top;
      let lstId = parseInt($lst.attr('data-chunk-id'));

      // The last html element in the DOM is the last sent message,
      // so we're at the bottom, no need to load anything.
      if (lstId === lastChunkId) {
        // Check if we can reset the unread counter and return
        if (atBottom()) {
          wrap.trigger('reset-unread', []);
        }

        return;
      }

      loadBottom(lstId, bytesToLoad).then(() => {
        while (terminal.html().length > maxBytesOnScreen)
          terminal.children(':first').remove();

        wrap.scrollTop(wrap.scrollTop() + $lst.offset().top - off);
        scrolling = false;
      });

      return;
    }
  });

  scrollToBottom().then(() => {
    const echo = html => terminal.trigger('output-html', [html]);

    echo('<hr>');
    echo(
      ansi2html(
        '\u001b[1;31m#################### ИСТОРИЯ ЧАТА ЗАГРУЖЕНА ####################\u001b[0;37m\n'
      )
    );
    echo('<hr>');
  });

  return () => {
    wrap.off();
    terminal.off();
  };
}

const Terminal = forwardRef(({ bumpUnread, resetUnread }, ref) => {
  const wrap = useRef();

  useEffect(() => terminalInit($(wrap.current)), [wrap]);

  useEffect(() => {
    let cur = $(wrap.current);
    cur.on('bump-unread', bumpUnread);
    return () => cur.off('bump-unread', bumpUnread);
  }, [wrap, bumpUnread]);

  useEffect(() => {
    let cur = $(wrap.current);
    cur.on('reset-unread', resetUnread);
    return () => cur.off('reset-unread', resetUnread);
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
      scrollToBottom: () => $(wrap.current).trigger('scroll-to-bottom', []),
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
