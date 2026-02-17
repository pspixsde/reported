const en = {
  // ── Main menu ──
  "app.title": "REPORTED",
  "app.tagline":
    "Guess the outcome of real Dota 2 matches featuring unusual, off-meta builds. Can you read the game?",
  "app.loading": "Loading game data...",

  // ── Mode select ──
  "mode.daily.title": "Daily Challenge",
  "mode.daily.desc": "One puzzle per day. Same for everyone.",
  "mode.daily.completed": "Completed today — {score}/3",
  "mode.puzzles.title": "Puzzles",
  "mode.puzzles.desc": "20 puzzles. Complete them all.",
  "mode.puzzles.progress": "{completed}/{total} puzzles complete",

  // ── Stats ──
  "stats.title": "Daily Challenge Stats",
  "stats.played": "Played",
  "stats.accuracy": "Accuracy",

  // ── Header ──
  "header.daily": "Daily",
  "header.puzzles": "Puzzles",
  "header.dailyCount": "Daily: {count}",
  "header.streak": "{count} streak",

  // ── Settings ──
  "settings.title": "Settings",
  "settings.easyMode": "Easy Mode",
  "settings.easyMode.desc": "Shows net worth and creep stats. Green logo.",
  "settings.colorblind": "Colorblind Mode",
  "settings.colorblind.desc": "Use blue/orange instead of green/red",

  // ── Language ──
  "lang.title": "Language",
  "lang.en": "English",
  "lang.ru": "Russian",
  "lang.selected": "Selected",
  "lang.more": "Select your preferred language.",

  // ── Puzzle card ──
  "puzzle.items": "Items",
  "puzzle.gold": "{value} gold",
  "puzzle.cs": "{lastHits} / {denies} CS",
  "puzzle.hiddenHero": "??? (Guess the hero!)",

  // ── Guess panel ──
  "guess.winloss": "Win/Loss",
  "guess.rank": "Rank",
  "guess.kda": "KDA",
  "guess.hero": "Hero",
  "guess.level1.prompt":
    "Did this player <b>win</b> or <b>lose</b> this match?",
  "guess.win": "Win",
  "guess.loss": "Loss",
  "guess.level2.prompt":
    "What was the player's <b>K / D / A</b>?",
  "guess.level3.prompt":
    "What <b>rank bracket</b> was this match played in?",
  "guess.hero.prompt":
    "Which <b>hero</b> was this build played on?",

  // ── Result feedback ──
  "result.winloss": "Win/Loss",
  "result.rank": "Rank Bracket",
  "result.kda": "KDA",
  "result.hero": "Hero",
  "result.level": "Level {n} — {label}",

  // ── Score card ──
  "score.0": "Griefing! Better luck next time.",
  "score.1": "Not bad, but still reported.",
  "score.2": "Close! Almost got away with it.",
  "score.3": "Perfect read! This player is clean.",
  "score.hero": "Hero: {name}",
  "score.matchId": "Match ID:",
  "score.puzzleOf": "Puzzle {current} of {total}",
  "score.copy": "Copy Results",
  "score.copied": "Copied!",
  "score.backToPuzzles": "Back to Puzzles",
  "score.backToMenu": "Back to Menu",
  "score.nextDaily": "Next daily puzzle in",

  // ── Puzzle grid ──
  "levels.title": "Puzzles",
  "levels.desc": "{completed}/{total} completed",
  "levels.back": "Back to Menu",
  "levels.hardMode.on": "Hard Mode: ON",
  "levels.hardMode.off": "Hard Mode: OFF",
  "levels.stats.title": "Puzzles Stats",
  "levels.stats.played": "Played",
  "levels.stats.accuracy": "Accuracy",

  // ── Puzzle navigation ──
  "nav.prevPuzzle": "Previous puzzle",
  "nav.nextPuzzle": "Next puzzle",
  "nav.backToGrid": "Grid",

  // ── Loading ──
  "loading.puzzle": "Loading puzzle...",

  // ── About ──
  "about.title": "About Us",
  "about.text1":
    "<gold>REPORTED</gold> is a Wordle-inspired guessing game for Dota 2 players. You're shown a real ranked match featuring an unusual, off-meta build and challenged to guess the outcome — did they win? What rank bracket? What was their KDA?",
  "about.text2":
    'All match data comes from the <link href="https://www.opendota.com">OpenDota</link> API. New puzzles are sourced exclusively from ranked matches on the latest patch.',
  "about.disclaimer":
    "Dota 2 is a registered trademark of Valve Corporation. Valve Corporation does not endorse or sponsor this project.",

  // ── Privacy ──
  "privacy.title": "Privacy Policy",
  "privacy.text":
    "We don't collect personal data or run ads. Your game progress is stored locally in your browser. A full privacy policy will be published here if that ever changes.",

  // ── Answer translations ──
  "answer.Win": "Win",
  "answer.Loss": "Loss",
  "answer.Herald": "Herald",
  "answer.Guardian": "Guardian",
  "answer.Crusader": "Crusader",
  "answer.Archon": "Archon",
  "answer.Legend": "Legend",
  "answer.Ancient": "Ancient",
  "answer.Divine": "Divine",
  "answer.Immortal": "Immortal",

  // ── Survey ──
  "survey.question": "Would you report this build?",
  "survey.yes": "Yes, Report",
  "survey.no": "No, It's Fine",
  "survey.thanks": "Thanks for your feedback!",
} as const;

export type TranslationKey = keyof typeof en;
export default en;
