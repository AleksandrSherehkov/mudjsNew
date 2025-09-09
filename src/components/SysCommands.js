import hotkeyCmd, { hotkeyHelp } from './sysCommands/hotkey';
import propertiesCmd, { settingsHelp } from './sysCommands/userProperties';
import helpCmd, { helpHelp } from './sysCommands/help';
import varCmd, { varHelp } from './sysCommands/var';
import deleteCmd, { deleteHelp } from './sysCommands/delete';
import actionCmd, { actionHelp } from './sysCommands/action';

const multiCmdHelp = {
  title: `Выполнить указанную команду несколько раз, подробнее ${clickableLink(
    '#help multiCmd'
  )}`,
  description: `Синтаксис:
#number action - выполнить команду action указанное число раз (number)

Примеры:
#10 новость
#3 сбежать|возврат

`,
};

const cmdAliases = {
  удалить: 'delete',
  справка: 'help',
  кнопка: 'hotkey',
  настройки: 'settings',
  переменная: 'var',
  действие: 'action',
};

const Commands = {
  action: {
    payload(value) {
      actionCmd(value);
    },
    help: {
      title: actionHelp.title,
      description: actionHelp.description,
    },
  },
  help: {
    payload(value) {
      helpCmd(value);
    },
    help: {
      title: helpHelp.title,
      description: helpHelp.description,
    },
  },
  hotkey: {
    payload(value) {
      hotkeyCmd(value);
    },
    help: {
      title: hotkeyHelp.title,
      description: hotkeyHelp.description,
    },
  },
  var: {
    payload(value) {
      varCmd(value);
    },
    help: {
      title: varHelp.title,
      description: varHelp.description,
    },
  },
  multiCmd: {
    payload(value) {
      const { sysCmd, sysCmdArgs } = splitCommand(value);
      const count = parseInt(sysCmd, 10);
      if (Number.isNaN(count) || count <= 0) return;
      const text = String(sysCmdArgs).trim();

      // Эмуляция: $('.trigger').trigger('input', [text])
      document.querySelectorAll('.trigger').forEach(el => {
        el.dispatchEvent(new CustomEvent('input', { detail: text }));
      });
    },
    help: multiCmdHelp,
  },
  settings: {
    payload(value) {
      propertiesCmd(value);
    },
    help: {
      title: settingsHelp.title,
      description: settingsHelp.description,
    },
  },
  delete: {
    payload(value) {
      deleteCmd(value);
    },
    help: {
      title: deleteHelp.title,
      description: deleteHelp.description,
    },
  },
};

export function getSystemCmd(cmd) {
  const re = new RegExp(cmd);
  for (const command in Commands) {
    if (re.test(command)) return command;
  }
  for (const alias in cmdAliases) {
    if (re.test(alias)) return cmdAliases[alias];
  }
}

export function getSystemCmdAliases(cmd) {
  let string = '';
  const aliases = [];
  for (const alias in cmdAliases) {
    if (cmdAliases[alias] === cmd) aliases.push(alias);
  }
  if (aliases[0]) {
    string += '( ';
    for (let i = 0; i < aliases.length; i++) {
      string += `${clickableLink('#' + aliases[i])} `;
    }
    string += ') ';
  }
  return string;
}

export const errCmdDoesNotExist = `Этой команды не существует, набери ${clickableLink(
  '#help'
)} для получения списка доступных команд. \n`;

export function clickableLink(cmd) {
  return `<span class="builtin-cmd manip-link" data-action="${cmd}" data-echo="${cmd}">${cmd}</span>`;
}

export function parseStringCmd(value) {
  return String(value || '')
    .trim()
    .split(' ');
}

export function splitCommand(value) {
  const parts = String(value || '').split(' ');
  const sysCmd = (parts[0] || '').substr(1);
  const sysCmdArgs = parts.slice(1).join(' ');
  return { sysCmd, sysCmdArgs };
}

export function echoHtml(html) {
  if (!html) return;
  // Эмуляция: $('.terminal').trigger('output-html', html)
  document.querySelectorAll('.terminal').forEach(termEl => {
    termEl.dispatchEvent(new CustomEvent('output-html', { detail: html }));
  });
}

export default Commands;
