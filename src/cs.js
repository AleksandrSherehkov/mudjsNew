import loader from '@monaco-editor/loader';
import { rpccmd } from './websock.js';

function fixindent(fn, str) {
  const lines = String(str || '')
    .replace(/\r/g, '')
    .split('\n');
  return lines
    .map(line => {
      const parts = line.match(/^([ \t]*)(.*)$/) || ['', '', line];
      return fn(parts[1]) + parts[2];
    })
    .join('\n');
}

function tabsize8to4(str) {
  return String(str || '')
    .replace(/\t/g, '        ')
    .replace(/ {4}/g, '\t');
}

function tabsize4to8(str) {
  return String(str || '')
    .replace(/\r/g, '')
    .replace(/\t/g, '    ')
    .replace(/ {8}/g, '\t');
}

let monacoEditor;
let openFiles = {}; // { filename: { value: 'code', saved: true } }
let currentFile = null;

function markTabAsUnsaved(filename) {
  const span = document.querySelector(
    `#editor-tabs .nav-link[data-filename="${CSS.escape(filename)}"] span`
  );
  if (span && !span.textContent.startsWith('● ')) {
    span.textContent = '● ' + filename;
  }
}

function markTabAsSaved(filename) {
  const span = document.querySelector(
    `#editor-tabs .nav-link[data-filename="${CSS.escape(filename)}"] span`
  );
  if (span) span.textContent = filename;
}

function autoSaveCurrentFile() {
  if (currentFile && openFiles[currentFile]) {
    openFiles[currentFile].value = monacoEditor.getValue();
    openFiles[currentFile].saved = true;
    markTabAsSaved(currentFile);
  }
}

function switchToFile(filename) {
  if (!filename) return;
  autoSaveCurrentFile();

  currentFile = filename;

  // переключаем активную вкладку
  document
    .querySelectorAll('#editor-tabs .nav-link')
    .forEach(el => el.classList.remove('active'));
  const link = document.querySelector(
    `#editor-tabs .nav-link[data-filename="${CSS.escape(filename)}"]`
  );
  if (link) link.classList.add('active');

  // устанавливаем содержимое редактора и subject
  const entry = openFiles[filename];
  if (entry) {
    monacoEditor && monacoEditor.setValue(entry.value ?? '');
    const subj = document.getElementById('cs-subject');
    if (subj) subj.value = filename;
  }
}

function openFileTab(filename, content) {
  if (!filename) return;
  if (!openFiles[filename]) {
    openFiles[filename] = { value: content ?? '', saved: true };

    const li = document.createElement('li');
    li.className = 'nav-item';

    const a = document.createElement('a');
    a.className =
      'nav-link d-flex align-items-center justify-content-between pe-1';
    a.setAttribute('data-filename', filename);
    a.href = '#';

    const span = document.createElement('span');
    span.textContent = filename;

    const btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-link text-danger tab-close';
    btn.setAttribute('data-filename', filename);
    btn.style.padding = '0 4px';
    btn.type = 'button';
    btn.textContent = '✖';

    a.appendChild(span);
    a.appendChild(btn);
    li.appendChild(a);

    const tabs = document.getElementById('editor-tabs');
    tabs && tabs.appendChild(li);
  }
  switchToFile(filename);
}

document.addEventListener('DOMContentLoaded', () => {
  // Инициализация Monaco + язык "fenia"
  loader.init().then(monaco => {
    monaco.languages.register({ id: 'fenia' });
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
          [/\.[a-zA-Z_$][\w$]*/, 'identifier'],
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

    const editorElement = document.querySelector('#cs-modal .editor');
    if (editorElement) {
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
    }

    // Делегирование кликов по вкладкам и крестикам
    const editorTabs = document.getElementById('editor-tabs');
    if (editorTabs) {
      editorTabs.addEventListener('click', e => {
        const closeBtn = e.target.closest('.tab-close');
        if (closeBtn) {
          e.stopPropagation();
          e.preventDefault();
          const filename = closeBtn.getAttribute('data-filename');
          const li = closeBtn.closest('li');
          if (li) li.remove();
          delete openFiles[filename];
          if (currentFile === filename) {
            const firstRemaining = Object.keys(openFiles)[0];
            if (firstRemaining) {
              switchToFile(firstRemaining);
            } else {
              if (monacoEditor) monacoEditor.setValue('');
              currentFile = null;
              const subj = document.getElementById('cs-subject');
              if (subj) subj.value = '';
            }
          }
          return;
        }

        const link = e.target.closest('.nav-link');
        if (link) {
          e.preventDefault();
          const filename = link.getAttribute('data-filename');
          switchToFile(filename);
        }
      });
    }

    // Кнопка «Выполнить»
    const runBtn = document.querySelector('#cs-modal .run-button');
    if (runBtn) {
      runBtn.addEventListener('click', e => {
        e.preventDefault();
        const subjInput = document.getElementById('cs-subject');
        const subj = subjInput ? subjInput.value : '';
        if (currentFile && monacoEditor) {
          openFiles[currentFile].value = monacoEditor.getValue();
          openFiles[currentFile].saved = true;
          markTabAsSaved(currentFile);
        }
        const body = monacoEditor
          ? fixindent(tabsize4to8, monacoEditor.getValue())
          : '';
        rpccmd('cs_eval', subj, body);
      });
    }

    // Ctrl/Cmd + S
    window.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (runBtn) runBtn.click();
      }
    });

    // Открытие редактора по RPC-событию
    const rpcEvents = document.getElementById('rpc-events');
    if (rpcEvents) {
      rpcEvents.addEventListener('rpc-cs_edit', event => {
        const [subj, body] = Array.isArray(event.detail) ? event.detail : [];
        if (subj) {
          const subjInput = document.getElementById('cs-subject');
          if (subjInput) subjInput.value = subj;
        }
        if (body !== undefined) {
          openFileTab(subj || 'file.fenia', fixindent(tabsize8to4, body));
        }
        const modalElement = document.getElementById('cs-modal');
        if (modalElement && window.bootstrap?.Modal) {
          new window.bootstrap.Modal(modalElement).show();
        }
      });
    }
  });
});
