import $ from './jquery-shim.js';
import loader from '@monaco-editor/loader';
import { rpccmd } from './websock.js';

function fixindent(fn, str) {
  const lines = str.replace(/\r/g, '').split('\n');
  return lines
    .map(line => {
      const parts = line.match(/^([ \t]*)(.*)$/);
      return fn(parts[1]) + parts[2];
    })
    .join('\n');
}

function tabsize8to4(str) {
  return str.replace(/\t/g, '        ').replace(/ {4}/g, '\t');
}

function tabsize4to8(str) {
  return str.replace(/\r/g, '').replace(/\t/g, '    ').replace(/ {8}/g, '\t');
}

let monacoEditor;
let openFiles = {}; // { filename: { value: 'code', saved: true } }
let currentFile = null;

$(document).ready(function () {
  loader.init().then(monaco => {
    // 🧠 Регистрация языка "fenia"
    monaco.languages.register({ id: 'fenia' });

    // 🧠 Настройка подсветки (токенов) для fenia
    monaco.languages.setMonarchTokensProvider('fenia', {
      keywords: [
        'if',
        'else',
        'function',
        'return',
        'var',
        'let',
        'const',
        'true',
        'false',
        'null',
        'undefined',
        'try',
        'catch',
        'Map',
        'RegList',
      ],
      operators: [
        '=',
        '>',
        '<',
        '!',
        '~',
        '?',
        ':',
        '==',
        '<=',
        '>=',
        '!=',
        '&&',
        '||',
        '++',
        '--',
        '+',
        '-',
        '*',
        '/',
        '&',
        '|',
        '^',
        '%',
        '<<',
        '>>',
        '>>>',
      ],
      symbols: /[=><!~?:&|+\-*/^%]+/,
      tokenizer: {
        root: [
          [/\.[a-zA-Z_$][\w$]*/, 'identifier'], // поддержка .tmp, ._Map
          [
            /[a-zA-Z_$][\w$]*/,
            { cases: { '@keywords': 'keyword', '@default': 'identifier' } },
          ],
          { include: '@whitespace' },
          [/\d+/, 'number'],
          [/[{}()[\]]/, '@brackets'],
          [/@symbols/, 'operator'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string_double'],
          [/'/, 'string', '@string_single'],
        ],
        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/\/\*/, 'comment', '@comment'],
          [/\/\/.*$/, 'comment'],
        ],
        comment: [
          [/[^/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[/*]/, 'comment'],
        ],
        string_double: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, 'string', '@pop'],
        ],
        string_single: [
          [/[^\\']+/, 'string'],
          [/\\./, 'string.escape'],
          [/'/, 'string', '@pop'],
        ],
      },
    });

    // 👇 Установка редактора с языком "fenia"
    const editorElement = $('#cs-modal .editor')[0];
    monacoEditor = monaco.editor.create(editorElement, {
      value: '',
      language: 'fenia',
      theme: 'vs-dark',
      fontSize: 16,
      lineNumbers: 'off',
      wordWrap: 'on',
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      padding: { top: 20, bottom: 20 },
      tabSize: 4,
      insertSpaces: false,
      detectIndentation: false,
      formatOnType: true,
    });

    monacoEditor.onDidChangeModelContent(() => {
      if (currentFile && openFiles[currentFile]) {
        openFiles[currentFile].saved = false;
        markTabAsUnsaved(currentFile);
      }
    });

    $('#editor-tabs').on('click', '.nav-link', function (e) {
      e.preventDefault();
      const filename = $(this).data('filename');
      switchToFile(filename);
    });

    $('#cs-modal .run-button').click(function (e) {
      e.preventDefault();
      const subj = $('#cs-subject').val();
      if (currentFile) {
        openFiles[currentFile].value = monacoEditor.getValue();
        openFiles[currentFile].saved = true;
        markTabAsSaved(currentFile);
      }
      const body = fixindent(tabsize4to8, monacoEditor.getValue());
      rpccmd('cs_eval', subj, body);
    });

    $(window).on('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        $('#cs-modal .run-button').trigger('click');
      }
    });

    $('#rpc-events').on('rpc-cs_edit', function (e, subj, body) {
      if (subj) $('#cs-subject').val(subj);
      if (body) openFileTab(subj || 'file.fenia', fixindent(tabsize8to4, body));
      
      // Use Bootstrap 5 native Modal API instead of jQuery
      const modalElement = document.getElementById('cs-modal');
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    });
  });
});

$('#editor-tabs').on('click', '.tab-close', function (e) {
  e.stopPropagation();
  const filename = $(this).data('filename');
  $(this).closest('li').remove();
  delete openFiles[filename];

  if (currentFile === filename) {
    const firstRemaining = Object.keys(openFiles)[0];
    if (firstRemaining) {
      switchToFile(firstRemaining);
    } else {
      monacoEditor.setValue('');
      currentFile = null;
      $('#cs-subject').val('');
    }
  }
});

function openFileTab(filename, content) {
  if (!openFiles[filename]) {
    openFiles[filename] = { value: content, saved: true };
    $('#editor-tabs').append(`
      <li class="nav-item">
        <a class="nav-link d-flex align-items-center justify-content-between pe-1" data-filename="${filename}" href="#">
          <span>${filename}</span>
          <button class="btn btn-sm btn-link text-danger tab-close" data-filename="${filename}" style="padding: 0 4px;">✖</button>
        </a>
      </li>
    `);
  }
  switchToFile(filename);
}

function autoSaveCurrentFile() {
  if (currentFile && openFiles[currentFile]) {
    openFiles[currentFile].value = monacoEditor.getValue();
    openFiles[currentFile].saved = true;
    markTabAsSaved(currentFile);
  }
}

function switchToFile(filename) {
  autoSaveCurrentFile();

  currentFile = filename;

  $('#editor-tabs .nav-link').removeClass('active');
  $(`#editor-tabs .nav-link[data-filename="${filename}"]`).addClass('active');

  monacoEditor.setValue(openFiles[filename].value);
  $('#cs-subject').val(filename);
}

function markTabAsUnsaved(filename) {
  const $tab = $(`#editor-tabs .nav-link[data-filename="${filename}"] span`);
  if (!$tab.text().startsWith('● ')) {
    $tab.text('● ' + filename);
  }
}

function markTabAsSaved(filename) {
  const $tab = $(`#editor-tabs .nav-link[data-filename="${filename}"] span`);
  $tab.text(filename);
}
