/* Этот файл будет сохранен в браузере (в LocalStorage.settings).
 * В переменной mudprompt хранится много полезной информации о персонаже.
 * Расшифровка аффектов: см. исходники клиента.
 *
 * Версия без jQuery: подписывается на #triggers и .trigger, а также на #input input.
 */

(() => {
  // ====== Утилиты окружения ======
  const $id = sel => document.getElementById(sel);
  const $qs = sel => document.querySelector(sel);

  // Глобальные функции предоставляет клиент:
  // send(cmd), echo(txt), notify(txt), mudprompt
  const safeSend = cmd => {
    try {
      send(cmd);
    } catch (e) {
      console.warn('send() missing?', e);
    }
  };
  const safeEcho = txt => {
    try {
      echo(txt);
    } catch (e) {
      console.warn('echo() missing?', e);
    }
  };
  const safeNotify = txt => {
    try {
      notify(txt);
    } catch (e) {
      console.warn('notify() missing?', e);
    }
  };

  // ====== Состояние (дефолты) ======
  let victim = 'Бандит'; // текущая мишень для дальних атак
  let doorToBash = 'n'; // направление выбивания
  let weapon = 'dagger'; // оружие для триггера обезоруживания

  // ====== Триггеры по входящему тексту ======
  function onWorldText(text) {
    if (!text || typeof text !== 'string') return;

    // Обезоружили — подбираем
    if (/ВЫБИЛ.? у тебя оружие, и оно упало на землю!$/.test(text)) {
      // safeEcho('>>> Подбираю оружие с пола, очистив буфер команд.\n');
      // safeSend('\\');
      // safeSend('взять ' + weapon + '|надеть ' + weapon);
    }

    // Голод/жажда — только если не спим/не в бою
    if (/^Ты умираешь от голода|^Ты умираешь от жажды/.test(text)) {
      const pos = mudprompt?.p2?.pos;
      if (pos === 'stand' || pos === 'sit' || pos === 'rest') {
        // safeSend('взять бочон сумка');
        // safeSend('пить боч|пить боч|пить боч');
        // safeSend('положить боч сумка');
      }
    }

    // Упали лицом вниз — пример повтора выбивания
    if (/Обессилев, ты падаешь лицом вниз!/.test(text)) {
      // safeSend('встать|выбить ' + doorToBash);
    }

    // Важные сообщения — всплывающее уведомление
    if (
      (/^\[ic\] /.test(text) ||
        /^\[ooc\] /.test(text) ||
        / говорит тебе '.*'$/.test(text) ||
        / произносит '.*'$/.test(text)) &&
      !/^Стражник|^Охранник/.test(text)
    ) {
      safeNotify(text);
    }
  }

  // ====== Алиасы (синонимы) по пользовательскому вводу ======
  function tryCommandAlias(rawText, e) {
    if (!rawText) return false;

    const handle = (cmd, handler) => {
      const re = new RegExp('^' + cmd + ' *(.*)');
      const m = re.exec(rawText);
      if (!m) return false;
      handler(m);
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      return true;
    };

    // /victim <имя>
    if (
      handle('/victim', args => {
        victim = args[1];
        safeEcho(
          '>>> Твоя мишень теперь: ' +
            victim +
            '\n(Используй /victim <имя>, чтобы сменить цель)'
        );
      })
    )
      return true;

    // /weapon <название>
    if (
      handle('/weapon', args => {
        weapon = args[1];
        safeEcho(
          '>>> Твоё оружие теперь: ' +
            weapon +
            '\n(Используй /weapon <название>, чтобы сменить оружие)'
        );
      })
    )
      return true;

    // /iden <предмет>
    if (
      handle('/iden', args => {
        const item = args[1];
        safeEcho(
          '>>> Опознание предмета: ' +
            item +
            '\n(Используй /iden <название>, чтобы опознать вещи из сумки)'
        );
        safeSend('взять ' + item + ' сумка');
        safeSend('к опознание ' + item);
        safeSend('полож ' + item + ' сумка');
      })
    )
      return true;

    // /purge <предмет>
    if (
      handle('/purge', args => {
        const item = args[1];
        safeEcho(
          '>>> Уничтожаю предмет: ' +
            item +
            '\n(Используй /purge <название>, чтобы выбросить и пожертвовать)'
        );
        safeSend('взять ' + item + ' сумка');
        safeSend('бросить ' + item);
        safeSend('жертвовать ' + item);
      })
    )
      return true;

    // /bd <направление>
    if (
      handle('/bd', args => {
        doorToBash = args[1];
        safeEcho(
          '>>> Поехали, вышибаем дверь на ' +
            doorToBash +
            '\n(Используй /bd <направление>, чтобы сменить сторону)'
        );
        safeSend('выбить ' + doorToBash);
      })
    )
      return true;

    return false;
  }

  // ====== Движение/стрельба/всматривание ======
  function go(where) {
    safeSend(where);
  }
  function scan(where) {
    safeSend('scan ' + where);
  }
  function shoot(where) {
    // примеры:
    safeSend('стрелять ' + where + ' ' + victim);
    // safeSend("к 'стен клинк' " + where + '.' + victim);
  }
  function dir(d, e) {
    if (e.ctrlKey) shoot(d);
    else if (e.altKey) scan(d);
    else go(d);
  }

  // ====== Горячие клавиши на поле ввода ======
  function onInputKeydown(e) {
    switch (e.code) {
      case 'Numpad1':
        dir('down', e);
        break;
      case 'Numpad2':
        dir('south', e);
        break;
      case 'Numpad4':
        dir('west', e);
        break;
      case 'Numpad5':
        safeSend('scan');
        break;
      case 'Numpad6':
        dir('east', e);
        break;
      case 'Numpad8':
        dir('north', e);
        break;
      case 'Numpad9':
        dir('up', e);
        break;

      case 'Escape': {
        if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
          const input = $qs('#input input');
          if (input) input.value = '';
        } else return;
        break;
      }

      // Тильда — тут можно включить автобаф как в старом файле
      case 'Backquote': {
        // пример:
        // if (mudprompt.enh === 'none' || mudprompt.enh.a.indexOf("l") === -1) safeSend("c learning");
        // ...
        break;
      }

      default:
        return;
    }
    e.preventDefault();
  }

  // ====== Подписки на события ======

  // 1) Современный источник: #triggers (CustomEvent)
  const triggersEl = $id('triggers');
  if (triggersEl) {
    triggersEl.addEventListener('text', e => {
      const [text] = Array.isArray(e.detail) ? e.detail : [e.detail];
      onWorldText(String(text ?? ''));
    });
    triggersEl.addEventListener('input', e => {
      const [text] = Array.isArray(e.detail) ? e.detail : [e.detail];
      tryCommandAlias(String(text ?? ''), e);
    });
  }

  // 2) Обратная совместимость: старая обёртка .trigger
  const legacy = document.querySelector('.trigger');
  if (legacy) {
    legacy.addEventListener('text', e => {
      const [text] = Array.isArray(e.detail) ? e.detail : [e.detail];
      onWorldText(String(text ?? ''));
    });
    legacy.addEventListener('input', e => {
      const [text] = Array.isArray(e.detail) ? e.detail : [e.detail];
      tryCommandAlias(String(text ?? ''), e);
    });
  }

  // 3) Клавиатура на поле ввода
  document.addEventListener('DOMContentLoaded', () => {
    // мини-справка по алиасам при запуске
    safeEcho(
      '>>> Доступные алиасы:\n' +
        '    /victim <имя>      — выбрать цель (сейчас: ' +
        victim +
        ')\n' +
        '    /weapon <название> — выбрать оружие (сейчас: ' +
        weapon +
        ')\n' +
        '    /iden <предмет>    — опознание предмета из сумки\n' +
        '    /purge <предмет>   — выбросить и пожертвовать предмет\n' +
        '    /bd <направление>  — начать выбивание двери\n'
    );

    const input = $qs('#input input');
    if (input) input.addEventListener('keydown', onInputKeydown);
  });
})();
