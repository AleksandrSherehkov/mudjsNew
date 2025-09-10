import areasJson from './data/areas.json';
import { send, ws } from './websock.js';
import { echo } from './input.js';

// Create the list of all possible area file names (without ".are" bit).
const areas = areasJson.map(a => a.file.replace('.are', ''));

document.addEventListener('DOMContentLoaded', function () {
  // Control panel buttons.
  document.body.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-ctrl-panel')) {
      var cmd = e.target.getAttribute('data-action');
      var conf = e.target.getAttribute('data-confirm');

      if (
        conf !== undefined &&
        !window.confirm('Вы действительно хотите ' + conf + '?')
      )
        return;

      echo(cmd);
      send(cmd);
    }
  });

  // Send command to the server when command hyper link is clicked
  // e. g. 'read sign' or 'walk trap'.
  document.body.addEventListener('click', function (e) {
    if (e.target.classList.contains('manip-cmd')) {
      var cmd = e.target;
      echo(cmd.getAttribute('data-echo'));
      send(cmd.getAttribute('data-action'));
    }
  });

  // Send command to the server when individual menu item is clicked.
  document.body.addEventListener('click', function (e) {
    if (e.target.classList.contains('manip-item')) {
      var cmd = e.target;
      echo(cmd.getAttribute('data-echo'));
      send(cmd.getAttribute('data-action'));
    }
  });

  // Underline current selection when dropdown is shown (Bootstrap 5 event).
  document.body.addEventListener('show.bs.dropdown', function (e) {
    if (e.target.classList.contains('dropdown')) {
      e.relatedTarget.style.textDecoration = 'underline';
    }
  });

  // Remove underline when dropdown is hidden (Bootstrap 5 event).
  document.body.addEventListener('hide.bs.dropdown', function (e) {
    if (e.target.classList.contains('dropdown')) {
      e.relatedTarget.removeAttribute('style');
    }
  });
});

// Replace colour "<c c='fgbr'/>" tags coming from the server with spans.
function colorParseAndReplace(element) {
  const cElements = element.querySelectorAll('c');
  cElements.forEach(function (cEl) {
    var style = cEl.getAttribute('c');
    var span = document.createElement('span');
    span.className = style;
    // Move all child nodes from c element to span
    while (cEl.firstChild) {
      span.appendChild(cEl.firstChild);
    }
    cEl.parentNode.replaceChild(span, cEl);
  });
}

function manipParseAndReplace(element) {
  // Replace placeholders [map=filename.are] with buttons that open a map,
  // or with an empty string, if area is not found in the areas.json.
  var html = element.innerHTML.replace(/\[map=([-0-9a-z_]{1,15})\.are\]/g, function (match, p1) {
      if (areas.indexOf(p1) === -1) return '';
      return (
        '<a class="btn btn-sm btn-outline-info btn-orange" href="https://dreamland.rocks/maps/' +
        p1 +
        '.html" target=_blank>открыть карту</a>'
      );
    });

  // Replace extra-description placeholders [read=sign знак,see=sign] with (<span class="manip-cmd manip-ed" data-action="read 'sign знак'">sign</span>).
  // Returns empty string if 'see' part is not contained within 'read' part.
  html = html.replace(
    /\[read=([^,]{1,100}),see=([^\]]{1,30})]/gi,
    function (match, p1, p2) {
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

      // Replace argument placeholder.
      var action = cmd.replace(/\$1/, see);

      // The link will only surround the message itself, spaces are not underlined.
      return see.replace(
        /^( *)(.*[^ ])( *)$/,
        function (match, spaceBegin, msg, spaceEnd) {
          var label;
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

  // Replace "<hc>command</hc>" tags surrounding commands to send as is.
  const hcElements = element.querySelectorAll('hc');
  hcElements.forEach(function (hcEl) {
    const cmd = hcEl.textContent;
    const span = document.createElement('span');
    span.className = 'manip-cmd';
    span.setAttribute('data-action', cmd);
    span.setAttribute('data-echo', cmd);
    // Move all child nodes from hc element to span
    while (hcEl.firstChild) {
      span.appendChild(hcEl.firstChild);
    }
    hcEl.parentNode.replaceChild(span, hcEl);
  });

  // Replace "<hl>hyper link</hl>" tags surrounding hyper links.
  // Basic sanitization of the links.
  const hlElements = element.querySelectorAll('hl');
  hlElements.forEach(function (hlEl) {
    const href = hlEl.textContent;
    if (!href.startsWith('http')) return;

    const link = document.createElement('a');
    link.className = 'manip-link';
    link.setAttribute('href', href);
    link.setAttribute('target', '_blank');
    // Move all child nodes from hl element to link
    while (hlEl.firstChild) {
      link.appendChild(hlEl.firstChild);
    }
    hlEl.parentNode.replaceChild(link, hlEl);
  });

  // Replace "<hh>article name</hh>" or "<hh id='333'>" tags surrounding help articles.
  const hhElements = element.querySelectorAll('hh');
  hhElements.forEach(function (hhEl) {
    const article = hhEl.textContent;
    const id = hhEl.getAttribute('id') || article;

    // Split the string into <initial spaces><label ending with non-space><ending spaces>
    const matches = article.match(/^( *)([\0-\uFFFF]*[^ ])( *)$/m);
    if (!matches || matches.length < 4) {
      // Do nothing for invalid help links.
      return;
    }

    const spaceBegin = matches[1].length;
    const spaceEnd = matches[3].length;
    const label = matches[2];

    // Recreate initial and ending spaces as nbsp, so that the underlining link only surrounds the label.
    const span = document.createElement('span');
    span.className = 'manip-cmd manip-link';
    span.setAttribute('data-action', 'help ' + id);
    span.setAttribute('data-echo', 'справка ' + id);
    span.textContent = label;

    const replacement = '&nbsp;'.repeat(spaceBegin) + span.outerHTML + '&nbsp;'.repeat(spaceEnd);
    hhEl.outerHTML = replacement;
  });

  // Replace "<hg>skill group</hg>" tags surrounding group names.
  const hgElements = element.querySelectorAll('hg');
  hgElements.forEach(function (hgEl) {
    const article = hgEl.textContent;
    const span = document.createElement('span');
    span.className = 'manip-cmd';
    span.setAttribute('data-action', 'glist ' + article);
    span.setAttribute('data-echo', 'группаумен ' + article);
    // Move all child nodes from hg element to span
    while (hgEl.firstChild) {
      span.appendChild(hgEl.firstChild);
    }
    hgEl.parentNode.replaceChild(span, hgEl);
  });

  // Replace "<hs>speedwalk</hs>" tags with 'run speedwalk' command.
  const hsElements = element.querySelectorAll('hs');
  hsElements.forEach(function (hsEl) {
    const article = hsEl.textContent;
    const span = document.createElement('span');
    span.className = 'manip-cmd manip-speedwalk';
    span.setAttribute('data-action', 'run ' + article);
    span.setAttribute('data-echo', 'бежать ' + article);
    // Move all child nodes from hs element to span
    while (hsEl.firstChild) {
      span.appendChild(hsEl.firstChild);
    }
    hsEl.parentNode.replaceChild(span, hsEl);
  });

  // Replace item manipulation "<m i='234234' c='take $,put $ 12348'/>" tags surrounding every item.
  const mElements = element.querySelectorAll('m');
  mElements.forEach(function (mEl) {
    // Populate menu node for each item based on the 'c' and 'l' attributes containing command lists.
    // Mark menu nodes so that they can be removed and not mess up the triggers.
    const id = mEl.getAttribute('i');
    const menu = document.createElement('span');
    menu.className = 'dropdown-menu no-triggers';

    function addToMenu(cmd) {
      if (cmd.trim().length === 0) return;
      const action = cmd.replace(/\$/, id);
      // Menu entry visible to the user will only contain a meaningful word, without IDs or $ placeholders.
      const label = cmd.replace(/( *\$ *| *[0-9]{5,}|\.'.*')/g, '');
      const link = document.createElement('a');
      link.className = 'dropdown-item manip-item';
      link.setAttribute('data-action', action);
      link.setAttribute('href', '#');
      link.textContent = label;
      menu.appendChild(link);
    }

    // Main commands above the divider.
    if (mEl.hasAttribute('c')) {
      const commands = mEl.getAttribute('c').split(',');
      commands.forEach(cmd => addToMenu(cmd));
    }

    // Commands only available in this room, below the divider.
    if (mEl.hasAttribute('l')) {
      const divider = document.createElement('div');
      divider.className = 'dropdown-divider';
      menu.appendChild(divider);
      const localCommands = mEl.getAttribute('l').split(',');
      localCommands.forEach(cmd => addToMenu(cmd));
    }

    // Create drop-down toggle from item description text.
    const toggle = document.createElement('span');
    toggle.className = 'dropdown-toggle';
    toggle.setAttribute('data-bs-toggle', 'dropdown');
    // Move all child nodes from m element to toggle
    while (mEl.firstChild) {
      toggle.appendChild(mEl.firstChild);
    }

    // Replace '<m>' pseudo-tag with Popper dropdown markup.
    const result = document.createElement('span');
    result.className = 'dropdown-norelative';
    result.appendChild(toggle);
    result.appendChild(menu);
    
    // Initialize Bootstrap 5 dropdown programmatically
    setTimeout(() => {
      if (window.bootstrap && window.bootstrap.Dropdown) {
        const dropdownToggleEl = result.querySelector('.dropdown-toggle');
        if (dropdownToggleEl) {
          new window.bootstrap.Dropdown(dropdownToggleEl);
        }
      }
    }, 0);
    
    mEl.parentNode.replaceChild(result, mEl);
  });
}

export default {
  manipParseAndReplace,
  colorParseAndReplace,
};
