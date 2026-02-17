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
  "mode.daily.completed": "Завершено сегодня — {score}/3",
  "mode.puzzles.title": "Пазлы",
  "mode.puzzles.desc": "4 уровня по 5 пазлов. Пройдите все.",
  "mode.puzzles.progress": "{count}/4 уровней пройдено",

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
  "settings.colorblind": "Режим дальтонизма",
  "settings.colorblind.desc": "Синий/оранжевый вместо зелёного/красного",

  // ── Language ──
  "lang.title": "Язык",
  "lang.en": "Английский",
  "lang.ru": "Русский",
  "lang.selected": "Выбран",
  "lang.more": "Выберите предпочитаемый язык.",

  // ── Puzzle card ──
  "puzzle.items": "Предметы",
  "puzzle.gold": "{value} золота",
  "puzzle.cs": "{lastHits} / {denies} CS",

  // ── Guess panel ──
  "guess.winloss": "Победа/Поражение",
  "guess.rank": "Ранг",
  "guess.kda": "KDA",
  "guess.level1.prompt":
    "Этот игрок <b>выиграл</b> или <b>проиграл</b> этот матч?",
  "guess.win": "Победа",
  "guess.loss": "Поражение",
  "guess.level2.prompt":
    "В каком <b>ранговом диапазоне</b> проходил этот матч?",
  "guess.level3.prompt": "Каков был <b>K / D / A</b> диапазон игрока?",

  // ── Result feedback ──
  "result.winloss": "Победа/Поражение",
  "result.rank": "Ранговый диапазон",
  "result.kda": "Диапазон KDA",
  "result.level": "Уровень {n} — {label}",

  // ── Score card ──
  "score.0": "Гриф! Повезёт в следующий раз.",
  "score.1": "Неплохо, но всё ещё зарепорчен.",
  "score.2": "Близко! Почти сошло с рук.",
  "score.3": "Идеальное чтение! Этот игрок чист.",
  "score.hero": "Герой: {name}",
  "score.matchId": "ID матча:",
  "score.puzzleOf": "Пазл {current} из {total}",
  "score.copy": "Скопировать результаты",
  "score.copied": "Скопировано!",
  "score.next": "Следующий пазл",
  "score.levelComplete": "Уровень пройден!",
  "score.backToMenu": "Назад в меню",
  "score.nextDaily": "Следующий ежедневный пазл через",

  // ── Level select ──
  "levels.title": "Пазлы",
  "levels.desc": "{count} пазлов на уровень. Пройдите все!",
  "levels.level": "Уровень {n}",
  "levels.puzzles": "{count} пазлов",
  "levels.score": "Счёт: {score}/{total}",
  "levels.back": "Назад в меню",

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

  // ── Survey ──
  "survey.question": "Вы бы зарепортили эту сборку?",
  "survey.yes": "Да, репорт",
  "survey.no": "Нет, всё нормально",
  "survey.thanks": "Спасибо за отзыв!",
};

export default ru;
