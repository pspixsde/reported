import type { TranslationKey } from "./en";

const ru: Record<TranslationKey, string> = {
  // ── Main menu ──
  "app.title": "REPORTED",
  "app.tagline":
    "Угадайте исход реальных матчей Dota 2 с необычными сборками. Сможете прочитать игру?",
  "app.loading": "Загрузка данных игры...",

  // ── Mode select ──
  "mode.daily.title": "Ежедневный челлендж",
  "mode.daily.desc": "Один пазл в день. Одинаковый для всех.",
  "mode.daily.completed": "Завершено сегодня",
  "mode.puzzles.title": "Пазлы",
  "mode.puzzles.desc": "20 обычных и 20 сложных пазлов. Пройдите все.",
  "mode.puzzles.progress": "{completed}/{total} пазлов пройдено",
  "mode.clash.title": "Build Clash",
  "mode.clash.desc": "Ежедневная дуэль двух необычных сборок.",
  "mode.clash.completed": "Завершено сегодня",

  // ── Stats ──
  "stats.title": "Статистика ежедневного вызова",
  "stats.played": "Сыграно",
  "stats.accuracy": "Точность",

  // ── Header ──
  "header.daily": "Ежедневный",
  "header.puzzles": "Пазлы",
  "header.clash": "Build Clash",
  "header.dailyCount": "Ежедн.: {count}",

  // ── Settings ──
  "settings.title": "Настройки",
  "settings.easyMode": "Больше статистики",
  "settings.easyMode.desc": "Показывает золото и крипов.",
  "settings.colorblind": "Режим дальтонизма",
  "settings.colorblind.desc": "Синий/оранжевый вместо зелёного/красного",

  // ── Language ──
  "lang.title": "Язык",
  "lang.en": "Английский",
  "lang.ru": "Русский",
  "lang.es": "Испанский",
  "lang.pt": "Португальский",
  "lang.selected": "Выбран",
  "lang.more": "Выберите предпочитаемый язык.",

  // ── Puzzle card ──
  "puzzle.items": "Предметы",
  "puzzle.gold": "{value} золота",
  "puzzle.cs": "{lastHits} / {denies} CS",
  "puzzle.aghs": "Aghanim's Scepter",
  "puzzle.shard": "Aghanim's Shard",
  "puzzle.hiddenHero": "???",

  // ── Guess panel ──
  "guess.winloss": "Победа/Поражение",
  "guess.rank": "Ранг",
  "guess.kda": "KDA",
  "guess.hero": "Герой",
  "guess.level1.prompt":
    "Этот игрок <b>выиграл</b> или <b>проиграл</b> этот матч?",
  "guess.win": "Победа",
  "guess.loss": "Поражение",
  "guess.level2.prompt":
    "Каков был <b>K / D / A</b> игрока?",
  "guess.level3.prompt":
    "В каком <b>ранге</b> проходил этот матч?",
  "guess.hero.prompt":
    "На каком <b>герое</b> была эта сборка?",
  "guess.clash.winner.prompt": "Какой игрок выиграл свою игру с этими сборками?",
  "guess.clash.kda.prompt": "У какого игрока KDA выше?",
  "guess.clash.rank.prompt": "Сопоставьте эти ранги с правильными игроками.",
  "guess.clash.swap": "Поменять",
  "guess.clash.confirm": "Подтвердить",

  // ── Result feedback ──
  "result.winloss": "Победа/Поражение",
  "result.rank": "Ранг",
  "result.kda": "KDA",
  "result.hero": "Герой",
  "result.level": "Уровень {n} — {label}",
  "result.clash.winner": "Победитель",
  "result.clash.kda": "Лучший KDA",
  "result.clash.rank": "Сопоставление рангов",

  // ── Score card ──
  "score.0": "Руин! Повезёт в следующий раз.",
  "score.1": "Неплохо, но всё ещё зарепорчен.",
  "score.2": "Близко! Почти сошло с рук.",
  "score.3": "Идеально! Этот игрок хорош.",
  "score.hard.0": "Руин! Повезёт в следующий раз.",
  "score.hard.1": "Не лучший результат, но могло быть хуже.",
  "score.hard.2": "Неплохо, но всё ещё зарепорчен.",
  "score.hard.3": "Близко! Почти сошло с рук.",
  "score.hard.4": "Идеально! Этот игрок хорош.",
  "score.clash.0": "Мимо. Повезет завтра.",
  "score.clash.1": "Всего лишь один верный ответ. Мало.",
  "score.clash.2": "Сильный результат. Почти идеально.",
  "score.clash.3": "Идеальный разбор!",
  "score.hero": "Герой: {name}",
  "score.matchId": "ID матча:",
  "score.puzzleOf": "Пазл {current} из {total}",
  "score.copy": "Скопировать результаты",
  "score.copied": "Скопировано!",
  "score.backToPuzzles": "Назад к пазлам",
  "score.backToMenu": "Назад в меню",
  "score.nextDaily": "Следующий ежедневный пазл через",

  // ── Puzzle grid ──
  "levels.title": "Пазлы",
  "levels.desc": "{completed}/{total} пройдено",
  "levels.back": "Назад в меню",
  "levels.standard.title": "Обычные пазлы",
  "levels.hard.title": "Сложные пазлы",
  "levels.stats.title": "Статистика пазлов",
  "levels.stats.played": "Сыграно",
  "levels.stats.accuracy": "Точность",
  "levels.newPuzzlesMonthly": "Новые пазлы каждый месяц!",

  // ── Puzzle navigation ──
  "nav.prevPuzzle": "Предыдущий пазл",
  "nav.nextPuzzle": "Следующий пазл",
  "nav.backToGrid": "Сетка",

  // ── Loading ──
  "loading.puzzle": "Загрузка пазла...",
  "loading.clash": "Загрузка Build Clash...",

  // ── About ──
  "about.title": "О нас",
  "about.text1":
    "<gold>REPORTED</gold> — это игра-угадайка в стиле Wordle для игроков Dota 2. Играйте в Daily Challenge, Puzzles и Build Clash на основе реальных рейтинговых матчей с необычными сборками.",
  "about.text2":
    'Все данные о матчах берутся из API <link href="https://www.opendota.com">OpenDota</link>. Новые пазлы берутся исключительно из рейтинговых матчей последнего патча.',
  "about.disclaimer":
    "Dota 2 является зарегистрированной торговой маркой Valve Corporation. Valve Corporation не поддерживает и не спонсирует этот проект.",

  // ── Privacy ──
  "privacy.title": "Политика конфиденциальности",
  "privacy.text":
    "Мы не собираем персональные данные и не показываем рекламу. Ваш игровой прогресс хранится локально в вашем браузере. Полная политика конфиденциальности будет опубликована здесь, если что-то изменится.",

  // ── Help ──
  "help.title": "Помощь",
  "help.howToPlay": "Как играть",
  "help.daily": "Ежедневный челлендж: один пазл в день, одинаковый для всех.",
  "help.puzzles": "Режим пазлов: проходите обычные и сложные пазлы в своем темпе.",
  "help.clash": "Build Clash: сравните две необычные сборки и угадайте победителя, лучший KDA и соответствие рангов.",
  "help.levels": "В обычных пазлах 3 уровня: Победа/Поражение, KDA и Ранг.",
  "help.hardMode": "В сложных пазлах 4 уровня: Герой, Победа/Поражение, KDA и Ранг.",
  "help.facets": "Фасеты показываются у сборок и вариантов героев для дополнительного контекста.",
  "help.scoring": "За каждый правильный ответ вы получаете 1 очко. Счет 0-3 в обычном и 0-4 в сложном режиме.",
  "help.settings": "В Настройках доступны Больше статистики и Режим дальтонизма. Прогресс сохраняется автоматически.",

  // ── Answer translations ──
  "answer.Win": "Победа",
  "answer.Loss": "Поражение",
  "answer.Herald": "Рекрут",
  "answer.Guardian": "Страж",
  "answer.Crusader": "Рыцарь",
  "answer.Archon": "Герой",
  "answer.Legend": "Легенда",
  "answer.Ancient": "Властелин",
  "answer.Divine": "Божество",
  "answer.Immortal": "Титан",

  // ── Survey ──
  "survey.question": "Вы бы зарепортили эту сборку?",
  "survey.yes": "Да, репорт",
  "survey.no": "Нет, всё нормально",
  "survey.thanks": "Спасибо за отзыв!",
  "survey.reportPercent": "{percent}% игроков зарепортили бы эту сборку.",
  "clash.player1": "Игрок 1",
  "clash.player2": "Игрок 2",

  // ── Global stats ──
  "stats.levelCorrect": "{percent}% игроков угадали правильно",
  "stats.levelCorrect.daily": "{percent}% игроков угадали правильно сегодня",
  "stats.avgScore": "Средний глобальный результат: {avg}/{max}",
  "stats.clash.title": "Статистика Build Clash",
};

export default ru;
