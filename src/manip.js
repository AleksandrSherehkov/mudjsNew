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

  // Send comman to the server when command hyper link is clicked
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
      e.relatedTarget.style.removeProperty('text-decoration');
    }
  });
});

// Replace colour "<c c='fgbr'/>" tags coming from the server with spans.
function colorParseAndReplace(span) {
  const cElements = span[0].querySelectorAll('c');
  cElements.forEach(function (element) {
    const style = element.getAttribute('c');
    const newSpan = document.createElement('span');
    newSpan.className = style;
    // Move all child nodes from the old element to the new span
    while (element.firstChild) {
      newSpan.appendChild(element.firstChild);
    }
    element.parentNode.replaceChild(newSpan, element);
  });
}

function manipParseAndReplace(span) {
  // Replace placeholders [map=filename.are] with buttons that open a map,
  // or with an empty string, if area is not found in the areas.json.
  var html = span.innerHTML
    .replace(/\[map=([-0-9a-z_]{1,15})\.are\]/g, function (match, p1) {
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
  const hcElements = span[0].querySelectorAll('hc');
  hcElements.forEach(function (element) {
    const action = element.textContent;
    const newSpan = document.createElement('span');
    newSpan.className = 'manip-cmd';
    newSpan.setAttribute('data-action', action);
    newSpan.setAttribute('data-echo', action);
    // Move all child nodes from the old element to the new span
    while (element.firstChild) {
      newSpan.appendChild(element.firstChild);
    }
    element.parentNode.replaceChild(newSpan, element);
  });

  // Replace "<hl>hyper link</hl>" tags surrounding hyper links.
  // Basic sanitization of the links.
  const hlElements = span[0].querySelectorAll('hl');
  hlElements.forEach(function (element) {
    const href = element.textContent;
    if (!href.startsWith('http')) return;

    const newLink = document.createElement('a');
    newLink.className = 'manip-link';
    newLink.setAttribute('href', href);
    newLink.setAttribute('target', '_blank');
    // Move all child nodes from the old element to the new link
    while (element.firstChild) {
      newLink.appendChild(element.firstChild);
    }
    element.parentNode.replaceChild(newLink, element);
  });

  // Replace "<hh>article name</hh>" or "<hh id='333'>" tags surrounding help articles.
  const hhElements = span.querySelectorAll('hh');
  hhElements.forEach(function (element) {
    var article = element.textContent;
    var id = element.getAttribute('id') || article;

    // Split the string into <initial spaces><label ending with non-space><ending spaces>
    var matches = article.match(/^( *)([\0-\uFFFF]*[^ ])( *)$/m);
    if (!matches || matches.length < 4) {
      // Do nothing for invalid help links.
      return;
    }

    var spaceBegin = matches[1].length;
    var spaceEnd = matches[3].length;
    var label = matches[2];

    // Recreate initial and ending spaces as nbsp, so that the underlining link only surrounds the label.
    var result =
      '&nbsp;'.repeat(spaceBegin) +
      '<span class="manip-cmd manip-link" data-action="help ' + id + '" data-echo="справка ' + id + '">' + label + '</span>' +
      '&nbsp;'.repeat(spaceEnd);
    
    element.outerHTML = result;
  });

  // Replace "<hg>skill group</hg>" tags surrounding group names.
  const hgElements = span.querySelectorAll('hg');
  hgElements.forEach(function (element) {
    var article = element.textContent;

    var result = document.createElement('span');
    result.className = 'manip-cmd';
    result.setAttribute('data-action', 'glist ' + article);
    result.setAttribute('data-echo', 'группаумен ' + article);
    result.textContent = article;
    
    element.parentNode.replaceChild(result, element);
  });

  // Replace "<hs>speedwalk</hs>" tags with 'run speedwalk' command.
  const hsElements = span.querySelectorAll('hs');
  hsElements.forEach(function (element) {
    var article = element.textContent;

    var result = document.createElement('span');
    result.className = 'manip-cmd manip-speedwalk';
    result.setAttribute('data-action', 'run ' + article);
    result.setAttribute('data-echo', 'бежать ' + article);
    result.textContent = article;
    
    element.parentNode.replaceChild(result, element);
  });

  // Replace item manipulation "<m i='234234' c='take $,put $ 12348'/>" tags surrounding every item.
  const mElements = span.querySelectorAll('m');
  mElements.forEach(function (element) {
    // Populate menu node for each item based on the 'c' and 'l' attributes containing command lists.
    // Mark menu nodes so that they can be removed and not mess up the triggers.
    var id = element.getAttribute('i');
    var menu = document.createElement('span');
    menu.className = 'dropdown-menu no-triggers';

    function addToMenu(cmd) {
      if (cmd.trim().length === 0) return;
      var action = cmd.replace(/\$/, id);
      // Menu entry visible to the user will only contain a meaningful word, without IDs or $ placeholders.
      var label = cmd.replace(/( *\$ *| *[0-9]{5,}|\.'.*')/g, '');
      
      var menuItem = document.createElement('a');
      menuItem.className = 'dropdown-item manip-item';
      menuItem.setAttribute('data-action', action);
      menuItem.setAttribute('data-echo', action);
      menuItem.setAttribute('href', '#');
      menuItem.textContent = label;
      
      menu.appendChild(menuItem);
    }

    // Main commands above the divider.
    if (element.hasAttribute('c')) {
      element.getAttribute('c')
        .split(',')
        .forEach(function (cmd) {
          addToMenu(cmd);
        });
    }

    // Commands only available in this room, below the divider.
    if (element.hasAttribute('l')) {
      var divider = document.createElement('div');
      divider.className = 'dropdown-divider';
      menu.appendChild(divider);
      
      element.getAttribute('l')
        .split(',')
        .forEach(function (cmd) {
          addToMenu(cmd);
        });
    }

    // Create drop-down toggle from item description text.
    var toggle = document.createElement('span');
    toggle.className = 'dropdown-toggle';
    toggle.setAttribute('data-bs-toggle', 'dropdown');
    // Move all child nodes from the original element to the toggle
    while (element.firstChild) {
      toggle.appendChild(element.firstChild);
    }

    // Replace '<m>' pseudo-tag with Popper dropdown markup.
    var result = document.createElement('span');
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
    
    element.parentNode.replaceChild(result, element);
  });
}

export default {
  manipParseAndReplace,
  colorParseAndReplace,
};
