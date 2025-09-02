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

document.addEventListener('DOMContentLoaded', function () {
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
    const editorElement = document.querySelector('#cs-modal .editor');
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

    const editorTabs = document.getElementById('editor-tabs');
    if (editorTabs) {
      editorTabs.addEventListener('click', function (e) {
        const navLink = e.target.closest('.nav-link');
        if (navLink) {
          e.preventDefault();
          const filename = navLink.dataset.filename;
          switchToFile(filename);
        }
      });
    }

    const runButton = document.querySelector('#cs-modal .run-button');
    if (runButton) {
      runButton.addEventListener('click', function (e) {
        e.preventDefault();
        const subjInput = document.getElementById('cs-subject');
        const subj = subjInput ? subjInput.value : '';
        if (currentFile) {
          openFiles[currentFile].value = monacoEditor.getValue();
          openFiles[currentFile].saved = true;
          markTabAsSaved(currentFile);
        }
        const body = fixindent(tabsize4to8, monacoEditor.getValue());
        rpccmd('cs_eval', subj, body);
      });
    }

    window.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const runButton = document.querySelector('#cs-modal .run-button');
        if (runButton) {
          runButton.click();
        }
      }
    });

    const rpcEvents = document.getElementById('rpc-events');
    if (rpcEvents) {
      rpcEvents.addEventListener('rpc-cs_edit', function (e) {
        const [subj, body] = e.detail;
        const subjInput = document.getElementById('cs-subject');
        if (subj && subjInput) subjInput.value = subj;
        if (body) openFileTab(subj || 'file.fenia', fixindent(tabsize8to4, body));
        
        // Use Bootstrap 5 native Modal API instead of jQuery
        const modalElement = document.getElementById('cs-modal');
        const modal = new window.bootstrap.Modal(modalElement);
        modal.show();
      });
    }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const editorTabs = document.getElementById('editor-tabs');
  if (editorTabs) {
    editorTabs.addEventListener('click', function (e) {
      const closeButton = e.target.closest('.tab-close');
      if (closeButton) {
        e.stopPropagation();
        const filename = closeButton.dataset.filename;
        closeButton.closest('li').remove();
        delete openFiles[filename];

        if (currentFile === filename) {
          const firstRemaining = Object.keys(openFiles)[0];
          if (firstRemaining) {
            switchToFile(firstRemaining);
          } else {
            monacoEditor.setValue('');
            currentFile = null;
            const subjInput = document.getElementById('cs-subject');
            if (subjInput) subjInput.value = '';
          }
        }
      }
    });
  }
});

function openFileTab(filename, content) {
  if (!openFiles[filename]) {
    openFiles[filename] = { value: content, saved: true };
    const editorTabs = document.getElementById('editor-tabs');
    if (editorTabs) {
      const li = document.createElement('li');
      li.className = 'nav-item';
      li.innerHTML = `
        <a class="nav-link d-flex align-items-center justify-content-between pe-1" data-filename="${filename}" href="#">
          <span>${filename}</span>
          <button class="btn btn-sm btn-link text-danger tab-close" data-filename="${filename}" style="padding: 0 4px;">✖</button>
        </a>
      `;
      editorTabs.appendChild(li);
    }
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

  const allNavLinks = document.querySelectorAll('#editor-tabs .nav-link');
  allNavLinks.forEach(link => link.classList.remove('active'));
  
  const activeLink = document.querySelector(`#editor-tabs .nav-link[data-filename="${filename}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  monacoEditor.setValue(openFiles[filename].value);
  const subjInput = document.getElementById('cs-subject');
  if (subjInput) {
    subjInput.value = filename;
  }
}

function markTabAsUnsaved(filename) {
  const tab = document.querySelector(`#editor-tabs .nav-link[data-filename="${filename}"] span`);
  if (tab && !tab.textContent.startsWith('● ')) {
    tab.textContent = '● ' + filename;
  }
}

function markTabAsSaved(filename) {
  const tab = document.querySelector(`#editor-tabs .nav-link[data-filename="${filename}"] span`);
  if (tab) {
    tab.textContent = filename;
  }
}
