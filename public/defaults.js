/* Этот файл будет сохранен в браузере (в LocalStorage.settings).
 * В переменной mudprompt хранится много полезной информации о персонаже.
 * Подробнее см. https://github.com/dreamland-mud/mudjs/wiki/MUD-prompt
 * Расшифровка аффектов: https://github.com/dreamland-mud/mudjs/blob/dreamland/src/components/windowletsPanel/windowletsConstants.js
 */
(() => {
  const CONFIG = {
    debug: true,

    logging: {
      debugScopes: {
        CORE: true,
        STATE: true,
        PARSER: true,
        CMD: true,
        TRAIN: true,
        HUNT: true,
        BREW: true,
        EVENT: true,
        UI: true,
        API: true,
      },
      transitionGuards: {
        throwOnInvalidInDebug: false,
      },
    },

    alerts: {
      typhoenText: 'Тайфоэн',
      speechText: 'Внимание! Тайфоэн!',
      weaponDropSpeechText: 'Оружие выбили!',
      speechLang: 'ru-RU',
      speechDelayMs: 100,
    },

    parser: {
      enabled: true,
      debounceMs: 500,
      backendUrl: 'http://localhost:3001/api/items',
      identifyPrefixes: ['к опоз ', 'к опознание '],
    },

    commands: {
      brewStartText: 'сказ варить',
      brewStopText: 'сказ стоп',
      clearBuffer: '\\',
      standUp: 'вст',
      score: 'ум',
      look: 'смотр',
      wherePrefix: 'где',
      pathPrefix: 'путь',
      runPrefix: 'бег',
      scan: 'scan',
      drink: 'колдов родн |пить род',
      foodPrefix: 'колдов сотворить пищу |есть',
      sleepPrefix: 'спать',
    },

    brewing: {
      createRose: 'к сотв роз',
      dropRose: 'бросить роз',
      putRoseInCauldron: 'пол роз кот',
      igniteRose: 'к гор роз',
      useCauldron: 'испол кот',
      createInCauldron: 'к сотв в кост',
      refreshSpell: 'колдовать освеж',
      takePotionFromCauldron: 'взять снадоб из кот',
      drinkPotion: 'осушить снад',
    },

    training: {
      defaultSkill: 'к щит',
      defaultDelayMs: 4000,
      maxSkillCount: 98,
      unlockDelayMs: 300,
      energyWakeUpDelayMs: 25000,
      energyRecoveryDelayMs: 26000,
    },

    hunting: {
      defaultAttackCommand: 'к вред',
      defaultTarget: 'рок-менестрель',
      defaultLoot: 'листовка',
      attackIntervalMs: 3000,
      maxCycles: 2,
      lootAllCommand: item => `взять все.${item}`,

      questTemplates: [
        {
          key: 'rock-bards',
          match: ['рок-менестрелей', 'концерт тяжелой музыки'],
          targets: ['рок-менестрель'],
          loot: 'листовка',
        },
        {
          key: 'preachers',
          match: ['бродячих проповедников', 'обратить всю территорию'],
          targets: ['проповедник'],
          loot: 'страница',
        },
        {
          key: 'musicians',
          match: ['начинающих музыкантов', 'внезапно обрушилась'],
          targets: ['певица', 'скрипач', 'музыкант'],
          loot: 'струна',
        },
        {
          key: 'bigots',
          match: ['группа ханжей', 'оскорбляет чувства верующих'],
          targets: ['ханжа'],
          loot: 'крупица',
        },
        {
          key: 'bugs',
          match: ['ткань мироздания', 'аномалии'],
          targets: ['крашащая бага', 'толстая бага', 'ксерящая бага'],
          loot: 'кусочек',
        },
      ],
    },

    general: {
      defaultDoorToBash: 'n',
      defaultWeapon: 'молоток',
      defaultFoodItem: 'манна',
      defaultSleepItem: 'кресло',
    },

    quickActions: {
      healPotion: ['взять снад сумка:лечение', 'осуш снад'],
      healCast: ['взять один сумка:лечение', 'надеть один', 'к леч'],
    },

    tabActions: {
      commands: ['гиг', 'неист'],
      targets: ['демон', 'волк'],
    },

    buffs: [
      { prop: 'pro', value: 's', command: 'к аура' },
      { prop: 'pro', value: 'g', command: 'c protection good' },
      { prop: 'enh', value: 'b', command: 'к благословение' },
      { prop: 'pro', value: 'S', command: 'c shield' },
      { prop: 'det', value: 'i', command: 'c detect invis' },
      // { prop: 'trv', value: 'i', command: 'c invisibility' },
      // { prop: 'det', value: 'r', command: 'c infravision' },

      // { prop: 'enh', value: 'b', command: 'приказ крыс к благословение без' },
      // { prop: 'enh', value: 'B', command: 'к благость' },
      { prop: 'trv', value: 'f', command: 'к полет' },

      // { prop: 'pro', value: 'S', command: 'приказ крыс c shield без' },
      { prop: 'enh', value: 'l', command: 'c learning' },
      { prop: 'enh', value: 'g', command: 'c giant' },
      { prop: 'pro', value: 'p', command: "c 'prot shield'" },
      { prop: 'det', value: 'm', command: 'c detect magic' },
      // { prop: 'enh', value: 'h', command: 'c haste' },
      { prop: 'trv', value: 'm', command: 'c mental block' },
      { prop: 'pro', value: 'k', command: 'c stone skin' },
      // { prop: 'pro', value: 'z', command: 'c stardust' },
      // { prop: 'pro', value: 's', command: 'приказ крыс к sanctuary без' },
      { prop: 'det', value: 'w', command: 'c improved detect' },
      { prop: 'pro', value: 'D', command: 'c dragon skin' },
      { prop: 'pro', value: 'h', command: 'c protection heat' },
      { prop: 'pro', value: 'a', command: 'c armor' },
      // { prop: 'pro', value: 'a', command: 'приказ крыс c armor без' },
      { prop: 'pro', value: 'A', command: 'c enhanced armor' },
      // { prop: 'enh', value: 'm', command: 'c magic concentrate' },
      // { prop: 'pro', value: 'm', command: 'c spell resistance' },
      // { prop: 'enh', value: 'c', command: 'c inaction' },
      // { prop: 'pro', value: 'l', command: 'c love potion' },
      // { prop: 'pro', value: 'a', command: 'c astral projection' },
      // { prop: 'pro', value: 'b', command: 'c broom ritual' },

      // { prop: 'pro', value: 'e', command: 'c protection evil' },
      // { prop: 'det', value: 'o', command: 'к диагностика' },
      { prop: 'det', value: 'e', command: 'к обнаружить зло' },
      // { prop: 'trv', value: 's', command: 'красться' },
      // { prop: 'det', value: 'h', command: 'приглядеться' },
      { prop: 'det', value: 'g', command: 'к обнаружить добро' },
    ],
  };

  const NORMALIZED_PARSER_IDENTIFY_PREFIXES =
    CONFIG.parser.identifyPrefixes.map(prefix => prefix.toLowerCase());

  const NORMALIZED_HUNTING_QUEST_TEMPLATES = CONFIG.hunting.questTemplates.map(
    template => ({
      ...template,
      normalizedMatch: template.match.map(fragment => fragment.toLowerCase()),
    })
  );

  const DEBUG_MODE = CONFIG.debug;
  const PREVIOUS_MUD_BOT = globalThis.mudBot;

  function escapeRegExp(str) {
    return String(str).replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
  }

  const TEXT_PATTERNS = {
    brewing: {
      retry: /^Попробуй еще раз.$/,
      tired:
        /^Ты очень устала. Перед следующей варкой надо немного отдохнуть.$/,
      recoveredPartial: /^Усталость проходит... но лишь на мгновение.$/,
      recoveredFull: /^Усталость проходит, и ты готова к новым свершениям.$/,
      success:
        /^Используя специализированные знания зельеварения, ты изготавливаешь бурлящее снадобье мудреца!$/,
      explosion:
        /^Портативный котел для зелий внезапно раскаляется докрасна, и что-то внутри гулко взрывается!$/,
    },
    training: {
      lowEnergy: /У тебя не хватает энергии/i,
      mastery: /мастерски владеешь/i,
    },
    combat: {
      targetMissing:
        /ты не видишь здесь такого|увы, никого с таким именем в этой местности обнаружить не удается/i,
      cantFight: /вы не можете сражаться/i,
      death: /вы умерли/i,
      corpseSuffix: /уже труп/i,
    },
    hunting: {
      whereNotFound: /ты не находишь/i,
      whereUnavailable:
        /увы, никого с таким именем в этой местности обнаружить не удается/i,
      alreadyHere: /ты уже здесь/i,
      targetEscapes: /сбегает/i,
      visibleTargetMarker: /\[цель\]/i,
    },
    events: {
      typhoenMention: new RegExp(escapeRegExp(CONFIG.alerts.typhoenText), 'i'),
      weaponDrop: /ВЫБИЛ.? у тебя .*, и он.? пада.?т .*!/,
      hunger: /Ты хочешь есть\./,
      thirst: /Ты хочешь пить\./,
    },
  };

  const STATE_TRANSITIONS = {
    brewing: {
      idle: ['brewing', 'stopped'],
      brewing: ['recovering', 'stopped', 'idle'],
      recovering: ['brewing', 'stopped', 'idle'],
      stopped: ['brewing', 'idle'],
    },
    hunting: {
      idle: ['locating', 'stopped'],
      locating: ['pathing', 'fighting', 'stopped', 'idle'],
      pathing: ['inspecting', 'fighting', 'locating', 'stopped', 'idle'],
      inspecting: ['fighting', 'locating', 'stopped', 'idle'],
      fighting: ['looting', 'locating', 'stopped', 'idle'],
      looting: ['locating', 'stopped', 'idle'],
      stopped: ['locating', 'idle'],
    },
    training: {
      idle: ['running', 'stopped'],
      running: ['waiting_energy', 'completed', 'stopped', 'idle'],
      waiting_energy: ['running', 'stopped', 'idle'],
      completed: ['running', 'idle', 'stopped'],
      stopped: ['running', 'idle'],
    },
    parser: {
      idle: ['collecting'],
      collecting: ['idle'],
    },
  };

  // phase is guarded for runtime transitions; reset flows may use force=true intentionally
  const HUNTING_PHASE_TRANSITIONS = {
    primary: ['control'],
    control: ['primary'],
  };

  const FIELD_TRANSITIONS = {
    hunting: {
      phase: HUNTING_PHASE_TRANSITIONS,
    },
    general: {
      isActionLocked: {
        false: [true],
        true: [false],
      },
    },
  };

  function isDebugScopeEnabled(scope) {
    if (!DEBUG_MODE) {
      return false;
    }

    return CONFIG.logging?.debugScopes?.[scope] !== false;
  }

  function createLogger(scope) {
    return {
      debug: (...args) =>
        isDebugScopeEnabled(scope) &&
        console.log(`[DEBUG][MUD][${scope}]`, ...args),
      info: (...args) => console.log(`[INFO][MUD][${scope}]`, ...args),
      warn: (...args) => console.warn(`[WARN][MUD][${scope}]`, ...args),
      error: (...args) => console.error(`[ERROR][MUD][${scope}]`, ...args),
      isDebugEnabled: () => isDebugScopeEnabled(scope),
    };
  }

  const coreLog = createLogger('CORE');
  const stateLog = createLogger('STATE');
  const parserLog = createLogger('PARSER');
  const commandsLog = createLogger('CMD');
  const trainingLog = createLogger('TRAIN');
  const huntingLog = createLogger('HUNT');
  const brewingLog = createLogger('BREW');
  const eventLog = createLogger('EVENT');
  const uiLog = createLogger('UI');
  const apiLog = createLogger('API');

  let isBootstrapped = false;

  const HuntingState = {
    toDisplayValue(value) {
      return String(value ?? '').trim();
    },

    toDisplayList(values = []) {
      return values.map(value => this.toDisplayValue(value)).filter(Boolean);
    },

    normalizeValue(value) {
      return this.toDisplayValue(value).toLowerCase();
    },

    normalizeList(values = []) {
      return this.toDisplayList(values)
        .map(value => this.normalizeValue(value))
        .filter(Boolean);
    },

    getDisplayTarget(hunting, target) {
      const displayTarget = this.toDisplayValue(target);
      const normalizedTarget = this.normalizeValue(displayTarget);
      // Current limitation: duplicate normalized targets resolve to the first queue entry.
      const targetIndex =
        hunting.normalizedTargetQueue.indexOf(normalizedTarget);

      return hunting.targetQueue[targetIndex] || displayTarget;
    },

    getQueuedTarget(hunting) {
      return hunting.targetQueue[hunting.activeTargetIndex] || '';
    },

    getNormalizedQueuedTarget(hunting) {
      return hunting.normalizedTargetQueue[hunting.activeTargetIndex] || '';
    },

    getActiveOrQueuedTarget(hunting) {
      return hunting.activeTarget || this.getQueuedTarget(hunting);
    },

    getNormalizedActiveOrQueuedTarget(hunting) {
      return (
        hunting.normalizedActiveTarget ||
        this.getNormalizedQueuedTarget(hunting)
      );
    },

    setTargets(hunting, targets = []) {
      const displayTargets = this.toDisplayList(targets);
      const normalizedTargets = this.normalizeList(displayTargets);
      const firstTarget = displayTargets[0] || '';
      const firstNormalizedTarget = normalizedTargets[0] || '';

      hunting.targetQueue = displayTargets;
      hunting.normalizedTargetQueue = normalizedTargets;
      hunting.activeTargetIndex = 0;
      hunting.activeTarget = firstTarget;
      hunting.normalizedActiveTarget = firstNormalizedTarget;
    },

    setTargetByIndex(hunting, targetIndex) {
      const displayTarget = hunting.targetQueue[targetIndex] || '';
      const normalizedTarget = hunting.normalizedTargetQueue[targetIndex] || '';

      hunting.activeTargetIndex = targetIndex;
      hunting.activeTarget = displayTarget;
      hunting.normalizedActiveTarget = normalizedTarget;
    },

    setActiveTarget(hunting, target) {
      const displayTarget = this.getDisplayTarget(hunting, target);
      const normalizedTarget = this.normalizeValue(displayTarget);

      hunting.activeTarget = displayTarget;
      hunting.normalizedActiveTarget = normalizedTarget;
    },

    setResolvedLocation(hunting, location) {
      const displayLocation = this.toDisplayValue(location);
      const normalizedLocation = this.normalizeValue(location);

      hunting.resolvedLocation = displayLocation;
      hunting.normalizedResolvedLocation = normalizedLocation;
    },

    clearResolvedLocation(hunting) {
      hunting.resolvedLocation = '';
      hunting.normalizedResolvedLocation = '';
      hunting.resolvedPathCode = '';
    },
  };

  function createInitialHuntingState() {
    const target = HuntingState.toDisplayValue(CONFIG.hunting.defaultTarget);
    const normalizedTarget = HuntingState.normalizeValue(target);

    const initialState = {
      status: 'idle',
      // idle | locating | pathing | inspecting | fighting | looting | stopped
      phase: 'primary',
      // primary | control
      attackCommand: CONFIG.hunting.defaultAttackCommand,
      targetQueue: [target],
      normalizedTargetQueue: [normalizedTarget],
      activeTargetIndex: 0,
      activeTarget: target,
      normalizedActiveTarget: normalizedTarget,
      lootItem: CONFIG.hunting.defaultLoot,
      resolvedLocation: '',
      normalizedResolvedLocation: '',
      resolvedPathCode: '',
      cycleCount: 0,
    };
    return initialState;
  }

  function createInitialBrewingState() {
    return {
      status: 'idle',
      // idle | brewing | recovering | stopped
    };
  }

  function createInitialTrainingState() {
    return {
      status: 'idle',
      // idle | running | waiting_energy | stopped | completed
      skillToTrain: CONFIG.training.defaultSkill,
      skillDelayMs: CONFIG.training.defaultDelayMs,
      lastSkillUsedAt: 0,
      skillCount: 0,
      maxSkillCount: CONFIG.training.maxSkillCount,
    };
  }

  function createInitialGeneralState() {
    return {
      meltCounter: 0,
      lastCast: '',
      doorToBash: CONFIG.general.defaultDoorToBash,
      weapon: CONFIG.general.defaultWeapon,
      foodItem: CONFIG.general.defaultFoodItem,
      sleepItem: CONFIG.general.defaultSleepItem,
      isActionLocked: false,
    };
  }

  function createInitialParserState() {
    return {
      status: 'idle',
      // idle | collecting
      accumulatedText: '',
    };
  }

  function createTextContext(rawText) {
    const raw = String(rawText ?? '');

    return {
      raw,
      normalized: raw.toLowerCase(),
      trimmed: raw.trim(),
    };
  }

  const ParserText = {
    toContext(textOrContext) {
      if (
        textOrContext &&
        typeof textOrContext === 'object' &&
        typeof textOrContext.raw === 'string' &&
        typeof textOrContext.normalized === 'string' &&
        typeof textOrContext.trimmed === 'string'
      ) {
        return textOrContext;
      }

      return createTextContext(textOrContext);
    },

    isIdentifyCommand(textOrContext) {
      const ctx = this.toContext(textOrContext);

      return NORMALIZED_PARSER_IDENTIFY_PREFIXES.some(prefix =>
        ctx.normalized.startsWith(prefix)
      );
    },

    isServiceLine(textOrContext) {
      const ctx = this.toContext(textOrContext);

      return (
        ctx.trimmed === '' ||
        /^<\d+\/\d+зд \d+\/\d+ман \d+\/\d+шг \d+оп Вых/.test(ctx.raw)
      );
    },

    normalizeCollectedText(textOrContext) {
      return String(this.toContext(textOrContext).raw)
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map(line => this.toContext(line))
        .filter(
          lineCtx =>
            !this.isIdentifyCommand(lineCtx) && !this.isServiceLine(lineCtx)
        )
        .map(lineCtx => lineCtx.trimmed)
        .join('\n');
    },
  };

  const TimerManager = {
    timers: Object.create(null),

    clear(name) {
      if (this.timers[name]) {
        clearTimeout(this.timers[name]);
        this.timers[name] = null;
      }
    },

    clearMany(names = []) {
      names.forEach(name => this.clear(name));
    },

    clearAll() {
      Object.keys(this.timers).forEach(name => this.clear(name));
    },

    set(name, callback, delay) {
      this.clear(name);
      this.timers[name] = setTimeout(() => {
        this.timers[name] = null;
        callback();
      }, delay);
      return this.timers[name];
    },
  };

  const ActionGate = {
    memory: new Map(),

    allow(key, ttlMs = 1000) {
      const now = Date.now();
      const last = this.memory.get(key) || 0;

      if (now - last < ttlMs) {
        return false;
      }

      this.memory.set(key, now);
      return true;
    },

    forget(key) {
      this.memory.delete(key);
    },

    keys() {
      return [...this.memory.keys()];
    },

    clear() {
      this.memory.clear();
    },
  };

  const Store = {
    state: {
      brewing: createInitialBrewingState(),
      hunting: createInitialHuntingState(),
      training: createInitialTrainingState(),
      general: createInitialGeneralState(),
      parser: createInitialParserState(),
    },

    brewing() {
      return this.state.brewing;
    },

    hunting() {
      return this.state.hunting;
    },

    training() {
      return this.state.training;
    },

    general() {
      return this.state.general;
    },

    parser() {
      return this.state.parser;
    },

    get() {
      return this.state;
    },

    // patch() is only for simple non-guarded scalar fields; statuses/phases/locked flags must use dedicated setters
    patch(path, value) {
      const keys = String(path).split('.').filter(Boolean);
      const lastKey = keys.pop();

      if (!lastKey) {
        return;
      }

      let target = this.state;

      for (const key of keys) {
        if (!target || typeof target !== 'object') {
          return;
        }

        target = target[key];
      }

      if (!target || typeof target !== 'object') {
        return;
      }

      target[lastKey] = value;
    },

    update(section, updater) {
      const target = this.state[section];

      if (!target || typeof updater !== 'function') {
        return;
      }

      updater(target);
    },

    canTransitionByMap(transitionsMap, prevValue, nextValue) {
      if (!transitionsMap) {
        return true;
      }

      const allowedTransitions = transitionsMap[prevValue];

      if (!allowedTransitions) {
        return false;
      }

      return allowedTransitions.includes(nextValue);
    },

    canTransition(moduleName, prevStatus, nextStatus) {
      return this.canTransitionByMap(
        STATE_TRANSITIONS[moduleName],
        prevStatus,
        nextStatus
      );
    },

    canFieldTransition(sectionName, fieldName, prevValue, nextValue) {
      return this.canTransitionByMap(
        FIELD_TRANSITIONS[sectionName]?.[fieldName],
        prevValue,
        nextValue
      );
    },

    shouldThrowOnInvalidTransition() {
      return (
        DEBUG_MODE &&
        CONFIG.logging?.transitionGuards?.throwOnInvalidInDebug === true
      );
    },

    getTransitionDebugContext() {
      const stackLines = String(new Error().stack || '')
        .split('\n')
        .slice(3, 6)
        .map(line => line.trim())
        .filter(Boolean);

      return {
        callerStack: stackLines,
      };
    },

    reportInvalidTransition(
      transitionLabel,
      prevValue,
      nextValue,
      reason = '',
      context = {}
    ) {
      const message = `>>> invalid ${transitionLabel} transition: ${prevValue} -> ${nextValue}${reason ? ` (${reason})` : ''}`;

      if (this.shouldThrowOnInvalidTransition()) {
        stateLog.error(message, context);
        throw new Error(message);
      }

      stateLog.warn(message, context);
      return false;
    },

    setModuleStatus(moduleName, nextStatus, reason = '', options = {}) {
      const moduleState = this.get()[moduleName];

      if (!moduleState) {
        return false;
      }

      const prevStatus = moduleState.status;
      const { force = false } = options;

      if (prevStatus === nextStatus) {
        return true;
      }

      if (!force && !this.canTransition(moduleName, prevStatus, nextStatus)) {
        return this.reportInvalidTransition(
          `${moduleName} status`,
          prevStatus,
          nextStatus,
          reason,
          this.getTransitionDebugContext()
        );
      }

      moduleState.status = nextStatus;

      if (reason) {
        stateLog.info(
          `>>> ${moduleName} status: ${prevStatus} -> ${nextStatus} (${reason})`
        );
        return true;
      }

      stateLog.info(`>>> ${moduleName} status: ${prevStatus} -> ${nextStatus}`);
      return true;
    },

    setStateField(
      sectionName,
      fieldName,
      nextValue,
      reason = '',
      options = {}
    ) {
      const sectionState = this.get()[sectionName];

      if (!sectionState || !(fieldName in sectionState)) {
        return false;
      }

      const prevValue = sectionState[fieldName];
      const { force = false, extraContext = {} } = options;

      if (prevValue === nextValue) {
        return true;
      }

      if (
        !force &&
        !this.canFieldTransition(sectionName, fieldName, prevValue, nextValue)
      ) {
        return this.reportInvalidTransition(
          `${sectionName}.${fieldName}`,
          prevValue,
          nextValue,
          reason,
          {
            ...extraContext,
            ...this.getTransitionDebugContext(),
          }
        );
      }

      sectionState[fieldName] = nextValue;

      if (reason) {
        stateLog.info(
          `>>> ${sectionName}.${fieldName}: ${prevValue} -> ${nextValue} (${reason})`
        );
        return true;
      }

      stateLog.info(
        `>>> ${sectionName}.${fieldName}: ${prevValue} -> ${nextValue}`
      );
      return true;
    },

    setBrewingStatus(nextStatus, reason = '', options = {}) {
      return this.setModuleStatus('brewing', nextStatus, reason, options);
    },

    setHuntingStatus(nextStatus, reason = '', options = {}) {
      return this.setModuleStatus('hunting', nextStatus, reason, options);
    },

    setTrainingStatus(nextStatus, reason = '', options = {}) {
      return this.setModuleStatus('training', nextStatus, reason, options);
    },

    setParserStatus(nextStatus, reason = '', options = {}) {
      return this.setModuleStatus('parser', nextStatus, reason, options);
    },

    setHuntingPhase(nextPhase, reason = '', options = {}) {
      const hunting = this.hunting();
      return this.setStateField('hunting', 'phase', nextPhase, reason, {
        ...options,
        extraContext: {
          status: hunting.status,
        },
      });
    },

    setActionLock(isLocked, reason = '', options = {}) {
      const nextValue = Boolean(isLocked);

      return this.setStateField(
        'general',
        'isActionLocked',
        nextValue,
        reason,
        options
      );
    },

    resetBrewingRuntimeState(status = 'idle') {
      const initialBrewingState = createInitialBrewingState();

      this.update('brewing', brewing => {
        Object.assign(brewing, initialBrewingState);
      });
      this.setBrewingStatus(status, 'reset', { force: true });
    },

    resetTrainingRuntimeState(status = 'idle') {
      const initialTrainingState = createInitialTrainingState();

      this.setTrainingStatus(status, 'reset', { force: true });
      this.update('training', training => {
        training.skillCount = initialTrainingState.skillCount;
        training.lastSkillUsedAt = initialTrainingState.lastSkillUsedAt;
      });

      this.setActionLock(false, 'reset training');

      TimerManager.clearMany([
        'training',
        'trainingUnlock',
        'energyRecovery',
        'energyWakeUp',
      ]);
    },

    resetHuntingRuntimeProgress() {
      const initialHuntingState = createInitialHuntingState();

      this.update('hunting', hunting => {
        hunting.resolvedLocation = initialHuntingState.resolvedLocation;
        hunting.normalizedResolvedLocation =
          initialHuntingState.normalizedResolvedLocation;
        hunting.resolvedPathCode = initialHuntingState.resolvedPathCode;
      });
    },

    resetHuntingRuntimeState(status = 'idle') {
      const initialHuntingState = createInitialHuntingState();

      this.setHuntingStatus(status, 'reset', { force: true });
      // Runtime reset for hunting intentionally preserves user-selected
      // targets, loot and attack command. It only drops the current run
      // progress so the process can restart without losing configuration.
      this.resetHuntingRuntimeProgress();
      this.setHuntingPhase(initialHuntingState.phase, 'reset hunting', {
        force: true,
      });
      this.update('hunting', hunting => {
        HuntingState.setTargetByIndex(
          hunting,
          initialHuntingState.activeTargetIndex
        );
        hunting.cycleCount = initialHuntingState.cycleCount;
      });

      TimerManager.clear('attack');
    },

    resetParserRuntimeState() {
      const initialParserState = createInitialParserState();

      this.update('parser', parser => {
        Object.assign(parser, initialParserState);
      });
      this.setParserStatus(initialParserState.status, 'reset', { force: true });
      TimerManager.clear('parse');
    },

    resetGeneralRuntimeState() {
      const initialGeneralState = createInitialGeneralState();

      this.update('general', general => {
        general.meltCounter = initialGeneralState.meltCounter;
        general.lastCast = initialGeneralState.lastCast;
      });

      this.setActionLock(initialGeneralState.isActionLocked, 'reset general', {
        force: true,
      });
    },

    resetTrainingConfigState() {
      const initialTrainingState = createInitialTrainingState();

      this.update('training', training => {
        training.skillToTrain = initialTrainingState.skillToTrain;
        training.skillDelayMs = initialTrainingState.skillDelayMs;
        training.maxSkillCount = initialTrainingState.maxSkillCount;
      });
    },

    resetHuntingConfigState() {
      const initialHuntingState = createInitialHuntingState();

      this.update('hunting', hunting => {
        hunting.attackCommand = initialHuntingState.attackCommand;
        hunting.lootItem = initialHuntingState.lootItem;
        HuntingState.setTargets(hunting, initialHuntingState.targetQueue);
      });

      this.resetHuntingRuntimeState();
    },

    resetGeneralConfigState() {
      const initialGeneralState = createInitialGeneralState();

      this.update('general', general => {
        general.doorToBash = initialGeneralState.doorToBash;
        general.weapon = initialGeneralState.weapon;
        general.foodItem = initialGeneralState.foodItem;
        general.sleepItem = initialGeneralState.sleepItem;
      });
    },

    resetRuntimeState() {
      this.resetBrewingRuntimeState();
      this.resetTrainingRuntimeState();
      this.resetHuntingRuntimeState();
      this.resetParserRuntimeState();
      this.resetGeneralRuntimeState();
    },

    resetConfigState() {
      this.resetTrainingConfigState();
      this.resetHuntingConfigState();
      this.resetGeneralConfigState();
      this.resetGeneralRuntimeState();
    },

    resetBrewingState(status = 'idle') {
      return this.resetBrewingRuntimeState(status);
    },

    resetTrainingState(status = 'idle') {
      return this.resetTrainingRuntimeState(status);
    },

    // Deprecated compatibility alias. Prefer resetHuntingRuntimeProgress().
    resetCurrentVictimProgress() {
      if (ActionGate.allow('deprecated:resetCurrentVictimProgress', 60000)) {
        stateLog.warn(
          '>>> resetCurrentVictimProgress() устарел; используй resetHuntingRuntimeProgress()'
        );
      }

      return this.resetHuntingRuntimeProgress();
    },

    resetHuntingState(status = 'idle') {
      return this.resetHuntingRuntimeState(status);
    },

    resetParserState() {
      return this.resetParserRuntimeState();
    },
  };

  const ParserModule = {
    shouldStart(textOrContext) {
      return ParserText.isIdentifyCommand(textOrContext);
    },

    startsWithIdentifyPrefix(textOrContext) {
      return this.shouldStart(textOrContext);
    },

    startCollection(commandText = '') {
      if (!CONFIG.parser.enabled) {
        return;
      }

      Store.setParserStatus('collecting', 'запуск сбора текста');
      Store.update('parser', parser => {
        parser.accumulatedText = commandText ? String(commandText).trim() : '';
      });
      TimerManager.clear('parse');
      parserLog.debug('>>> Парсер предмета активирован.');
    },

    isInvalidLine(line) {
      return ParserText.isServiceLine(line);
    },

    normalizeItemText(text) {
      return ParserText.normalizeCollectedText(text);
    },

    extractItemFields(text) {
      if (!text) {
        return {};
      }

      const parsedData = {};
      const spellList = [];
      const lines = text.split('\n');

      lines.forEach(line => {
        const keyValueMatch = line.match(/^([^:—]+)[—:]+\s*(.*)$/);
        if (keyValueMatch) {
          let key = keyValueMatch[1].trim();
          const value = keyValueMatch[2].trim();

          if (/^Заклинани[ея]\s+\d+\s+уровня:?$/i.test(key.trim())) {
            key = 'Заклинание';
            spellList.push(value);
          } else {
            parsedData[key] = value;
          }
          return;
        }

        if (!line.trim()) {
          return;
        }

        const lastKey = Object.keys(parsedData).pop();
        if (lastKey) {
          parsedData[lastKey] += `, ${line.trim()}`;
        }
      });

      if (spellList.length > 0) {
        parsedData['Заклинание'] = spellList.join(', ');
      }

      const nameMatch = text.match(/^([^—]+?)\s*--/);
      if (nameMatch) {
        parsedData['Название предмета'] = nameMatch[1].trim();
      }

      const levelMatch = text.match(/(\d+)\s+уровня/);
      if (levelMatch) {
        parsedData['Уровень предмета'] = levelMatch[1].trim();
      }

      const usageMatch = text.match(
        /(Надевается|Вдевается|Накидывается|Используется|Берется|Опоясывает|Обувается|Кружится).*?\./
      );
      if (usageMatch) {
        parsedData['Использование предмета'] = usageMatch[0].trim();
      }

      return {
        ...(parsedData['Название предмета']
          ? { 'Название предмета': parsedData['Название предмета'] }
          : {}),
        ...(parsedData['Уровень предмета']
          ? { 'Уровень предмета': parsedData['Уровень предмета'] }
          : {}),
        ...(parsedData['Использование предмета']
          ? {
              'Использование предмета': parsedData['Использование предмета'],
            }
          : {}),
        ...(parsedData['Состав'] ? { Состав: parsedData['Состав'] } : {}),
        ...(parsedData['Заклинание']
          ? { Заклинание: parsedData['Заклинание'] }
          : {}),
        ...parsedData,
      };
    },

    validateParsedItem(data) {
      const parsedData =
        data && typeof data === 'object' && !Array.isArray(data) ? data : {};
      const missingRequiredFields = [];

      if (!parsedData['Название предмета']) {
        missingRequiredFields.push('Название предмета');
      }

      if (!parsedData['Уровень предмета']) {
        missingRequiredFields.push('Уровень предмета');
      }

      const isValid =
        Object.keys(parsedData).length > 0 &&
        missingRequiredFields.length === 0;

      if (!isValid) {
        parserLog.warn('⚠️ Неполные данные, не отправляем.', {
          missingRequiredFields,
          parsedData,
        });
      }

      return {
        isValid,
        missingRequiredFields,
        data: parsedData,
      };
    },

    async saveItem(data) {
      const validation = this.validateParsedItem(data);
      if (!validation.isValid) {
        return;
      }

      const parsedData = validation.data;

      try {
        const response = await fetch(CONFIG.parser.backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: parsedData }),
        });

        const rawText = await response.text();

        let result = null;
        if (rawText) {
          try {
            result = JSON.parse(rawText);
          } catch (parseError) {
            parserLog.warn('⚠️ Backend вернул не JSON:', rawText, parseError);
          }
        }

        if (response.ok) {
          echo(
            `✅ Предмет успешно добавлен: ${parsedData['Название предмета']} (${parsedData['Уровень предмета']} ур.)`
          );
          parserLog.info(
            '✅ Предмет отправлен на сервер:',
            result ?? rawText ?? null
          );
          return;
        }

        const errorMessage =
          result?.message || rawText || `Ошибка сервера (${response.status})`;

        echo(errorMessage);
        parserLog.warn('❌ Ошибка сервера:', {
          status: response.status,
          statusText: response.statusText,
          result,
          rawText,
        });
      } catch (error) {
        parserLog.error('🚫 Ошибка отправки:', error);
        echo(`Ошибка отправки: ${error?.message || error}`);
      }
    },

    flushParsedText() {
      const normalizedText = this.normalizeItemText(
        Store.parser().accumulatedText
      );
      const parsedData = this.extractItemFields(normalizedText);
      const validation = this.validateParsedItem(parsedData);

      Store.resetParserRuntimeState();

      if (!normalizedText) {
        parserLog.warn('⚠️ После очистки текст предмета пустой.');
        return;
      }

      if (!Object.keys(parsedData).length) {
        parserLog.warn('⚠️ Данные не были распознаны.');
        return;
      }

      if (!validation.isValid) {
        return;
      }

      this.saveItem(validation.data);
    },

    updateAccumulatedText(text) {
      if (Store.parser().status !== 'collecting') {
        return;
      }

      Store.update('parser', parser => {
        if (!parser.accumulatedText) {
          parser.accumulatedText = text;
          return;
        }

        parser.accumulatedText = `${parser.accumulatedText}\n${text}`;
      });
    },

    handleText(text) {
      const lineCtx = ParserText.toContext(text);

      if (!CONFIG.parser.enabled) {
        Store.resetParserRuntimeState();
        return;
      }

      if (Store.parser().status !== 'collecting') {
        return;
      }

      if (this.isInvalidLine(lineCtx)) {
        parserLog.info('⏩ Пропущена ненужная строка парсера.');
        return;
      }

      this.updateAccumulatedText(lineCtx.raw);
      TimerManager.set(
        'parse',
        () => {
          this.flushParsedText();
        },
        CONFIG.parser.debounceMs
      );
    },
  };

  const Commands = {
    send(command, options = {}) {
      if (!command || typeof command !== 'string') {
        return;
      }

      const finalOptions = {
        trackParser: true,
        ...options,
      };

      commandsLog.debug('send', { command, options: finalOptions });

      const commandCtx = createTextContext(command);

      // Intentional: parser tracking is opt-out so identify commands are
      // captured automatically unless a caller explicitly disables it.
      if (finalOptions.trackParser && ParserModule.shouldStart(commandCtx)) {
        ParserModule.startCollection(command);
      }

      send(command);
    },

    sendMany(commands = [], options = {}) {
      commands.filter(Boolean).forEach(command => this.send(command, options));
    },

    where(target) {
      this.send(`${CONFIG.commands.wherePrefix} ${target}`);
    },

    path(location) {
      this.send(`${CONFIG.commands.pathPrefix} ${location}`);
    },

    run(code) {
      this.send(`${CONFIG.commands.runPrefix} ${code}`);
    },

    look() {
      this.send(CONFIG.commands.look);
    },

    clearBuffer() {
      this.send(CONFIG.commands.clearBuffer);
    },

    standUp() {
      this.send(CONFIG.commands.standUp);
    },

    score() {
      this.send(CONFIG.commands.score);
    },

    sleep(item) {
      this.send(
        item
          ? `${CONFIG.commands.sleepPrefix} ${item}`
          : CONFIG.commands.sleepPrefix
      );
    },

    drink() {
      this.send(CONFIG.commands.drink);
    },

    eat(item) {
      this.send(
        item
          ? `${CONFIG.commands.foodPrefix} ${item}`
          : CONFIG.commands.foodPrefix
      );
    },

    scan(where = '') {
      this.send(
        where ? `${CONFIG.commands.scan} ${where}` : CONFIG.commands.scan
      );
    },

    lootAll(item) {
      this.send(CONFIG.hunting.lootAllCommand(item));
    },

    attack(target, attackCommand) {
      const finalAttackCommand = attackCommand || Store.hunting().attackCommand;
      this.send(`${finalAttackCommand} ${target}`);
    },

    wearWeapon(weapon) {
      this.send(`взять ${weapon}|надеть ${weapon}`);
    },

    bash(direction) {
      this.send(`выбить ${direction}`);
    },

    setHuntingTargets(targets, options = {}) {
      if (!Array.isArray(targets) || targets.length === 0) {
        return false;
      }

      Store.update('hunting', hunting => {
        HuntingState.setTargets(hunting, targets);
        hunting.cycleCount = 0;

        if (typeof options.loot === 'string' && options.loot.trim()) {
          hunting.lootItem = options.loot.trim();
        }
      });
      Store.setHuntingPhase('primary', 'обновлены цели охоты');

      return true;
    },

    setHuntingQuest({ targets = [], loot }) {
      if (!this.setHuntingTargets(targets, { loot })) {
        return;
      }

      const hunting = Store.hunting();

      commandsLog.info(
        `>>> Русалочий квест распознан: цели = ${hunting.targetQueue.join(', ')}, лут = ${hunting.lootItem}`
      );
    },

    userCommands: {
      '/target': args => {
        const hunting = Store.hunting();
        const value = HuntingState.toDisplayList(args.split(','));

        if (value.length === 0) {
          commandsLog.info(
            `>>> Текущие цели: ${hunting.targetQueue.join(', ')}, лут: ${hunting.lootItem}\n`
          );
          return;
        }

        Commands.setHuntingTargets(value);

        const nextHunting = Store.hunting();

        commandsLog.info(
          `>>> Цели охоты: ${nextHunting.targetQueue.join(', ')}\n`
        );
      },

      // Deprecated compatibility alias. Prefer /target.
      '/victim': args => {
        if (ActionGate.allow('deprecated:/victim', 60000)) {
          commandsLog.warn('>>> Команда /victim устарела; используй /target\n');
        }

        Commands.userCommands['/target'](args);
      },

      '/weapon': args => {
        const general = Store.general();
        const value = args.trim();

        if (!value) {
          commandsLog.info(`>>> Текущее оружие: ${general.weapon}\n`);
          return;
        }

        Store.patch('general.weapon', value);
        commandsLog.info(`>>> Твое оружие теперь ${Store.general().weapon}\n`);
      },

      '/iden': args => {
        const value = args.trim();
        if (!value) {
          commandsLog.warn('>>> Укажи предмет: /iden <предмет>\n');
          return;
        }

        Commands.sendMany([
          `взять ${value} сумка`,
          `к опознание ${value}`,
          `полож ${value} сумка`,
        ]);
      },

      '/purge': args => {
        const value = args.trim();
        if (!value) {
          commandsLog.warn('>>> Укажи предмет: /purge <предмет>\n');
          return;
        }

        Commands.sendMany([
          `взять ${value} сумка`,
          `бросить ${value}`,
          `жертвовать ${value}`,
        ]);
      },

      '/bd': args => {
        const general = Store.general();
        const value = args.trim();

        if (!value) {
          commandsLog.info(
            `>>> Текущее направление для выбивания: ${general.doorToBash}\n`
          );
          return;
        }

        Store.patch('general.doorToBash', value);
        const nextGeneral = Store.general();
        commandsLog.info(
          `>>> Поехали, вышибаем по направлению ${nextGeneral.doorToBash}\n`
        );
        Commands.bash(nextGeneral.doorToBash);
      },

      '/skill': args => {
        const training = Store.training();
        const value = args.trim();

        if (!value) {
          commandsLog.info(`>>> Текущий навык: ${training.skillToTrain}\n`);
          return;
        }

        Store.patch('training.skillToTrain', value);
        commandsLog.info(
          `>>> Навык для тренировки: ${Store.training().skillToTrain}\n`
        );
      },

      '/skilldelay': args => {
        const value = Number(args.trim());

        if (!Number.isFinite(value) || value < 300) {
          commandsLog.warn(
            '>>> Укажи задержку в мс, например: /skilldelay 4000\n'
          );
          return;
        }

        Store.patch('training.skillDelayMs', value);
        const training = Store.training();
        commandsLog.info(
          `>>> Задержка тренировки установлена: ${training.skillDelayMs} мс\n`
        );
      },
    },

    processCommand(e, text) {
      const trimmedText = String(text ?? '').trim();

      if (!trimmedText) {
        return false;
      }

      const [command = '', ...rest] = trimmedText.split(/\s+/);
      const args = rest.join(' ').trim();
      const handler = this.userCommands[command];

      if (!handler) {
        return false;
      }

      handler(args);
      e.preventDefault();
      e.stopPropagation();
      return true;
    },
  };

  const TrainingModule = {
    isRunning() {
      return Store.training().status === 'running';
    },

    isWaitingEnergy() {
      return Store.training().status === 'waiting_energy';
    },

    handleLowEnergy() {
      const general = Store.general();

      trainingLog.warn('>>> Энергии не хватает, засыпаю...');

      TimerManager.clearMany([
        'training',
        'trainingUnlock',
        'energyRecovery',
        'energyWakeUp',
      ]);

      Store.update('training', training => {
        training.skillCount = 0;
      });
      Store.setTrainingStatus('waiting_energy', 'недостаточно энергии');
      Store.setActionLock(false, 'ожидание восстановления энергии');

      Commands.clearBuffer();
      Commands.sleep(general.sleepItem);

      TimerManager.set(
        'energyWakeUp',
        () => {
          Commands.standUp();
        },
        CONFIG.training.energyWakeUpDelayMs
      );

      TimerManager.set(
        'energyRecovery',
        () => {
          if (!this.isWaitingEnergy()) {
            return;
          }

          Store.setTrainingStatus('running', 'энергия восстановлена');
          Store.setActionLock(false, 'энергия восстановлена');
          this.scheduleTick(0);
        },
        CONFIG.training.energyRecoveryDelayMs
      );
    },

    start() {
      const training = Store.training();

      TimerManager.clearMany([
        'training',
        'trainingUnlock',
        'energyRecovery',
        'energyWakeUp',
      ]);

      Store.setTrainingStatus('running', 'запуск тренировки');
      Store.update('training', training => {
        training.skillCount = 0;
      });
      Store.setActionLock(false, 'запуск тренировки');

      trainingLog.info(
        `>>> Старт тренировки: ${training.skillToTrain}, задержка ${training.skillDelayMs} мс`
      );

      this.scheduleTick(0);
    },

    stop(reason = 'без указания причины') {
      const training = Store.training();

      if (training.status === 'idle' || training.status === 'stopped') {
        return;
      }

      Store.resetTrainingRuntimeState('stopped');
      trainingLog.info(`>>> Тренировка остановлена: ${reason}`);
    },

    scheduleTick(delay = null) {
      const training = Store.training();

      TimerManager.clear('training');

      if (!this.isRunning()) {
        return;
      }

      const actualDelay =
        typeof delay === 'number' ? delay : training.skillDelayMs;

      TimerManager.set(
        'training',
        () => {
          this.runTick();
        },
        actualDelay
      );
    },

    runTick() {
      const general = Store.general();
      const training = Store.training();

      if (!this.isRunning() || general.isActionLocked) {
        return;
      }

      if (training.skillCount >= training.maxSkillCount) {
        Commands.clearBuffer();
        trainingLog.info(
          'Навык выполнен 98 раз. Очищаем буфер и выполняем команду "ум".'
        );
        Commands.score();
        Store.update('training', training => {
          training.skillCount = 0;
        });
        this.scheduleTick(training.skillDelayMs);
        return;
      }

      const usedAt = Date.now();
      Commands.send(training.skillToTrain);
      Store.update('training', training => {
        training.lastSkillUsedAt = usedAt;
        training.skillCount += 1;
      });
      trainingLog.debug('Текущий счетчик навыка:', Store.training().skillCount);

      Store.setActionLock(true, 'ожидание отката тренировочного действия');
      TimerManager.set(
        'trainingUnlock',
        () => {
          const nextTraining = Store.training();

          Store.setActionLock(
            false,
            'завершение отката тренировочного действия'
          );

          if (this.isRunning()) {
            this.scheduleTick(nextTraining.skillDelayMs);
          }
        },
        CONFIG.training.unlockDelayMs
      );
    },

    handleMastery(text) {
      if (!this.isRunning()) {
        return;
      }

      if (!TEXT_PATTERNS.training.mastery.test(text)) {
        return;
      }

      trainingLog.debug('Обнаружено сообщение о достижении мастерства:', text);
      Commands.clearBuffer();
      trainingLog.info('Мастерство достигнуто. Очищаем буфер.');
      Store.resetTrainingRuntimeState('completed');
    },

    handleLowEnergyText(text) {
      if (!this.isRunning()) {
        return;
      }

      if (!TEXT_PATTERNS.training.lowEnergy.test(text)) {
        return;
      }

      this.handleLowEnergy();
    },

    handleState(text) {
      this.handleLowEnergyText(text);
      this.handleMastery(text);
    },
  };

  const HuntingModule = {
    isFighting() {
      return Store.hunting().status === 'fighting';
    },

    isActive() {
      const status = Store.hunting().status;
      return status !== 'idle' && status !== 'stopped';
    },

    escapeRegExp(str) {
      return escapeRegExp(str);
    },

    logPipeline(step, details = '') {
      const {
        status,
        phase,
        targetQueue,
        activeTarget,
        activeTargetIndex,
        resolvedLocation,
        resolvedPathCode,
      } = Store.hunting();

      huntingLog.debug('hunting pipeline', {
        step,
        status,
        phase,
        targetQueue,
        activeTarget,
        activeTargetIndex,
        resolvedLocation,
        resolvedPathCode,
        details,
      });
    },

    isTargetVisibleLine(ctx, target) {
      if (!target) {
        return false;
      }

      if (!ctx.normalized.includes(target)) {
        return false;
      }

      return (
        ctx.normalized.includes(`[${target}]`) ||
        TEXT_PATTERNS.hunting.visibleTargetMarker.test(ctx.raw) ||
        TEXT_PATTERNS.combat.corpseSuffix.test(ctx.raw)
      );
    },

    tryHandleVisibleTarget(ctx) {
      if (!this.isActive() || this.isFighting()) {
        return false;
      }

      const matchedTarget = this.getMatchedTargetFromText(ctx);
      if (!matchedTarget) {
        return false;
      }

      if (!this.isTargetVisibleLine(ctx, matchedTarget)) {
        return false;
      }

      this.logPipeline('visibleTarget', { matchedTarget, text: ctx.raw });
      huntingLog.debug('>>> Цель обнаружена по строке комнаты:', ctx.raw);
      this.onTargetFound(matchedTarget, ctx);
      return true;
    },

    start() {
      Store.resetHuntingRuntimeState('locating');
      const hunting = Store.hunting();
      const queuedTarget = HuntingState.getQueuedTarget(hunting);

      this.logPipeline('start', { queuedTarget });
      Commands.where(queuedTarget);
      huntingLog.info('Отправлена команда "где target".');
    },

    stop(reason = 'без указания причины') {
      this.logPipeline('stop', { reason });
      this.stopAttackLoop(reason);
      Store.setHuntingStatus('stopped', reason);
    },

    stopAttackLoop(reason = 'без указания причины') {
      if (this.isFighting()) {
        huntingLog.info('>>> Бой остановлен:', reason);
      }

      TimerManager.clear('attack');
    },

    advanceToNextTarget(reason = 'не указана') {
      const hunting = Store.hunting();
      const nextIndex = hunting.activeTargetIndex + 1;

      this.logPipeline('advanceToNextTarget', { reason, nextIndex });

      if (nextIndex >= hunting.targetQueue.length) {
        Store.update('hunting', hunting => {
          hunting.cycleCount += 1;
        });

        if (Store.hunting().cycleCount < CONFIG.hunting.maxCycles) {
          Store.setHuntingPhase('control', 'запуск контрольного круга');
          Store.update('hunting', hunting => {
            HuntingState.setTargetByIndex(hunting, 0);
          });

          Store.resetHuntingRuntimeProgress();
          Store.setHuntingStatus('locating', 'запуск контрольного круга');

          huntingLog.warn(
            `>>> Первый проход по всем целям завершен. Запускаю контрольную перепроверку с начала. Причина: ${reason}`
          );

          const nextHunting = Store.hunting();
          Commands.where(HuntingState.getQueuedTarget(nextHunting));
          return true;
        }

        huntingLog.warn(
          `>>> Все цели проверены, включая контрольный круг. Охота остановлена. Причина: ${reason}`
        );
        this.stop('все цели проверены дважды');
        return false;
      }

      Store.update('hunting', hunting => {
        HuntingState.setTargetByIndex(hunting, nextIndex);
      });

      Store.resetHuntingRuntimeProgress();
      const nextHunting = Store.hunting();
      const queuedTarget = HuntingState.getQueuedTarget(nextHunting);
      Store.setHuntingStatus('locating', `следующая цель: ${queuedTarget}`);

      huntingLog.info(
        `>>> Переключаюсь на следующую цель: ${queuedTarget}. Причина: ${reason}${nextHunting.phase === 'control' ? ' [контрольный круг]' : ''}`
      );
      Commands.where(queuedTarget);
      return true;
    },

    onTargetMissing(reason = 'без указания причины') {
      const hunting = Store.hunting();

      this.logPipeline('targetMissing', { reason });

      if (hunting.targetQueue.length > 1) {
        this.stopAttackLoop(reason);
        Store.setHuntingStatus('locating', reason);
        return this.advanceToNextTarget(reason);
      }

      this.stop(reason);
      return false;
    },

    onTargetFound(name, ctx = createTextContext('')) {
      const targetName = HuntingState.normalizeValue(name);
      const displayTargetName = HuntingState.getDisplayTarget(
        Store.hunting(),
        name
      );

      if (!targetName) {
        return false;
      }

      this.logPipeline('targetFound', { targetName, text: ctx.raw });

      if (
        ctx.normalized.includes(targetName) &&
        TEXT_PATTERNS.combat.corpseSuffix.test(ctx.raw)
      ) {
        huntingLog.info(
          `>>> Жертва ${displayTargetName} уже мертва! Останавливаем охоту.`
        );
        Store.update('hunting', hunting => {
          HuntingState.setActiveTarget(hunting, displayTargetName);
        });
        this.stop('жертва уже мертва');

        if (ActionGate.allow(`hunting:corpse-look:${targetName}`, 1500)) {
          Commands.look();
        }

        return false;
      }

      Store.update('hunting', hunting => {
        HuntingState.setActiveTarget(hunting, displayTargetName);
      });
      const hunting = Store.hunting();
      huntingLog.info(`>>> Жертва ${hunting.activeTarget} тут!`);

      if (TEXT_PATTERNS.hunting.targetEscapes.test(ctx.raw)) {
        huntingLog.info(
          '>>> Жертва пытается сбежать, продолжаем преследование...'
        );
        Store.resetHuntingRuntimeProgress();
        Store.setHuntingStatus('locating', 'цель сбежала');

        if (ActionGate.allow(`hunting:escape-where:${targetName}`, 1200)) {
          Commands.where(hunting.activeTarget);
        }

        return false;
      }

      this.engageCombat(hunting.activeTarget);
      return true;
    },

    onTargetKilled() {
      const hunting = Store.hunting();
      const activeTarget = HuntingState.getActiveOrQueuedTarget(hunting);
      const lootKey = HuntingState.normalizeValue(activeTarget);

      this.logPipeline('targetKilled', {
        activeTarget,
      });

      huntingLog.info(`>>> Жертва ${activeTarget} мертва!`);
      Store.setHuntingStatus('looting', `лутание: ${hunting.lootItem}`);

      if (
        ActionGate.allow(`hunting:loot:${lootKey}:${hunting.lootItem}`, 1500)
      ) {
        Commands.lootAll(hunting.lootItem);
      }

      this.stopAttackLoop('жертва убита');
    },

    detectHuntingQuest(ctx) {
      const matchedQuest = NORMALIZED_HUNTING_QUEST_TEMPLATES.find(template =>
        template.normalizedMatch.every(fragment =>
          ctx.normalized.includes(fragment)
        )
      );

      if (!matchedQuest) {
        return false;
      }

      Commands.setHuntingQuest({
        targets: matchedQuest.targets,
        loot: matchedQuest.loot,
      });

      return true;
    },

    getMatchedTargetFromText(ctx) {
      return Store.hunting().normalizedTargetQueue.find(target =>
        ctx.normalized.includes(target)
      );
    },

    extractLocationAfterTarget(ctx, normalizedTarget) {
      if (!normalizedTarget) {
        return null;
      }

      const hunting = Store.hunting();
      const displayTarget = HuntingState.getDisplayTarget(
        hunting,
        normalizedTarget
      );
      const safeDisplayTarget = this.escapeRegExp(displayTarget);
      const targetPattern = new RegExp(safeDisplayTarget, 'i');
      const match = targetPattern.exec(ctx.raw);

      if (!match) {
        return null;
      }

      const rawLocation = ctx.raw.slice(match.index + match[0].length).trim();
      const displayLocation = rawLocation.replaceAll(
        /^[\s.,:;!?-]+|[\s.,:;!?-]+$/g,
        ''
      );
      const normalizedLocation = HuntingState.normalizeValue(displayLocation);

      return {
        rawLocation,
        displayLocation,
        normalizedLocation,
      };
    },

    resolveTargetLocation(ctx) {
      const hunting = Store.hunting();
      const normalizedQueuedTarget =
        HuntingState.getNormalizedQueuedTarget(hunting);

      this.logPipeline('resolveTargetLocation', { text: ctx.raw });

      if (hunting.resolvedLocation) {
        return;
      }

      if (
        TEXT_PATTERNS.hunting.whereNotFound.test(ctx.raw) &&
        ctx.normalized.includes(normalizedQueuedTarget)
      ) {
        huntingLog.warn(
          `>>> Цель ${normalizedQueuedTarget} не найдена через "где".`
        );
        this.onTargetMissing('where не нашел цель');
        return;
      }

      if (TEXT_PATTERNS.hunting.whereUnavailable.test(ctx.raw)) {
        huntingLog.warn(
          `>>> Цель ${normalizedQueuedTarget} недоступна через "где".`
        );
        this.onTargetMissing('where сообщил, что цель недоступна');
        return;
      }

      if (!ctx.normalized.includes(normalizedQueuedTarget)) {
        return;
      }

      const extractedLocation = this.extractLocationAfterTarget(
        ctx,
        normalizedQueuedTarget
      );

      if (!extractedLocation) {
        huntingLog.warn('Не удалось найти местоположение.');
        return;
      }

      const { rawLocation, displayLocation, normalizedLocation } =
        extractedLocation;

      if (!normalizedLocation || normalizedLocation === '.') {
        huntingLog.warn(
          `>>> После имени цели не удалось извлечь корректную местность: "${rawLocation}"`
        );
        this.onTargetMissing('не удалось распарсить местность');
        return;
      }

      Store.update('hunting', hunting => {
        HuntingState.setResolvedLocation(hunting, displayLocation);
      });
      const nextHunting = Store.hunting();
      Store.setHuntingStatus(
        'pathing',
        `местность: ${nextHunting.resolvedLocation}`
      );

      huntingLog.info('Местоположение жертвы:', nextHunting.resolvedLocation);
      Commands.path(nextHunting.resolvedLocation);
    },

    moveToResolvedTarget(locationCode) {
      const hunting = Store.hunting();

      this.logPipeline('moveToResolvedTarget', { locationCode });
      Store.setHuntingStatus(
        'inspecting',
        `код пути: ${hunting.resolvedPathCode}`
      );
      huntingLog.info(`Код местности найден: ${locationCode}`);
      Commands.run(locationCode);

      if (ActionGate.allow(`hunting:move-look:${locationCode}`, 1200)) {
        Commands.look();
      }
    },

    resolvePath(ctx) {
      const hunting = Store.hunting();

      this.logPipeline('resolvePath', { text: ctx.raw });

      if (!hunting.resolvedLocation || hunting.resolvedPathCode) {
        return;
      }

      const resolvedLocation = hunting.normalizedResolvedLocation;

      if (TEXT_PATTERNS.hunting.alreadyHere.test(ctx.raw)) {
        huntingLog.info('>>> Уже на месте, начинаю осмотр.');

        Store.setHuntingStatus('inspecting', 'уже в нужной локации');

        if (ActionGate.allow('hunting:already-here-look', 1000)) {
          Commands.look();
        }

        return;
      }

      const safeResolvedLocation = this.escapeRegExp(resolvedLocation);
      const pattern = new RegExp(
        String.raw`'${safeResolvedLocation}(?:[.:;!?-]+)?'\s*:\s*(\S+)`,
        'i'
      );
      const match = ctx.raw.match(pattern);
      const locationCode = match?.[1];

      if (!locationCode) {
        return;
      }

      Store.update('hunting', hunting => {
        hunting.resolvedPathCode = locationCode;
      });
      this.moveToResolvedTarget(locationCode);
    },

    inspectLocation(ctx) {
      this.logPipeline('inspectLocation', { text: ctx.raw });
      const matchedTarget = this.getMatchedTargetFromText(ctx);

      if (!matchedTarget) {
        return;
      }

      if (!this.isTargetVisibleLine(ctx, matchedTarget)) {
        huntingLog.debug(
          '>>> Упоминание цели в комнате не похоже на живую цель, пропускаю.',
          ctx.raw
        );
        return;
      }

      huntingLog.info('>>> В локации жертвы, осматриваюсь.');
      this.onTargetFound(matchedTarget, ctx);
    },

    engageCombat(targetName) {
      if (!targetName) {
        return;
      }

      this.logPipeline('engageCombat', { targetName });
      huntingLog.info(`>>> Атакую жертву: ${targetName}`);
      Store.setHuntingStatus('fighting', `атака цели: ${targetName}`);

      TimerManager.clear('attack');
      this.continueAttacking();
    },

    continueAttacking() {
      const hunting = Store.hunting();

      TimerManager.clear('attack');

      if (!this.isFighting()) {
        huntingLog.debug(
          '>>> continueAttacking остановлен: hunting.status!=fighting'
        );
        return;
      }

      const activeTarget = HuntingState.getActiveOrQueuedTarget(hunting);

      this.logPipeline('continueAttacking', { activeTarget });
      huntingLog.debug('>>> continueAttacking: отправляю атаку', activeTarget);
      Commands.attack(activeTarget, hunting.attackCommand);

      TimerManager.set(
        'attack',
        () => {
          this.continueAttacking();
        },
        CONFIG.hunting.attackIntervalMs
      );
    },

    handleCombatText(ctx) {
      if (!this.isFighting()) {
        return;
      }

      this.logPipeline('handleCombatText', { text: ctx.raw });
      const hunting = Store.hunting();
      const activeTargetName =
        HuntingState.getNormalizedActiveOrQueuedTarget(hunting);

      if (
        ctx.normalized.includes(activeTargetName) &&
        TEXT_PATTERNS.combat.corpseSuffix.test(ctx.raw)
      ) {
        this.onTargetKilled();
        return;
      }

      if (TEXT_PATTERNS.combat.targetMissing.test(ctx.raw)) {
        huntingLog.warn('>>> Текущая цель недоступна.');
        huntingLog.debug('>>> lowerText:', ctx.normalized);
        this.onTargetMissing('цель пропала или недоступна в бою');
        return;
      }

      if (TEXT_PATTERNS.combat.cantFight.test(ctx.raw)) {
        huntingLog.warn('>>> Вы не можете продолжать бой.');
        this.stop('бой запрещен');
        return;
      }

      if (TEXT_PATTERNS.combat.death.test(ctx.raw)) {
        huntingLog.warn('>>> Вы погибли.');
        this.stop('персонаж погиб');
      }
    },

    onText(ctx) {
      if (!this.isActive()) {
        return;
      }

      const hunting = Store.hunting();

      this.logPipeline('onText', { text: ctx.raw });

      // Intentional: a visible target in the current room short-circuits the
      // state pipeline so we can engage immediately even before path/inspect
      // handling runs for the current status.
      if (this.tryHandleVisibleTarget(ctx)) {
        return;
      }

      if (hunting.status === 'fighting') {
        this.handleCombatText(ctx);
        return;
      }

      const pipeline = {
        locating: () => this.resolveTargetLocation(ctx),
        pathing: () => this.resolvePath(ctx),
        inspecting: () => this.inspectLocation(ctx),
      };

      pipeline[hunting.status]?.();
    },
  };

  const BrewingModule = {
    isRunning() {
      return ['brewing', 'recovering'].includes(Store.brewing().status);
    },

    start() {
      brewingLog.info('>>> Начинаем варить зелье!');
      Store.setBrewingStatus('brewing', 'запуск варки');

      Commands.sendMany([
        CONFIG.brewing.createRose,
        CONFIG.brewing.createRose,
        CONFIG.brewing.dropRose,
        CONFIG.brewing.putRoseInCauldron,
        CONFIG.brewing.igniteRose,
        CONFIG.brewing.useCauldron,
      ]);
    },

    stop() {
      if (
        Store.brewing().status === 'idle' ||
        Store.brewing().status === 'stopped'
      ) {
        return;
      }

      brewingLog.info('>>> Останавливаем варку зелий.');
      Store.resetBrewingRuntimeState('stopped');
    },

    handleCommands(e, ctx) {
      const trimmedText = ctx.trimmed;

      if (trimmedText === CONFIG.commands.brewStartText) {
        this.start();
        e.preventDefault();
        return true;
      }

      if (trimmedText === CONFIG.commands.brewStopText) {
        this.stop();
        e.preventDefault();
        return true;
      }

      return false;
    },
  };

  const BuffModule = {
    handleBuffs() {
      const prompt = globalThis.mudprompt || {};

      CONFIG.buffs.forEach(({ prop, value, command }) => {
        const promptProp = prompt[prop];

        if (promptProp === 'none' || !promptProp?.a?.includes(value)) {
          Commands.send(command);
        }
      });
    },
  };

  const AlertModule = {
    speak(text = CONFIG.alerts.speechText) {
      if (!globalThis.speechSynthesis) {
        eventLog.error('Браузер не поддерживает синтез речи.');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = CONFIG.alerts.speechLang;
      utterance.volume = 1;
      utterance.rate = 1;
      utterance.pitch = 1;

      globalThis.speechSynthesis.cancel();
      TimerManager.set(
        'speech',
        () => {
          globalThis.speechSynthesis.speak(utterance);
        },
        CONFIG.alerts.speechDelayMs
      );
    },

    typhoen() {
      this.speak(CONFIG.alerts.speechText);
    },

    weaponDrop() {
      this.speak(CONFIG.alerts.weaponDropSpeechText);
    },
  };

  const EventRouter = {
    triggers: [
      {
        pattern: TEXT_PATTERNS.brewing.retry,
        action: () => {
          if (!ActionGate.allow('brewing:retry-ignite', 1200)) {
            return;
          }

          brewingLog.info('>>> Повторяем поджиг зелья.');
          Commands.sendMany([
            CONFIG.brewing.igniteRose,
            CONFIG.brewing.useCauldron,
          ]);
        },
      },
      {
        pattern: TEXT_PATTERNS.brewing.tired,
        action: () => {
          if (!ActionGate.allow('brewing:recovering-start', 1500)) {
            return;
          }

          brewingLog.info('>>> Персонаж устал, начинаем восстановление.');
          Store.setBrewingStatus('recovering', 'усталость после варки');
          Commands.send(CONFIG.brewing.refreshSpell);
        },
      },
      {
        pattern: TEXT_PATTERNS.brewing.recoveredPartial,
        action: () => {
          if (!ActionGate.allow('brewing:refresh-tick', 1200)) {
            return;
          }

          brewingLog.info('>>> Восстанавливаем энергию.');
          Commands.send(CONFIG.brewing.refreshSpell);
        },
      },
      {
        pattern: TEXT_PATTERNS.brewing.recoveredFull,
        action: () => {
          if (!ActionGate.allow('brewing:recovery-finished', 1500)) {
            return;
          }

          const brewing = Store.brewing();
          brewingLog.info('>>> Полностью восстановились, продолжаем варку.');
          const shouldContinue = BrewingModule.isRunning();
          Commands.send(CONFIG.brewing.createInCauldron);
          brewingLog.debug('>>> brewing.status1:', brewing.status);
          if (shouldContinue) {
            BrewingModule.start();
          }
        },
      },
      {
        pattern: TEXT_PATTERNS.brewing.success,
        action: () => {
          if (!ActionGate.allow('brewing:potion-ready', 1500)) {
            return;
          }

          const brewing = Store.brewing();
          const shouldContinue = BrewingModule.isRunning();
          Commands.sendMany([
            CONFIG.brewing.takePotionFromCauldron,
            CONFIG.brewing.drinkPotion,
            CONFIG.brewing.createInCauldron,
          ]);
          brewingLog.info('>>> Зелье готово!');
          brewingLog.debug('>>> brewing.status2:', brewing.status);
          if (shouldContinue) {
            BrewingModule.start();
          }
        },
      },
      {
        pattern: TEXT_PATTERNS.brewing.explosion,
        action: () => {
          if (!ActionGate.allow('brewing:cauldron-exploded', 1500)) {
            return;
          }

          const brewing = Store.brewing();
          brewingLog.info('>>> Котел взорвался! начинаем сначало.');
          const shouldContinue = BrewingModule.isRunning();
          Commands.send(CONFIG.brewing.createInCauldron);
          brewingLog.debug('>>> brewing.status3:', brewing.status);
          if (shouldContinue) {
            BrewingModule.start();
          }
        },
      },
      {
        pattern: TEXT_PATTERNS.events.weaponDrop,
        action: () => {
          const general = Store.general();

          if (!ActionGate.allow('event:weapon-drop', 1500)) {
            return;
          }

          eventLog.info('>>> Подбираю оружие с пола, очищаю буфер команд.');
          AlertModule.weaponDrop();
          Commands.clearBuffer();
          Commands.wearWeapon(general.weapon);
        },
      },
      {
        pattern: TEXT_PATTERNS.events.hunger,
        action: () => {
          const general = Store.general();
          eventLog.info('>>> Сейчас бы шашлычка...');
          Commands.eat(general.foodItem);
        },
      },
      {
        pattern: TEXT_PATTERNS.events.thirst,
        action: () => {
          eventLog.info('>>> Сейчас бы вискарика...');
          Commands.drink();
        },
      },
    ],

    handleTyphoenAlert(ctx) {
      if (!TEXT_PATTERNS.events.typhoenMention.test(ctx.raw)) {
        return;
      }

      if (!ActionGate.allow('event:typhoen-alert', 1500)) {
        return;
      }

      eventLog.warn(
        '>>> Обнаружено упоминание Тайфоэна! Воспроизводим звуковой сигнал.'
      );
      AlertModule.typhoen();
    },

    runTextTriggers(ctx) {
      // Intentional: one incoming line executes at most one generic trigger.
      for (const { pattern, action } of this.triggers) {
        if (pattern.test(ctx.raw)) {
          action();
          return true;
        }
      }

      return false;
    },

    handleGameStates(ctx) {
      HuntingModule.onText(ctx);

      if (TrainingModule.isRunning() || TrainingModule.isWaitingEnergy()) {
        TrainingModule.handleState(ctx.raw);
      }
    },

    handleIncomingText(text) {
      const ctx = createTextContext(text);

      eventLog.debug('Получен входящий текст:', ctx.raw);

      HuntingModule.detectHuntingQuest(ctx);
      this.handleTyphoenAlert(ctx);
      ParserModule.handleText(ctx.raw);
      this.handleGameStates(ctx);
      this.runTextTriggers(ctx);
    },
  };

  function getStatusSummary() {
    const training = Store.training();
    const brewing = Store.brewing();
    const hunting = Store.hunting();
    const parser = Store.parser();
    const general = Store.general();
    const activeTimers = Object.keys(TimerManager.timers).filter(
      key => TimerManager.timers[key]
    );

    return {
      bootstrapped: isBootstrapped,
      training: training.status,
      brewing: brewing.status,
      hunting: {
        status: hunting.status,
        phase: hunting.phase,
        attackCommand: hunting.attackCommand,
        targetQueue: [...hunting.targetQueue],
        activeTargetIndex: hunting.activeTargetIndex,
        target: hunting.activeTarget,
        lootItem: hunting.lootItem,
        location: hunting.resolvedLocation,
        resolvedLocationNormalized: hunting.normalizedResolvedLocation,
        locationCode: hunting.resolvedPathCode,
        cycleCount: hunting.cycleCount,
        // compatibility aliases for older debug consumers
        victim: hunting.targetQueue[0] || '',
        currentVictim: hunting.activeTarget,
        victimLocation: hunting.resolvedLocation,
      },
      parser: parser.status,
      actionLocked: general.isActionLocked,
      activeTimers,
    };
  }

  function exposeDebugApi() {
    globalThis.mudBot = {
      get state() {
        return Store.get();
      },

      get isBootstrapped() {
        return isBootstrapped;
      },

      getStatusSummary,

      config: CONFIG,

      bootstrap() {
        bootstrap();
      },

      destroy(reason = 'остановка через mudBot.destroy') {
        destroy(reason);
      },

      send(command, options = {}) {
        Commands.send(command, options);
      },

      sendMany(commands = [], options = {}) {
        Commands.sendMany(commands, options);
      },

      feedText(text) {
        EventRouter.handleIncomingText(text);
      },

      speak(text) {
        AlertModule.speak(text);
      },

      startTraining() {
        TrainingModule.start();
      },

      stopTraining(reason = 'остановка через mudBot') {
        TrainingModule.stop(reason);
      },

      startBrewing() {
        BrewingModule.start();
      },

      stopBrewing() {
        BrewingModule.stop();
      },

      startHunting() {
        HuntingModule.start();
      },

      stopHunting(reason = 'остановка через mudBot') {
        HuntingModule.stop(reason);
      },

      resetRuntimeState() {
        Store.resetRuntimeState();
      },

      resetConfigState() {
        Store.resetConfigState();
      },

      resetHuntingRuntimeState(status = 'idle') {
        Store.resetHuntingRuntimeState(status);
      },

      resetHuntingProgress() {
        Store.resetHuntingRuntimeProgress();
      },

      resetHuntingConfigState() {
        Store.resetHuntingConfigState();
      },

      resetTrainingRuntimeState(status = 'idle') {
        Store.resetTrainingRuntimeState(status);
      },

      resetParserRuntimeState() {
        Store.resetParserRuntimeState();
      },

      resetHuntingState(status = 'idle') {
        Store.resetHuntingState(status);
      },

      resetTrainingState(status = 'idle') {
        Store.resetTrainingState(status);
      },

      resetParserState() {
        Store.resetParserState();
      },
    };

    apiLog.info('>>> Debug API зарегистрирован в globalThis.mudBot.');
  }

  const UIBindings = {
    documentClickHandler: null,
    hotkeyHandlers: null,

    KeyCodes: {
      Numpad0: 'Numpad0',
      Numpad1: 'Numpad1',
      Numpad2: 'Numpad2',
      Numpad3: 'Numpad3',
      Numpad4: 'Numpad4',
      Numpad5: 'Numpad5',
      Numpad6: 'Numpad6',
      Numpad7: 'Numpad7',
      Numpad8: 'Numpad8',
      Numpad9: 'Numpad9',
      NumpadMultiply: 'NumpadMultiply',
      NumpadAdd: 'NumpadAdd',
      NumpadSubtract: 'NumpadSubtract',
      NumpadDecimal: 'NumpadDecimal',
      NumpadDivide: 'NumpadDivide',
      Escape: 'Escape',
      Backquote: 'Backquote',
      Tab: 'Tab',
      Home: 'Home',
      End: 'End',
    },

    go(where) {
      Commands.send(where);
    },

    scan(where) {
      Commands.scan(where);
    },

    shoot(where) {
      const hunting = Store.hunting();

      const queuedTarget = HuntingState.getQueuedTarget(hunting);

      Commands.attack(`${where}.${queuedTarget}`, hunting.attackCommand);
    },

    dir(direction, e) {
      if (e.ctrlKey) {
        this.shoot(direction);
      } else if (e.altKey) {
        this.scan(direction);
      } else {
        this.go(direction);
      }
    },

    getMovementHotkeyName(e) {
      const keypadHotkeys = {
        [this.KeyCodes.Numpad1]: 'kp1',
        [this.KeyCodes.Numpad2]: 'kp2',
        [this.KeyCodes.Numpad4]: 'kp4',
        [this.KeyCodes.Numpad5]: 'kp5',
        [this.KeyCodes.Numpad6]: 'kp6',
        [this.KeyCodes.Numpad8]: 'kp8',
        [this.KeyCodes.Numpad9]: 'kp9',
      };

      const key = keypadHotkeys[e.code];
      if (!key) {
        return null;
      }

      if (e.ctrlKey) {
        return `ctrl+${key}`;
      }

      if (e.altKey) {
        return `alt+${key}`;
      }

      if (e.shiftKey) {
        return `shift+${key}`;
      }

      return key;
    },

    hasMovementHotkey(e) {
      const hotkey = this.getMovementHotkeyName(e);
      if (!hotkey || !localStorage.hotkey) {
        return false;
      }

      try {
        const hotkeyStorage = JSON.parse(localStorage.hotkey);
        return Boolean(hotkeyStorage?.[hotkey]);
      } catch (error) {
        uiLog.warn('Не удалось прочитать hotkey из localStorage', error);
        return false;
      }
    },

    handleMovement(e) {
      // Intentional: built-in numpad navigation is only a fallback. Respect
      // user-defined hotkeys from localStorage before handling the key here.
      if (this.hasMovementHotkey(e)) {
        return false;
      }

      const numpadDirectionMap = {
        [this.KeyCodes.Numpad1]: 'down',
        [this.KeyCodes.Numpad2]: 'south',
        [this.KeyCodes.Numpad4]: 'west',
        [this.KeyCodes.Numpad6]: 'east',
        [this.KeyCodes.Numpad8]: 'north',
        [this.KeyCodes.Numpad9]: 'up',
      };

      const direction = numpadDirectionMap[e.code];
      if (direction) {
        this.dir(direction, e);
        e.preventDefault();
        return true;
      }

      if (e.code === this.KeyCodes.Numpad5) {
        Commands.scan();
        e.preventDefault();
        return true;
      }

      return false;
    },

    bindDocumentEvents() {
      this.unbindDocumentEvents();

      this.documentClickHandler = () => {
        AlertModule.speak();
      };

      document.addEventListener('click', this.documentClickHandler, {
        once: true,
      });
    },

    unbindDocumentEvents() {
      if (!this.documentClickHandler) {
        return;
      }

      document.removeEventListener('click', this.documentClickHandler);
      this.documentClickHandler = null;
    },

    bindRpcEvents() {
      $('#rpc-events').off('rpc-prompt.myNamespace');
      $('#rpc-events').on('rpc-prompt.myNamespace', (e, data) => {
        if (!uiLog.isDebugEnabled()) {
          return;
        }

        uiLog.debug('RAW rpc-prompt snapshot:', structuredClone(data));

        setTimeout(() => {
          uiLog.debug(
            'mudprompt snapshot:',
            structuredClone(globalThis.mudprompt || {})
          );
        }, 0);
      });
    },

    bindTextEvents() {
      $('.trigger').off('text.myNamespace');
      $('.trigger').on('text.myNamespace', (_e, text) => {
        EventRouter.handleIncomingText(text);
      });
    },

    bindInputEvents() {
      $('.trigger').off('input.myNamespace');
      $('.trigger').on('input.myNamespace', (e, text) => {
        const ctx = createTextContext(text);

        if (BrewingModule.handleCommands(e, ctx)) {
          return;
        }

        if (ParserModule.shouldStart(ctx)) {
          ParserModule.startCollection(text);
        }

        if (Commands.processCommand(e, text)) {
          return;
        }
      });
    },

    handleTabActions() {
      const { commands, targets } = CONFIG.tabActions;
      targets.forEach(target => {
        commands.forEach(command => {
          Commands.send(`к ${command} ${target}`);
        });
      });
    },

    buildHotkeyHandlers() {
      this.hotkeyHandlers = {
        [this.KeyCodes.Escape]: e => {
          if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
            $('#input input').val('');
          }
        },
        [this.KeyCodes.Backquote]: () => {
          BuffModule.handleBuffs();
        },
        [this.KeyCodes.Tab]: () => {
          this.handleTabActions();
        },
        [this.KeyCodes.NumpadAdd]: () => {
          TrainingModule.start();
        },
        [this.KeyCodes.NumpadSubtract]: () => {
          TrainingModule.stop('нажата клавиша минус');
        },
        [this.KeyCodes.Home]: () => {
          Commands.sendMany(CONFIG.quickActions.healPotion);
        },
        [this.KeyCodes.End]: () => {
          Commands.sendMany(CONFIG.quickActions.healCast);
        },
        [this.KeyCodes.NumpadMultiply]: () => {
          HuntingModule.start();
        },
      };
    },

    bindKeydownEvents() {
      $('#input input').off('keydown.myNamespace');
      $('#input input').on('keydown.myNamespace', e => {
        uiLog.debug(
          `Key pressed: e.code=${e.code}, e.key=${e.key}, e.keyCode=${e.keyCode}`
        );

        if (this.handleMovement(e)) {
          return;
        }

        const hotkeyHandler = this.hotkeyHandlers?.[e.code];

        if (!hotkeyHandler) {
          return;
        }

        hotkeyHandler(e);
        e.preventDefault();
      });
    },

    init() {
      this.buildHotkeyHandlers();
      this.bindDocumentEvents();
      this.bindRpcEvents();
      this.bindTextEvents();
      this.bindInputEvents();
      this.bindKeydownEvents();
    },

    destroy() {
      this.unbindDocumentEvents();
      this.hotkeyHandlers = null;
      $('.trigger').off('.myNamespace');
      $('#rpc-events').off('.myNamespace');
      $('#input input').off('.myNamespace');
    },
  };

  function bindEvents() {
    UIBindings.init();
  }

  function bootstrap() {
    if (isBootstrapped) {
      destroy('повторный bootstrap');
    }

    bindEvents();
    exposeDebugApi();
    isBootstrapped = true;
    coreLog.info('MUD helper initialized');
  }

  function destroy(reason = 'без указания причины') {
    // Intentional: destroy() only tears down runtime state and bindings.
    // User-tuned config state (targets, weapon, delays, etc.) is preserved
    // so a script reload does not wipe the current setup.
    Store.resetBrewingRuntimeState('stopped');
    Store.resetTrainingRuntimeState('stopped');
    Store.resetHuntingRuntimeState('stopped');
    Store.resetParserRuntimeState();
    TimerManager.clearAll();
    ActionGate.clear();
    UIBindings.destroy();
    isBootstrapped = false;
    coreLog.info(`MUD helper destroyed: ${reason}`);
  }

  if (typeof PREVIOUS_MUD_BOT?.destroy === 'function') {
    PREVIOUS_MUD_BOT.destroy('повторная загрузка скрипта');
  }

  bootstrap();
})();
