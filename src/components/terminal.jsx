import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';

import historyDb from '../historydb';
import ansi2html from '../ansi2html';
import manip from '../manip';
import { processTriggers } from './sysCommands/action';

// Сколько грузить из базы за один раз, порог подзагрузки и максимальный объём HTML на экране
const bytesToLoad = 100000;
const scrollThreshold = 1000;
const maxBytesOnScreen = 1000000;

let firstChunkId = -1; // id самого первого чанка в истории (когда долистали до верха)
let lastChunkId = -1; // id последнего отображённого чанка
let scrolling = false;
let autoScrollEnabled = true;

/** Загрузка чанков из истории. Возвращает массив DOM-элементов <div data-chunk-id="..."> */
const loadChunks = (startId, backward, maxLen) => {
  const chunks = [];
  return historyDb
    .then(db =>
      db.load(startId, backward, maxLen, (id, value) =>
        chunks.push({ id, value })
      )
    )
    .then(() => {
      if (!startId && backward && chunks.length > 0) {
        lastChunkId = chunks[0].id;
      }
      if (startId && backward && chunks.length === 0) {
        firstChunkId = startId;
      }
      return chunks.map(({ id, value }) => {
        const div = document.createElement('div');
        div.innerHTML = value;
        div.setAttribute('data-chunk-id', id);
        return div;
      });
    });
};

function terminalInit(container) {
  const terminalEl = container.querySelector('.terminal');

  const appendChunk = chunkElem => {
    terminalEl.appendChild(chunkElem);
    while (terminalEl.innerHTML.length > maxBytesOnScreen) {
      terminalEl.removeChild(terminalEl.firstElementChild);
    }
    container.scrollTop = terminalEl.scrollHeight;
  };

  const atBottom = () =>
    Math.ceil(container.scrollTop + container.clientHeight) >=
    terminalEl.scrollHeight;

  const loadTop = (startId, len) => {
    scrolling = true;
    return loadChunks(startId, true, len).then(chunks => {
      chunks.forEach(chunk => terminalEl.prepend(chunk));
    });
  };

  const loadBottom = (startId, len) => {
    scrolling = true;
    return loadChunks(startId, false, len).then(chunks => {
      chunks.forEach(chunk => terminalEl.appendChild(chunk));
    });
  };

  const scrollToBottom = () => {
    container.scrollTop = 0;
    terminalEl.innerHTML = '';
    return loadTop(null, maxBytesOnScreen).then(() => {
      container.scrollTop = terminalEl.scrollHeight;
      scrolling = false;
    });
  };

  // Позволяем внешне прокручивать вниз до конца
  container.addEventListener('scroll-to-bottom', scrollToBottom);

  // Обработка текстового вывода (ANSI -> HTML -> манипуляции)
  const handleOutput = e => {
    const txt = e.detail;
    const span = document.createElement('span');
    span.innerHTML = ansi2html(txt);
    manip.colorParseAndReplace(span);
    manip.manipParseAndReplace(span);
    terminalEl.dispatchEvent(
      new CustomEvent('output-html', { detail: span.innerHTML })
    );
  };

  // Обработка готового HTML-вывода
  const handleOutputHtml = e => {
    const html = e.detail;
    historyDb
      .then(db => db.append(html))
      .then(id => {
        const chunkDiv = document.createElement('div');
        chunkDiv.innerHTML = html;
        chunkDiv.setAttribute('data-chunk-id', id);

        chunkDiv.querySelectorAll('.manip-cmd').forEach(el => {
          el.setAttribute('role', 'link');
          el.setAttribute('tabindex', '0');
        });

        if (autoScrollEnabled) {
          appendChunk(chunkDiv);
        } else {
          container.dispatchEvent(new CustomEvent('bump-unread'));
        }

        lastChunkId = id;

        // Триггеры по чистому тексту
        const chunkCopy = chunkDiv.cloneNode(true);
        chunkCopy.querySelectorAll('.no-triggers').forEach(el => el.remove());
        const lines = chunkCopy.textContent.replace(/\xa0/g, ' ').split('\n');
        lines.forEach(line => {
          processTriggers(line);
          document.querySelectorAll('.trigger').forEach(el => {
            el.dispatchEvent(new CustomEvent('text', { detail: String(line) }));
          });
        });
      });
  };

  terminalEl.addEventListener('output', handleOutput);
  terminalEl.addEventListener('output-html', handleOutputHtml);

  // Прокрутка: подгрузка истории и управление счётчиком непрочитанных
  const handleScroll = () => {
    const nowAtBottom = atBottom();
    autoScrollEnabled = nowAtBottom;
    if (nowAtBottom) {
      container.dispatchEvent(new CustomEvent('reset-unread'));
    }

    if (scrolling) return;

    // Подгружаем верх при приближении к началу
    if (container.scrollTop < scrollThreshold) {
      const firstChunk = terminalEl.querySelector(
        'div[data-chunk-id]:first-child'
      );
      if (!firstChunk) return;

      const off = firstChunk.getBoundingClientRect().top;
      const fstId = parseInt(firstChunk.getAttribute('data-chunk-id'), 10);

      if (fstId === firstChunkId) return; // уже в самом верху

      loadTop(fstId, bytesToLoad).then(() => {
        while (terminalEl.innerHTML.length > maxBytesOnScreen) {
          terminalEl.removeChild(terminalEl.lastElementChild);
        }
        const newOff = firstChunk.getBoundingClientRect().top;
        container.scrollTop += newOff - off;
        scrolling = false;
      });

      return;
    }

    // Подгрузка вниз при уходе к низу истории (редкий кейс ради паритета с оригиналом)
    if (
      container.scrollTop >
      terminalEl.scrollHeight - container.clientHeight - scrollThreshold
    ) {
      const lastChunk = terminalEl.querySelector(
        'div[data-chunk-id]:last-child'
      );
      if (!lastChunk) return;

      const off = lastChunk.getBoundingClientRect().top;
      const lstId = parseInt(lastChunk.getAttribute('data-chunk-id'), 10);

      if (lstId === lastChunkId) {
        if (atBottom())
          container.dispatchEvent(new CustomEvent('reset-unread'));
        return;
      }

      loadBottom(lstId, bytesToLoad).then(() => {
        while (terminalEl.innerHTML.length > maxBytesOnScreen) {
          terminalEl.removeChild(terminalEl.firstElementChild);
        }
        const newOff = lastChunk.getBoundingClientRect().top;
        container.scrollTop += newOff - off;
        scrolling = false;
      });
    }
  };

  container.addEventListener('scroll', handleScroll);

  // Первая загрузка истории и приветственный баннер
  return scrollToBottom()
    .then(() => {
      const echo = html =>
        terminalEl.dispatchEvent(
          new CustomEvent('output-html', { detail: html })
        );

      echo('<hr>');
      echo(
        ansi2html(
          '\u001b[1;31m#################### ИСТОРИЯ ЧАТА ЗАГРУЖЕНА ####################\u001b[0;37m\n'
        )
      );
      echo('<hr>');
    })
    .then(() => {
      // Возвращаем функцию очистки обработчиков
      return () => {
        container.removeEventListener('scroll-to-bottom', scrollToBottom);
        container.removeEventListener('scroll', handleScroll);
        terminalEl.removeEventListener('output', handleOutput);
        terminalEl.removeEventListener('output-html', handleOutputHtml);
      };
    });
}

const Terminal = forwardRef(({ bumpUnread, resetUnread }, ref) => {
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    let cleanupInner = () => {};
    const setup = async () => {
      const cleanup = await terminalInit(wrapRef.current);
      cleanupInner = cleanup;
    };
    setup();

    const wrapElem = wrapRef.current;
    const handleBump = () => bumpUnread && bumpUnread();
    const handleReset = () => resetUnread && resetUnread();

    wrapElem.addEventListener('bump-unread', handleBump);
    wrapElem.addEventListener('reset-unread', handleReset);

    // Включаем автоскролл при любой активности пользователя
    const enableAutoScroll = () => {
      autoScrollEnabled = true;
    };
    document.addEventListener('click', enableAutoScroll);
    document.addEventListener('keydown', enableAutoScroll);
    document.addEventListener('input', enableAutoScroll);
    document.addEventListener('change', enableAutoScroll);

    return () => {
      cleanupInner && cleanupInner();
      wrapElem.removeEventListener('bump-unread', handleBump);
      wrapElem.removeEventListener('reset-unread', handleReset);
      document.removeEventListener('click', enableAutoScroll);
      document.removeEventListener('keydown', enableAutoScroll);
      document.removeEventListener('input', enableAutoScroll);
      document.removeEventListener('change', enableAutoScroll);
    };
  }, [bumpUnread, resetUnread]);

  useImperativeHandle(
    ref,
    () => ({
      scrollToBottom: () =>
        wrapRef.current?.dispatchEvent(new CustomEvent('scroll-to-bottom')),
    }),
    []
  );

  return (
    <div className="terminal-wrap" ref={wrapRef}>
      <div
        className="terminal"
        aria-live="polite"
        aria-relevant="additions"
      ></div>
    </div>
  );
});

export default Terminal;
