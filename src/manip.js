import areasJson from './data/areas.json';
import { send, ws } from './websock.js';
import { echo } from './input.js';

// Create the list of all possible area file names (without ".are" bit).
const areas = areasJson.map(a => a.file.replace('.are', ''));

document.addEventListener('DOMContentLoaded', function () {
  // Control panel buttons.
  document.body.addEventListener('click', function (e) {
    const target = e.target.closest('.btn-ctrl-panel');
    if (target) {
      var cmd = target.getAttribute('data-action');
      var conf = target.getAttribute('data-confirm');

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
    const target = e.target.closest('.manip-cmd');
    if (target) {
      echo(target.getAttribute('data-echo'));
      send(target.getAttribute('data-action'));
    }
  });

  // Send command to the server when individual menu item is clicked.
  document.body.addEventListener('click', function (e) {
    const target = e.target.closest('.manip-item');
    if (target) {
      echo(target.getAttribute('data-echo'));
      send(target.getAttribute('data-action'));
    }
  });

  // Underline current selection when dropdown is shown (Bootstrap 5 event).
  document.body.addEventListener('show.bs.dropdown', function (e) {
    if (e.relatedTarget) {
      e.relatedTarget.style.textDecoration = 'underline';
    }
  });

  // Remove underline when dropdown is hidden (Bootstrap 5 event).
  document.body.addEventListener('hide.bs.dropdown', function (e) {
    if (e.relatedTarget) {
      e.relatedTarget.removeAttribute('style');
    }
  });
});

// Helper function to create element with attributes and content
function createElement(tag, attrs = {}, content = '') {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  if (content) {
    if (typeof content === 'string') {
      element.innerHTML = content;
    } else {
      element.appendChild(content);
    }
  }
  return element;
}

// Replace colour "<c c='fgbr'/>" tags coming from the server with spans.
function colorParseAndReplace(span) {
  const cElements = span.querySelectorAll('c');
  cElements.forEach(function (cElement) {
    var style = cElement.getAttribute('c');
    var newSpan = createElement('span', { className: style });
    
    // Move all child nodes to the new span
    while (cElement.firstChild) {
      newSpan.appendChild(cElement.firstChild);
    }
    
    cElement.parentNode.replaceChild(newSpan, cElement);
  });
}

function manipParseAndReplace(span) {
  // Replace placeholders [map=filename.are] with buttons that open a map,
  // or with an empty string, if area is not found in the areas.json.
  var html = span.innerHTML;
  html = html.replace(/\[map=([-0-9a-z_]{1,15})\.are\]/g, function (match, p1) {
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

  span.innerHTML = html;

  // Replace "<hc>command</hc>" tags surrounding commands to send as is.
  const hcElements = span.querySelectorAll('hc');
  hcElements.forEach(function (hcElement) {
    var cmd = Array.from(hcElement.childNodes);
    var action = hcElement.textContent;
    
    var newSpan = createElement('span', {
      className: 'manip-cmd',
      'data-action': action,
      'data-echo': action
    });
    
    cmd.forEach(node => newSpan.appendChild(node.cloneNode(true)));
    hcElement.parentNode.replaceChild(newSpan, hcElement);
  });

  // Replace "<hl>hyper link</hl>" tags surrounding hyper links.
  // Basic sanitization of the links.
  const hlElements = span.querySelectorAll('hl');
  hlElements.forEach(function (hlElement) {
    var content = Array.from(hlElement.childNodes);
    var href = hlElement.textContent;
    if (!href.startsWith('http')) return;

    var newLink = createElement('a', {
      target: '_blank',
      className: 'manip-link',
      href: href
    });
    
    content.forEach(node => newLink.appendChild(node.cloneNode(true)));
    hlElement.parentNode.replaceChild(newLink, hlElement);
  });

  // Replace "<hh>article name</hh>" or "<hh id='333'>" tags surrounding help articles.
  const hhElements = span.querySelectorAll('hh');
  hhElements.forEach(function (hhElement) {
    var article = hhElement.textContent;
    var id = hhElement.getAttribute('id') || article;

    // Split the string into <initial spaces><label ending with non-space><ending spaces>
    var matches = article.match(/^( *)([\0-\uFFFF]*[^ ])( *)$/m);
    if (!matches || matches.length < 4) {
      // Do nothing for invalid help links.
      return;
    }

    var spaceBegin = matches[1].length;
    var spaceEnd = matches[3].length;
    var label = matches[2];

    var newSpan = createElement('span', {
      className: 'manip-cmd manip-link',
      'data-action': 'help ' + id,
      'data-echo': 'справка ' + id
    }, label);

    // Recreate initial and ending spaces as nbsp, so that the underlining link only surrounds the label.
    var result =
      '&nbsp;'.repeat(spaceBegin) +
      newSpan.outerHTML +
      '&nbsp;'.repeat(spaceEnd);
    
    hhElement.outerHTML = result;
  });

  // Replace "<hg>skill group</hg>" tags surrounding group names.
  const hgElements = span.querySelectorAll('hg');
  hgElements.forEach(function (hgElement) {
    var article = hgElement.textContent;

    var newSpan = createElement('span', {
      className: 'manip-cmd',
      'data-action': 'glist ' + article,
      'data-echo': 'группаумен ' + article
    }, article);
    
    hgElement.parentNode.replaceChild(newSpan, hgElement);
  });

  // Replace "<hs>speedwalk</hs>" tags with 'run speedwalk' command.
  const hsElements = span.querySelectorAll('hs');
  hsElements.forEach(function (hsElement) {
    var article = hsElement.textContent;

    var newSpan = createElement('span', {
      className: 'manip-cmd manip-speedwalk',
      'data-action': 'run ' + article,
      'data-echo': 'бежать ' + article
    }, article);
    
    hsElement.parentNode.replaceChild(newSpan, hsElement);
  });

  // Replace item manipulation "<m i='234234' c='take $,put $ 12348'/>" tags surrounding every item.
  const mElements = span.querySelectorAll('m');
  mElements.forEach(function (mElement) {
    // Populate menu node for each item based on the 'c' and 'l' attributes containing command lists.
    // Mark menu nodes so that they can be removed and not mess up the triggers.
    var id = mElement.getAttribute('i');
    var menu = createElement('span', { className: 'dropdown-menu no-triggers' });

    function addToMenu(cmd) {
      if (cmd.trim().length === 0) return;
      var action = cmd.replace(/\$/, id);
      // Menu entry visible to the user will only contain a meaningful word, without IDs or $ placeholders.
      var label = cmd.replace(/( *\$ *| *[0-9]{5,}|\.'.*')/g, '');
      
      var menuItem = createElement('a', {
        className: 'dropdown-item manip-item',
        'data-action': action,
        href: '#'
      }, label);
      
      menu.appendChild(menuItem);
    }

    // Main commands above the divider.
    if (mElement.hasAttribute('c')) {
      mElement.getAttribute('c')
        .split(',')
        .forEach(function (cmd) {
          addToMenu(cmd);
        });
    }

    // Commands only available in this room, below the divider.
    if (mElement.hasAttribute('l')) {
      var divider = createElement('div', { className: 'dropdown-divider' });
      menu.appendChild(divider);
      mElement.getAttribute('l')
        .split(',')
        .forEach(function (cmd) {
          addToMenu(cmd);
        });
    }

    // Create drop-down toggle from item description text.
    var toggle = createElement('span', {
      className: 'dropdown-toggle',
      'data-bs-toggle': 'dropdown'
    });
    
    // Move all child nodes to the toggle
    while (mElement.firstChild) {
      toggle.appendChild(mElement.firstChild);
    }

    // Replace '<m>' pseudo-tag with Popper dropdown markup.
    var result = createElement('span', { className: 'dropdown-norelative' });
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
    
    mElement.parentNode.replaceChild(result, mElement);
  });
}

export default {
  manipParseAndReplace,
  colorParseAndReplace,
};
