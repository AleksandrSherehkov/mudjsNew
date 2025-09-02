import { onDocumentReady, onDelegate, attr, css, replaceWith, contents, createElement, append, find, each, html, text } from './utils/domUtils.js';
import areasJson from './data/areas.json';
import { send, ws } from './websock.js';
import { echo } from './input.js';

// Create the list of all possible area file names (without ".are" bit).
const areas = areasJson.map(a => a.file.replace('.are', ''));

onDocumentReady(function () {
  // Control panel buttons.
  onDelegate('body', 'click', '.btn-ctrl-panel', function (e) {
    var cmd = attr(e.currentTarget, 'data-action');
    var conf = attr(e.currentTarget, 'data-confirm');

    if (
      conf !== undefined &&
      !window.confirm('Вы действительно хотите ' + conf + '?')
    )
      return;

    echo(cmd);
    send(cmd);
  });

  // Send comman to the server when command hyper link is clicked
  // e. g. 'read sign' or 'walk trap'.
  onDelegate('body', 'click', '.manip-cmd', function (e) {
    var cmd = e.currentTarget;
    echo(attr(cmd, 'data-echo'));
    send(attr(cmd, 'data-action'));
  });

  // Send command to the server when individual menu item is clicked.
  onDelegate('body', 'click', '.manip-item', function (e) {
    var cmd = e.currentTarget;
    echo(attr(cmd, 'data-echo'));
    send(attr(cmd, 'data-action'));
  });

  // Underline current selection when dropdown is shown (Bootstrap 5 event).
  onDelegate('body', 'show.bs.dropdown', '.dropdown', function (e) {
    css(e.relatedTarget, 'text-decoration', 'underline');
  });

  // Remove underline when dropdown is hidden (Bootstrap 5 event).
  onDelegate('body', 'hide.bs.dropdown', '.dropdown', function (e) {
    e.relatedTarget.removeAttribute('style');
  });
});

// Replace colour "<c c='fgbr'/>" tags coming from the server with spans.
function colorParseAndReplace(span) {
  const colorElements = find(span, 'c');
  each(colorElements, function () {
    var style = attr(this, 'c');
    replaceWith(this, function () {
      var result = createElement('span');
      const childNodes = contents(this);
      childNodes.forEach(child => result.appendChild(child));
      result.classList.add(style);
      return result;
    });
  });
}

function manipParseAndReplace(span) {
  // Replace placeholders [map=filename.are] with buttons that open a map,
  // or with an empty string, if area is not found in the areas.json.
  var htmlContent = html(span)
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
  htmlContent = htmlContent.replace(
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
  htmlContent = htmlContent.replace(
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

  html(span, htmlContent);

  // Replace "<hc>command</hc>" tags surrounding commands to send as is.
  const hcElements = find(span, 'hc');
  each(hcElements, function () {
    var cmd = contents(this);

    replaceWith(this, function () {
      var action = text(this);
      var result = createElement('span', {
        class: 'manip-cmd',
        'data-action': action,
        'data-echo': action
      });
      cmd.forEach(child => result.appendChild(child));
      return result;
    });
  });

  // Replace "<hl>hyper link</hl>" tags surrounding hyper links.
  // Basic sanitization of the links.
  const hlElements = find(span, 'hl');
  each(hlElements, function () {
    var content = contents(this);
    var href = text(this);
    if (!href.startsWith('http')) return;

    replaceWith(this, function () {
      var result = createElement('a', {
        class: 'manip-link',
        href: href,
        target: '_blank'
      });
      content.forEach(child => result.appendChild(child));
      return result;
    });
  });

  // Replace "<hh>article name</hh>" or "<hh id='333'>" tags surrounding help articles.
  const hhElements = find(span, 'hh');
  each(hhElements, function () {
    var article = text(this);
    var id = attr(this, 'id') || article;

    // Split the string into <initial spaces><label ending with non-space><ending spaces>
    var matches = article.match(/^( *)([\0-\uFFFF]*[^ ])( *)$/m);
    if (!matches || matches.length < 4) {
      // Do nothing for invalid help links.
      return;
    }

    var spaceBegin = matches[1].length;
    var spaceEnd = matches[3].length;
    var label = matches[2];

    replaceWith(this, function () {
      // Recreate initial and ending spaces as nbsp, so that the underlining link only surrounds the label.
      var result =
        '&nbsp;'.repeat(spaceBegin) +
        createElement('span', {
          class: 'manip-cmd manip-link',
          'data-action': 'help ' + id,
          'data-echo': 'справка ' + id,
          text: label
        }).outerHTML +
        '&nbsp;'.repeat(spaceEnd);
      return result;
    });
  });

  // Replace "<hg>skill group</hg>" tags surrounding group names.
  const hgElements = find(span, 'hg');
  each(hgElements, function () {
    var article = contents(this);

    replaceWith(this, function () {
      var result = createElement('span', {
        class: 'manip-cmd',
        'data-action': 'glist ' + text(this),
        'data-echo': 'группаумен ' + text(this)
      });
      article.forEach(child => result.appendChild(child));
      return result;
    });
  });

  // Replace "<hs>speedwalk</hs>" tags with 'run speedwalk' command.
  const hsElements = find(span, 'hs');
  each(hsElements, function () {
    var article = contents(this);

    replaceWith(this, function () {
      var result = createElement('span', {
        class: 'manip-cmd manip-speedwalk',
        'data-action': 'run ' + text(this),
        'data-echo': 'бежать ' + text(this)
      });
      article.forEach(child => result.appendChild(child));
      return result;
    });
  });

  // Replace item manipulation "<m i='234234' c='take $,put $ 12348'/>" tags surrounding every item.
  const mElements = find(span, 'm');
  each(mElements, function () {
    // Populate menu node for each item based on the 'c' and 'l' attributes containing command lists.
    // Mark menu nodes so that they can be removed and not mess up the triggers.
    var id = attr(this, 'i');
    var menu = createElement('span', { class: 'dropdown-menu no-triggers' });

    function addToMenu(cmd) {
      if (cmd.trim().length === 0) return;
      var action = cmd.replace(/\$/, id);
      // Menu entry visible to the user will only contain a meaningful word, without IDs or $ placeholders.
      var label = cmd.replace(/( *\$ *| *[0-9]{5,}|\.'.*')/g, '');
      
      const menuItem = createElement('a', {
        class: 'dropdown-item manip-item',
        'data-action': action,
        'data-echo': action,
        href: '#',
        text: label
      });
      append(menu, menuItem);
    }

    // Main commands above the divider.
    if (this.hasAttribute('c')) {
      attr(this, 'c')
        .split(',')
        .map(function (cmd) {
          addToMenu(cmd);
          return cmd;
        });
    }

    // Commands only available in this room, below the divider.
    if (this.hasAttribute('l')) {
      var divider = createElement('div', { class: 'dropdown-divider' });
      append(menu, divider);
      
      attr(this, 'l')
        .split(',')
        .map(function (cmd) {
          addToMenu(cmd);
          return cmd;
        });
    }

    // Create drop-down toggle from item description text.
    var toggle = createElement('span', {
      class: 'dropdown-toggle',
      'data-bs-toggle': 'dropdown'
    });
    const itemContents = contents(this);
    itemContents.forEach(child => toggle.appendChild(child));

    // Replace '<m>' pseudo-tag with Popper dropdown markup.
    replaceWith(this, function () {
      var result = createElement('span', { class: 'dropdown-norelative' });
      append(result, toggle);
      append(result, menu);
      
      // Initialize Bootstrap 5 dropdown programmatically
      setTimeout(() => {
        if (window.bootstrap && window.bootstrap.Dropdown) {
          const dropdownToggleEl = result.querySelector('.dropdown-toggle');
          if (dropdownToggleEl) {
            new window.bootstrap.Dropdown(dropdownToggleEl);
          }
        }
      }, 0);
      
      return result;
    });
  });
}

export default {
  manipParseAndReplace,
  colorParseAndReplace,
};
