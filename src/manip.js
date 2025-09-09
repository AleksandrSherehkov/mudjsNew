import areasJson from './data/areas.json';
import { send, ws } from './websock.js';
import { echo } from './input.js';

// Список допустимых имён областей (без суффикса ".are")
const areas = areasJson.map(a => a.file.replace('.are', ''));

/* =========================
 * Делегирование событий UI
 * ========================= */

// Кнопки панели управления
document.body.addEventListener('click', e => {
  const btn = e.target.closest('.btn-ctrl-panel');
  if (!btn) return;

  const cmd = btn.getAttribute('data-action');
  const conf = btn.getAttribute('data-confirm');

  if (conf !== undefined && conf !== null) {
    const ok = window.confirm('Вы действительно хотите ' + conf + '?');
    if (!ok) return;
  }
  echo(cmd);
  send(cmd);
});

// Клик по ссылке-команде: .manip-cmd (например, 'read sign')
document.body.addEventListener('click', e => {
  const link = e.target.closest('.manip-cmd');
  if (!link) return;
  const echoText = link.getAttribute('data-echo');
  const action = link.getAttribute('data-action');
  if (echoText) echo(echoText);
  if (action) send(action);
});

// Клик по пункту выпадающего меню: .manip-item
document.body.addEventListener('click', e => {
  const item = e.target.closest('.manip-item');
  if (!item) return;
  const echoText = item.getAttribute('data-echo');
  const action = item.getAttribute('data-action');
  if (echoText) echo(echoText);
  if (action) send(action);
});

// Подчёркивание выбранного пункта при открытии/закрытии dropdown (Bootstrap 5)
document.body.addEventListener('show.bs.dropdown', e => {
  if (e.relatedTarget) {
    e.relatedTarget.style.textDecoration = 'underline';
  }
});
document.body.addEventListener('hide.bs.dropdown', e => {
  if (e.relatedTarget) {
    e.relatedTarget.style.textDecoration = '';
  }
});

/* ===========================================
 * Преобразование спец-тегов/плейсхолдеров
 * =========================================== */

// Заменить цветовые <c c="fgbr"> теги на <span class="fgbr">...</span>
function colorParseAndReplace(spanEl) {
  spanEl.querySelectorAll('c').forEach(cElem => {
    const style = cElem.getAttribute('c');
    const newSpan = document.createElement('span');
    while (cElem.firstChild) newSpan.appendChild(cElem.firstChild);
    if (style) newSpan.classList.add(style);
    cElem.replaceWith(newSpan);
  });
}

/**
 * Преобразовать управляющие плейсхолдеры/теги в кликабельные элементы
 * spanEl — DOM-элемент-контейнер (бывший jQuery span)
 */
function manipParseAndReplace(spanEl) {
  // 1) Строковые замены плейсхолдеров [map], [read], [cmd]
  let html = spanEl.innerHTML;

  // [map=filename.are] -> кнопка "открыть карту" (если область существует)
  html = html.replace(/\[map=([-0-9a-z_]{1,15})\.are\]/g, (match, p1) => {
    if (!areas.includes(p1)) return '';
    return `<a class="btn btn-sm btn-outline-info btn-orange" href="https://dreamland.rocks/maps/${p1}.html" target="_blank">открыть карту</a>`;
  });

  // [read=x,see=y] -> (<span class="manip-cmd manip-ed" data-action="read 'x'">y</span>) при условии что y ∈ x (по словам)
  html = html.replace(
    /\[read=([^,]{1,100}),see=([^\]]{1,30})]/gi,
    (match, p1, p2) => {
      if (!p1.toLowerCase().split(' ').includes(p2.toLowerCase())) return '';
      return `(<span class="manip-cmd manip-ed" data-action="read '${p1}'" data-echo="читать ${p2}">${p2}</span>)`;
    }
  );

  // [cmd=...,see=...,nonce=xxxxxxxx] -> span с data-action/echo, проверяя nonce и сохраняя пробелы/иконки
  html = html.replace(
    /\[cmd=([^,]{1,70}),see=([^\]]{1,50}),nonce=(.{8})]/gi,
    (match, cmd, see, nonce, full) => {
      // проверка, что команда пришла с сервера
      if (!ws || nonce !== ws.nonce) {
        console.log("Invalid nonce in command, someone's up to no good", full);
        return full;
      }
      // подстановка аргумента
      const action = cmd.replace(/\$1/, see);

      // Разделяем ведущие/хвостовые пробелы и само сообщение
      const m = see.match(/^( *)(.*[^ ])( *)$/);
      if (!m) {
        // нет "несущего" символа — просто отрисуем как есть
        return `<span class="manip-cmd" data-action="${action}" data-echo="${action}">${see}</span>`;
      }
      const [, spaceBegin, msg, spaceEnd] = m;

      // Подменяем msg на иконки, если это спец-слово
      let label;
      switch (msg) {
        case 'edit':
          label = '<i class="fa fa-edit"></i>';
          break;
        case 'save':
        case 'done':
          label = '<i class="fa fa-save"></i>';
          break;
        case 'cancel':
          label = '<i class="fa fa-window-close"></i>';
          break;
        case 'show':
          label = '<i class="fa fa-eye"></i>';
          break;
        default:
          label = msg;
          break;
      }

      // Окружающие пробелы отдаём nbps, чтобы подчеркивание было только под словом/иконкой
      return (
        '&nbsp;'.repeat(spaceBegin.length) +
        `<span class="manip-cmd" data-action="${action}" data-echo="${action}">${label}</span>` +
        '&nbsp;'.repeat(spaceEnd.length)
      );
    }
  );

  // Применяем промежуточный HTML
  spanEl.innerHTML = html;

  // 2) DOM-преобразования специальных тегов

  // <hc>command</hc> -> <span class="manip-cmd" data-action="command" data-echo="command">...</span>
  spanEl.querySelectorAll('hc').forEach(hc => {
    const frag = document.createDocumentFragment();
    while (hc.firstChild) frag.appendChild(hc.firstChild);
    const action = (frag.textContent || '').trim();
    const s = document.createElement('span');
    s.className = 'manip-cmd';
    s.setAttribute('data-action', action);
    s.setAttribute('data-echo', action);
    s.appendChild(frag);
    hc.replaceWith(s);
  });

  // <hl>http(s)://...</hl> -> ссылка
  spanEl.querySelectorAll('hl').forEach(hl => {
    const frag = document.createDocumentFragment();
    while (hl.firstChild) frag.appendChild(hl.firstChild);
    const href = (frag.textContent || '').trim();
    if (!/^https?:\/\//i.test(href)) return; // базовая валидация
    const a = document.createElement('a');
    a.className = 'manip-link';
    a.target = '_blank';
    a.rel = 'noopener';
    a.href = href;
    a.appendChild(frag);
    hl.replaceWith(a);
  });

  // <hh>article name</hh> или <hh id="333">label</hh> -> ссылка на help
  spanEl.querySelectorAll('hh').forEach(hh => {
    const labelText = hh.textContent || '';
    const id = hh.getAttribute('id') || labelText;

    const matches = labelText.match(/^( *)([\0-\uFFFF]*[^ ])( *)$/m);
    if (!matches || matches.length < 4) {
      // Неверный формат, оставим как есть
      return;
    }
    const spaceBegin = matches[1].length;
    const label = matches[2];
    const spaceEnd = matches[3].length;

    const inner = document.createElement('span');
    inner.className = 'manip-cmd manip-link';
    inner.setAttribute('data-action', 'help ' + id);
    inner.setAttribute('data-echo', 'справка ' + id);
    inner.textContent = label;

    // Собираем строку с nbps по краям, как в оригинале
    const resultHtml =
      '&nbsp;'.repeat(spaceBegin) + inner.outerHTML + '&nbsp;'.repeat(spaceEnd);

    const wrapper = document.createElement('span');
    wrapper.innerHTML = resultHtml;
    hh.replaceWith(
      wrapper.firstChild,
      wrapper.firstChild?.nextSibling,
      wrapper.firstChild?.nextSibling?.nextSibling
    );
  });

  // <hg>skill group</hg> -> glist ...
  spanEl.querySelectorAll('hg').forEach(hg => {
    const text = (hg.textContent || '').trim();
    const s = document.createElement('span');
    s.className = 'manip-cmd';
    s.setAttribute('data-action', 'glist ' + text);
    s.setAttribute('data-echo', 'группаумен ' + text);
    s.textContent = text;
    hg.replaceWith(s);
  });

  // <hs>speedwalk</hs> -> run speedwalk
  spanEl.querySelectorAll('hs').forEach(hs => {
    const text = (hs.textContent || '').trim();
    const s = document.createElement('span');
    s.className = 'manip-cmd manip-speedwalk';
    s.setAttribute('data-action', 'run ' + text);
    s.setAttribute('data-echo', 'бежать ' + text);
    s.textContent = text;
    hs.replaceWith(s);
  });

  // <m i="234234" c="take $,put $ 12348" l="..."/> -> dropdown с пунктами-акциями
  spanEl.querySelectorAll('m').forEach(m => {
    const id = m.getAttribute('i') || '';

    const menu = document.createElement('span');
    menu.className = 'dropdown-menu no-triggers';

    const addToMenu = cmd => {
      if (!cmd || cmd.trim().length === 0) return;
      const action = cmd.replace(/\$/g, id);
      // label без $ и больших чисел/квотированных вставок
      const label = cmd.replace(/( *\$ *| *[0-9]{5,}|\.'.*')/g, '').trim();

      const a = document.createElement('a');
      a.className = 'dropdown-item manip-item';
      a.href = '#';
      a.setAttribute('data-action', action);
      a.textContent = label;
      menu.appendChild(a);
    };

    if (m.hasAttribute('c')) {
      m.getAttribute('c')
        .split(',')
        .map(x => x)
        .forEach(addToMenu);
    }

    if (m.hasAttribute('l')) {
      const divider = document.createElement('div');
      divider.className = 'dropdown-divider';
      menu.appendChild(divider);
      m.getAttribute('l')
        .split(',')
        .map(x => x)
        .forEach(addToMenu);
    }

    // toggle с содержимым исходного <m>
    const toggle = document.createElement('span');
    toggle.className = 'dropdown-toggle';
    toggle.setAttribute('data-bs-toggle', 'dropdown');
    while (m.firstChild) toggle.appendChild(m.firstChild);

    // обёртка
    const wrapper = document.createElement('span');
    wrapper.className = 'dropdown-norelative';
    wrapper.appendChild(toggle);
    wrapper.appendChild(menu);

    // заменить в DOM
    m.replaceWith(wrapper);

    // инициализируем Bootstrap Dropdown (если подключён)
    setTimeout(() => {
      const DD = window.bootstrap && window.bootstrap.Dropdown;
      if (DD) new DD(toggle);
    }, 0);
  });
}

export default {
  manipParseAndReplace,
  colorParseAndReplace,
};
