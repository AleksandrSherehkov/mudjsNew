// D:\GitHub\mudjsNew\src\manip.js
import areasJson from './data/areas.json';
import { send, ws } from './websock.js';
import { echo } from './input.js';

// Create the list of all possible area file names (without ".are" bit).
const areas = areasJson.map(a => a.file.replace('.are', ''));

// Кнопки панели управления (у них класс .btn-ctrl-panel)
document.body.addEventListener('click', function (e) {
  const btn = e.target.closest('.btn-ctrl-panel');
  if (!btn) return;

  const cmd = btn.getAttribute('data-action') || '';
  const conf = btn.getAttribute('data-confirm');

  if (btn.hasAttribute('data-confirm')) {
    if (!window.confirm(`Вы действительно хотите ${conf}?`)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }

  if (cmd) {
    echo(cmd);
    send(cmd);
  }

  e.preventDefault();
  e.stopPropagation();
});

// Клик по «командам» внутри текста (например, умения, справка и т.п.)
// Раньше это делал jQuery делегированием; теперь используем closest()
document.body.addEventListener('click', function (e) {
  const el = e.target.closest('.manip-cmd');
  if (!el) return;

  const action = el.getAttribute('data-action') || '';
  const echoTxt = el.getAttribute('data-echo') || action;

  if (echoTxt) echo(echoTxt);
  if (action) send(action);

  e.preventDefault();
  e.stopPropagation();
});

// Клик по пунктам выпадающих меню предметов (.manip-item)
document.body.addEventListener('click', function (e) {
  const el = e.target.closest('.manip-item');
  if (!el) return;

  const action = el.getAttribute('data-action') || '';
  const echoTxt = el.getAttribute('data-echo') || action;

  if (echoTxt) echo(echoTxt);
  if (action) send(action);

  e.preventDefault();
  e.stopPropagation();
});

// Подчёркивание текущего выбора при открытии dropdown (Bootstrap 5)
document.body.addEventListener('show.bs.dropdown', function (e) {
  if (e.target.classList.contains('dropdown') && e.relatedTarget) {
    e.relatedTarget.style.textDecoration = 'underline';
  }
});

// Снять подчёркивание при закрытии dropdown (Bootstrap 5)
document.body.addEventListener('hide.bs.dropdown', function (e) {
  if (e.target.classList.contains('dropdown') && e.relatedTarget) {
    e.relatedTarget.removeAttribute('style');
  }
});

// Replace colour "<c c='fgbr'/>" tags coming from the server with spans.
function colorParseAndReplace(element) {
  const cElements = element.querySelectorAll('c');
  cElements.forEach(function (cEl) {
    const style = cEl.getAttribute('c');
    const span = document.createElement('span');
    span.className = style || '';
    while (cEl.firstChild) span.appendChild(cEl.firstChild);
    cEl.parentNode.replaceChild(span, cEl);
  });
}

function manipParseAndReplace(element) {
  // Replace placeholders [map=filename.are] with buttons that open a map,
  // or with an empty string, if area is not found in the areas.json.
  let html = element.innerHTML.replace(
    /\[map=([-0-9a-z_]{1,15})\.are\]/g,
    function (_match, p1) {
      if (areas.indexOf(p1) === -1) return '';
      return (
        '<a class="btn btn-sm btn-outline-info btn-orange" href="https://dreamland.rocks/maps/' +
        p1 +
        '.html" target=_blank>открыть карту</a>'
      );
    }
  );

  // Replace ED placeholders [read=...,see=...] -> clickable span
  html = html.replace(
    /\[read=([^,]{1,100}),see=([^\]]{1,30})]/gi,
    function (_match, p1, p2) {
      if (p1.toLowerCase().split(' ').indexOf(p2.toLowerCase()) === -1)
        return '';
      return (
        '(<span class="manip-cmd manip-ed" data-action="read \'' +
        p1 +
        '\'" data-echo="читать ' +
        p2 +
        '">' +
        p2 +
        '</span>)'
      );
    }
  );

  // Replace random commands with data-action span.
  html = html.replace(
    /\[cmd=([^,]{1,70}),see=([^\]]{1,50}),nonce=(.{8})]/gi,
    function (match, cmd, see, nonce, string) {
      // Ensure the command is coming from the server.
      if (nonce !== ws?.nonce) {
        console.log(
          "Invalid nonce in command, someone's up to no good",
          string
        );
        return string;
      }

      const action = cmd.replace(/\$1/, see);

      // The link only surrounds the message itself (без крайних пробелов)
      return see.replace(
        /^( *)(.*[^ ])( *)$/,
        function (_m, spaceBegin, msg, spaceEnd) {
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
          }

          return (
            '&nbsp;'.repeat(spaceBegin.length) +
            '<span class="manip-cmd" data-action="' +
            action +
            '" data-echo="' +
            action +
            '">' +
            label +
            '</span>' +
            '&nbsp;'.repeat(spaceEnd.length)
          );
        }
      );
    }
  );

  element.innerHTML = html;

  // "<hc>command</hc>" -> clickable command
  const hcElements = element.querySelectorAll('hc');
  hcElements.forEach(function (hcEl) {
    const cmd = hcEl.textContent;
    const span = document.createElement('span');
    span.className = 'manip-cmd';
    span.setAttribute('data-action', cmd);
    span.setAttribute('data-echo', cmd);
    while (hcEl.firstChild) span.appendChild(hcEl.firstChild);
    hcEl.parentNode.replaceChild(span, hcEl);
  });

  // "<hl>http...</hl>" -> link (sanitized)
  const hlElements = element.querySelectorAll('hl');
  hlElements.forEach(function (hlEl) {
    const href = hlEl.textContent;
    if (!href.startsWith('http')) return;
    const link = document.createElement('a');
    link.className = 'manip-link';
    link.setAttribute('href', href);
    link.setAttribute('target', '_blank');
    while (hlEl.firstChild) link.appendChild(hlEl.firstChild);
    hlEl.parentNode.replaceChild(link, hlEl);
  });

  // "<hh>article</hh>" -> help link
  const hhElements = element.querySelectorAll('hh');
  hhElements.forEach(function (hhEl) {
    const article = hhEl.textContent;
    const id = hhEl.getAttribute('id') || article;
    const matches = article.match(/^( *)([\0-\uFFFF]*[^ ])( *)$/m);
    if (!matches || matches.length < 4) return;

    const spaceBegin = matches[1].length;
    const spaceEnd = matches[3].length;
    const label = matches[2];

    const span = document.createElement('span');
    span.className = 'manip-cmd manip-link';
    span.setAttribute('data-action', 'help ' + id);
    span.setAttribute('data-echo', 'справка ' + id);
    span.textContent = label;

    const replacement =
      '&nbsp;'.repeat(spaceBegin) + span.outerHTML + '&nbsp;'.repeat(spaceEnd);
    hhEl.outerHTML = replacement;
  });

  // "<hg>skill group</hg>" -> glist link
  const hgElements = element.querySelectorAll('hg');
  hgElements.forEach(function (hgEl) {
    const article = hgEl.textContent;
    const span = document.createElement('span');
    span.className = 'manip-cmd';
    span.setAttribute('data-action', 'glist ' + article);
    span.setAttribute('data-echo', 'группаумен ' + article);
    while (hgEl.firstChild) span.appendChild(hgEl.firstChild);
    hgEl.parentNode.replaceChild(span, hgEl);
  });

  // "<hs>speedwalk</hs>" -> run speedwalk
  const hsElements = element.querySelectorAll('hs');
  hsElements.forEach(function (hsEl) {
    const article = hsEl.textContent;
    const span = document.createElement('span');
    span.className = 'manip-cmd manip-speedwalk';
    span.setAttribute('data-action', 'run ' + article);
    span.setAttribute('data-echo', 'бежать ' + article);
    while (hsEl.firstChild) span.appendChild(hsEl.firstChild);
    hsEl.parentNode.replaceChild(span, hsEl);
  });

  // "<m i='..' c='..' l='..'/>" -> выпадающее меню для предмета
  const mElements = element.querySelectorAll('m');
  mElements.forEach(function (mEl) {
    const id = mEl.getAttribute('i');
    const menu = document.createElement('span');
    menu.className = 'dropdown-menu no-triggers';

    function addToMenu(cmd) {
      if (cmd.trim().length === 0) return;
      const action = cmd.replace(/\$/, id);
      const label = cmd.replace(/( *\$ *| *[0-9]{5,}|\.'.*')/g, '');
      const link = document.createElement('a');
      link.className = 'dropdown-item manip-item';
      link.setAttribute('data-action', action);
      link.setAttribute('href', '#');
      link.textContent = label;
      menu.appendChild(link);
    }

    if (mEl.hasAttribute('c')) {
      const commands = mEl.getAttribute('c').split(',');
      commands.forEach(cmd => addToMenu(cmd));
    }

    if (mEl.hasAttribute('l')) {
      const divider = document.createElement('div');
      divider.className = 'dropdown-divider';
      menu.appendChild(divider);
      const localCommands = mEl.getAttribute('l').split(',');
      localCommands.forEach(cmd => addToMenu(cmd));
    }

    const toggle = document.createElement('span');
    toggle.className = 'dropdown-toggle';
    toggle.setAttribute('data-bs-toggle', 'dropdown');
    while (mEl.firstChild) toggle.appendChild(mEl.firstChild);

    const result = document.createElement('span');
    result.className = 'dropdown-norelative';
    result.appendChild(toggle);
    result.appendChild(menu);

    // Initialize Bootstrap 5 dropdown programmatically
    setTimeout(() => {
      if (window.bootstrap && window.bootstrap.Dropdown) {
        const dropdownToggleEl = result.querySelector('.dropdown-toggle');
        if (dropdownToggleEl) new window.bootstrap.Dropdown(dropdownToggleEl);
      }
    }, 0);

    mEl.parentNode.replaceChild(result, mEl);
  });
}

export default {
  manipParseAndReplace,
  colorParseAndReplace,
};
