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
  
  let element = null;
  
  if (typeof selector === 'string') {
    // Check if this is element creation (starts with '<' and ends with '>')
    if (selector.startsWith('<') && selector.endsWith('>')) {
      // Extract tag name from the selector like '<div>' or '<span/>'
      const tagMatch = selector.match(/<(\w+).*?>/);
      if (tagMatch) {
        element = document.createElement(tagMatch[1]);
      }
    } else {
      // Regular selector
      element = document.querySelector(selector);
    }
  } else if (selector && selector.nodeType) {
    // Direct DOM element
    element = selector;
  }
  
  // Return a null-safe jQuery-like object
  const createJQueryLikeObject = (el) => ({
    find: (sel) => {
      if (!el) return createJQueryLikeObject(null);
      const elements = Array.from(el.querySelectorAll(sel));
      return {
        each: (callback) => elements.forEach((element, i) => callback.call(element, i)),
        length: elements.length,
        last: () => {
          const lastEl = elements[elements.length - 1];
          return lastEl ? createJQueryLikeObject(lastEl) : createJQueryLikeObject(null);
        },
        first: () => {
          const firstEl = elements[0];
          return firstEl ? createJQueryLikeObject(firstEl) : createJQueryLikeObject(null);
        },
        get: (index) => elements[index] || null
      };
    },
    on: (event, handler) => {
      if (el) {
        el.addEventListener(event, (e) => {
          // Convert to jQuery-like event format
          handler(e, e.detail ? e.detail[0] : undefined);
        });
      }
    },
    off: (event, handler) => {
      if (el) {
        if (handler) {
          el.removeEventListener(event, handler);
        } else {
          // For all events, we can't easily remove all listeners without tracking them
          // For now, just do nothing for the no-handler case
        }
      }
    },
    trigger: (event, data) => {
      if (el) {
        const customEvent = new CustomEvent(event, { detail: data, bubbles: true });
        el.dispatchEvent(customEvent);
      }
    },
    html: (content) => {
      if (!el) return '';
      if (content === undefined) return el.innerHTML;
      el.innerHTML = content;
      return createJQueryLikeObject(el);
    },
    text: () => el ? el.textContent : '',
    clone: () => {
      if (!el) return createJQueryLikeObject(null);
      const cloned = el.cloneNode(true);
      return {
        find: (sel) => ({
          remove: () => {
            const found = cloned.querySelectorAll(sel);
            found.forEach(element => element.remove());
          }
        }),
        text: () => cloned.textContent
      };
    },
    attr: (name, value) => {
      if (!el) return '';
      if (value === undefined) return el.getAttribute(name);
      el.setAttribute(name, value);
      return createJQueryLikeObject(el);
    },
    appendTo: (target) => {
      if (!el) return;
      if (typeof target === 'string') {
        const targetEl = document.querySelector(target);
        if (targetEl) targetEl.appendChild(el);
      } else if (target && target.appendChild) {
        target.appendChild(el);
      }
    },
    append: (content) => {
      if (!el) return createJQueryLikeObject(el);
      if (typeof content === 'string') {
        el.insertAdjacentHTML('beforeend', content);
      } else if (content && content.nodeType) {
        el.appendChild(content);
      }
      return createJQueryLikeObject(el);
    },
    prepend: (content) => {
      if (!el) return createJQueryLikeObject(el);
      if (typeof content === 'string') {
        el.insertAdjacentHTML('afterbegin', content);
      } else if (content && content.nodeType) {
        el.insertBefore(content, el.firstChild);
      }
      return createJQueryLikeObject(el);
    },
    remove: () => el && el.remove(),
    empty: () => {
      if (el) el.innerHTML = '';
      return createJQueryLikeObject(el);
    },
    children: (selector) => {
      if (!el) return createJQueryLikeObject(null);
      const children = selector 
        ? Array.from(el.children).filter(child => child.matches(selector))
        : Array.from(el.children);
      
      return {
        length: children.length,
        last: () => {
          const lastChild = children[children.length - 1];
          return lastChild ? createJQueryLikeObject(lastChild) : createJQueryLikeObject(null);
        },
        first: () => {
          const firstChild = children[0];
          return firstChild ? createJQueryLikeObject(firstChild) : createJQueryLikeObject(null);
        },
        remove: () => {
          children.forEach(child => child.remove());
        }
      };
    },
    offset: () => {
      if (!el) return { top: 0, left: 0 };
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX
      };
    },
    height: () => el ? el.offsetHeight : 0,
    outerHeight: () => {
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return rect.height;
    },
    scrollTop: (value) => {
      if (!el) return 0;
      if (value === undefined) return el.scrollTop;
      el.scrollTop = value;
      return createJQueryLikeObject(el);
    },
    length: el ? 1 : 0,
    get: (index) => index === 0 ? el : null
  });
  
  return createJQueryLikeObject(element);
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
  if (!wrap || typeof wrap.on !== 'function') {
    console.error('Invalid wrap object passed to terminalInit:', wrap);
    return;
  }
  const terminalFound = wrap.find('.terminal');
  if (!terminalFound || terminalFound.length === 0) {
    console.error('Terminal element not found');
    return;
  }
  
  // Create a jQuery-like wrapper for the first terminal element found
  const terminalEl = $(terminalFound.get(0));

  const appendToTerminal = chunk => {
    // Get the actual DOM element from the jQuery-like object
    const terminalDom = terminalEl.get(0);
    if (terminalDom) {
      terminalDom.appendChild(chunk);

      while (terminalDom.innerHTML.length > maxBytesOnScreen) {
        const firstChild = terminalDom.firstElementChild;
        if (firstChild) firstChild.remove();
      }

      wrap.scrollTop(terminalDom.offsetHeight);
    }
  };
  const atBottom = () => {
    const lastMessage = terminalEl.children().last();
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
      chunks.forEach(chunk => terminalEl.prepend(chunk))
    );
  };

  const loadBottom = (startId, len) => {
    scrolling = true;

    return loadChunks(startId, false, len).then(chunks =>
      chunks.forEach(chunk => terminalEl.append(chunk))
    );
  };

  const scrollToBottom = () => {
    wrap.scrollTop(0);
    terminalEl.empty();

    return loadTop(null, maxBytesOnScreen).then(() => {
      wrap.scrollTop(terminalEl.height());
      scrolling = false;
    }); // scroll to the bottom
  };

  wrap.on('scroll-to-bottom', () => scrollToBottom());

  terminalEl.on('output', function (e, txt) {
    const span = $('<span/>');
    span.html(ansi2html(txt));

    manip.colorParseAndReplace(span);
    manip.manipParseAndReplace(span);

    terminalEl.trigger('output-html', [span.html()]);
  });

  // this may not be called from outside of terminal logic.
  terminalEl.on('output-html', function (e, html) {
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
      let $fst = terminalEl.find('div[data-chunk-id]:first-child');

      // terminal is empty, can't scroll
      if ($fst.length === 0) return;

      let off = $fst.offset().top;
      let fstId = parseInt($fst.attr('data-chunk-id'));

      if (fstId === firstChunkId) {
        // We're at the very top, no need to load anything
        return;
      }

      loadTop(fstId, bytesToLoad).then(() => {
        while (terminalEl.html().length > maxBytesOnScreen)
          terminalEl.children(':last').remove();

        wrap.scrollTop(wrap.scrollTop() + $fst.offset().top - off);
        scrolling = false;
      });

      return;
    }

    // Load bottom chunks while scrolling down.
    if (
      wrap.scrollTop() >
      terminalEl.height() - wrap.height() - scrollThreshold
    ) {
      let $lst = terminalEl.find('div[data-chunk-id]:last-child');

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
        while (terminalEl.html().length > maxBytesOnScreen)
          terminalEl.children(':first').remove();

        wrap.scrollTop(wrap.scrollTop() + $lst.offset().top - off);
        scrolling = false;
      });

      return;
    }
  });

  scrollToBottom().then(() => {
    const echo = html => terminalEl.trigger('output-html', [html]);

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
    terminalEl.off();
  };
}

const Terminal = forwardRef(({ bumpUnread, resetUnread }, ref) => {
  const wrap = useRef();

  useEffect(() => {
    if (wrap.current) {
      terminalInit($(wrap.current));
    }
  }, []);

  useEffect(() => {
    if (wrap.current) {
      let cur = $(wrap.current);
      cur.on('bump-unread', bumpUnread);
      return () => cur.off('bump-unread', bumpUnread);
    }
  }, [bumpUnread]);

  useEffect(() => {
    if (wrap.current) {
      let cur = $(wrap.current);
      cur.on('reset-unread', resetUnread);
      return () => cur.off('reset-unread', resetUnread);
    }
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
      scrollToBottom: () => {
        if (wrap.current) {
          $(wrap.current).trigger('scroll-to-bottom', []);
        }
      },
    }),
    []
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

Terminal.displayName = 'Terminal';

export default Terminal;
