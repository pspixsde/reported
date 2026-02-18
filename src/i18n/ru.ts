import type { TranslationKey } from "./en";

const ru: Record<TranslationKey, string> = {
  // ── Main menu ──
  "app.title": "REPORTED",
  "app.tagline":
    "Угадайте исход реальных матчей Dota 2 с необычными сборками. Сможете прочитать игру?",
  "app.loading": "Загрузка данных игры...",

  // ── Mode select ──
  "mode.daily.title": "Ежедневный вызов",
  "mode.daily.desc": "Один пазл в день. Одинаковый для всех.",
  "mode.daily.completed": "Завершено сегодня",
  "mode.puzzles.title": "Пазлы",
  "mode.puzzles.desc": "30 пазлов. Пройдите все.",
  "mode.puzzles.progress": "{completed}/{total} пазлов пройдено",

  // ── Stats ──
  "stats.title": "Статистика ежедневного вызова",
  "stats.played": "Сыграно",
  "stats.accuracy": "Точность",

  // ── Header ──
  "header.daily": "Ежедневный",
  "header.puzzles": "Пазлы",
  "header.dailyCount": "Ежедн.: {count}",
  "header.streak": "{count} серия",

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
    "В каком <b>ранговом диапазоне</b> проходил этот матч?",
  "guess.hero.prompt":
    "На каком <b>герое</b> была эта сборка?",

  // ── Result feedback ──
  "result.winloss": "Победа/Поражение",
  "result.rank": "Ранговый диапазон",
  "result.kda": "KDA",
  "result.hero": "Герой",
  "result.level": "Уровень {n} — {label}",

  // ── Score card ──
  "score.0": "Гриф! Повезёт в следующий раз.",
  "score.1": "Неплохо, но всё ещё зарепорчен.",
  "score.2": "Близко! Почти сошло с рук.",
  "score.3": "Идеальное чтение! Этот игрок чист.",
  "score.hard.0": "Гриф! Повезёт в следующий раз.",
  "score.hard.1": "Не лучший результат, но могло быть хуже.",
  "score.hard.2": "Неплохо, но всё ещё зарепорчен.",
  "score.hard.3": "Близко! Почти сошло с рук.",
  "score.hard.4": "Идеальное чтение! Этот игрок чист.",
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
  "levels.hardMode.on": "Сложный режим: ВКЛ",
  "levels.hardMode.off": "Сложный режим: ВЫКЛ",
  "levels.stats.title": "Статистика пазлов",
  "levels.stats.played": "Сыграно",
  "levels.stats.accuracy": "Точность",

  // ── Puzzle navigation ──
  "nav.prevPuzzle": "Предыдущий пазл",
  "nav.nextPuzzle": "Следующий пазл",
  "nav.backToGrid": "Сетка",

  // ── Loading ──
  "loading.puzzle": "Загрузка пазла...",

  // ── About ──
  "about.title": "О нас",
  "about.text1":
    "<gold>REPORTED</gold> — это игра-угадайка в стиле Wordle для игроков Dota 2. Вам показывают реальный рейтинговый матч с необычной сборкой, и вы должны угадать исход — победил ли игрок? Какой ранговый диапазон? Какой был KDA?",
  "about.text2":
    'Все данные о матчах берутся из API <link href="https://www.opendota.com">OpenDota</link>. Новые пазлы берутся исключительно из рейтинговых матчей последнего патча.',
  "about.disclaimer":
    "Dota 2 является зарегистрированной торговой маркой Valve Corporation. Valve Corporation не поддерживает и не спонсирует этот проект.",

  // ── Privacy ──
  "privacy.title": "Политика конфиденциальности",
  "privacy.text":
    "Мы не собираем персональные данные и не показываем рекламу. Ваш игровой прогресс хранится локально в вашем браузере. Полная политика конфиденциальности будет опубликована здесь, если что-то изменится.",

  // ── Answer translations ──
  "answer.Win": "Победа",
  "answer.Loss": "Поражение",
  "answer.Herald": "Герольд",
  "answer.Guardian": "Страж",
  "answer.Crusader": "Крестоносец",
  "answer.Archon": "Архонт",
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

  // ── Global stats ──
  "stats.levelCorrect": "{percent}% игроков угадали правильно",
  "stats.levelCorrect.daily": "{percent}% игроков угадали правильно сегодня",
  "stats.avgScore": "Средний глобальный результат: {avg}/{max}",
};

export default ru;
