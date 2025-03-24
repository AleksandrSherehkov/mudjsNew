import $ from 'jquery';
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

$(document).ready(function () {
  loader.init().then(monaco => {
    // ⬇️ Расширяем подсветку языка JavaScript кастомными словами
    monaco.languages.setMonarchTokensProvider('javascript', {
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
        'RegList', // <-- твои кастомные
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
      // регулярные выражения
      symbols: /[=><!~?:&|+\-*\/^%]+/,
      tokenizer: {
        root: [
          [
            /[a-zA-Z_$][\w$]*/,
            {
              cases: {
                '@keywords': 'keyword',
                '@default': 'identifier',
              },
            },
          ],
          { include: '@whitespace' },
          [/[{}()\[\]]/, '@brackets'],
          [/@symbols/, 'operator'],
          [/\d+/, 'number'],
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
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment'],
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

    const editorElement = $('#cs-modal .editor')[0];
    monacoEditor = monaco.editor.create(editorElement, {
      value: '',
      language: 'javascript',
      theme: 'vs-dark',
      fontSize: 16,
      lineNumbers: 'off',
      wordWrap: 'on',
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      padding: { top: 20, bottom: 20 },
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: false,
      detectIndentation: false,
      formatOnType: true,
    });

    // Кнопка "Run"
    $('#cs-modal .run-button').click(function (e) {
      e.preventDefault();
      const subj = $('#cs-subject').val();
      const body = fixindent(tabsize4to8, monacoEditor.getValue());
      rpccmd('cs_eval', subj, body);
    });

    // Открытие модалки с кодом
    $('#rpc-events').on('rpc-cs_edit', function (e, subj, body) {
      if (subj) $('#cs-subject').val(subj);
      if (body) monacoEditor.setValue(fixindent(tabsize8to4, body));
      $('#cs-modal').modal('show');
    });
  });
});
