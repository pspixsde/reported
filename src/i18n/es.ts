import type { TranslationKey } from "./en";

const es: Record<TranslationKey, string> = {
  // ── Main menu ──
  "app.title": "REPORTED",
  "app.tagline":
    "Adivina el resultado de partidas reales de Dota 2 con builds inusuales y fuera del meta. ¿Puedes leer el juego?",
  "app.loading": "Cargando datos del juego...",

  // ── Mode select ──
  "mode.daily.title": "Desafío diario",
  "mode.daily.desc": "Un puzle por día. Igual para todos.",
  "mode.daily.completed": "Completado hoy — {score}/3",
  "mode.puzzles.title": "Puzles",
  "mode.puzzles.desc": "20 puzles. Complétalos todos.",
  "mode.puzzles.progress": "{completed}/{total} puzles completados",

  // ── Stats ──
  "stats.title": "Estadísticas del desafío diario",
  "stats.played": "Jugados",
  "stats.accuracy": "Precisión",

  // ── Header ──
  "header.daily": "Diario",
  "header.puzzles": "Puzles",
  "header.dailyCount": "Diario: {count}",
  "header.streak": "{count} racha",

  // ── Settings ──
  "settings.title": "Ajustes",
  "settings.easyMode": "Más estadísticas",
  "settings.easyMode.desc": "Muestra el patrimonio neto y las estadísticas de creeps.",
  "settings.colorblind": "Modo daltónico",
  "settings.colorblind.desc": "Usa azul/naranja en lugar de verde/rojo",

  // ── Language ──
  "lang.title": "Idioma",
  "lang.en": "Inglés",
  "lang.ru": "Ruso",
  "lang.es": "Español",
  "lang.selected": "Seleccionado",
  "lang.more": "Selecciona tu idioma preferido.",

  // ── Puzzle card ──
  "puzzle.items": "Objetos",
  "puzzle.gold": "{value} de oro",
  "puzzle.cs": "{lastHits} / {denies} CS",
  "puzzle.hiddenHero": "??? (¡Adivina el héroe!)",

  // ── Guess panel ──
  "guess.winloss": "Victoria/Derrota",
  "guess.rank": "Rango",
  "guess.kda": "KDA",
  "guess.hero": "Héroe",
  "guess.level1.prompt":
    "¿Este jugador <b>ganó</b> o <b>perdió</b> esta partida?",
  "guess.win": "Victoria",
  "guess.loss": "Derrota",
  "guess.level2.prompt":
    "¿Cuál fue el <b>K / D / A</b> del jugador?",
  "guess.level3.prompt":
    "¿En qué <b>rango</b> se jugó esta partida?",
  "guess.hero.prompt":
    "¿Con qué <b>héroe</b> se jugó esta build?",

  // ── Result feedback ──
  "result.winloss": "Victoria/Derrota",
  "result.rank": "Rango",
  "result.kda": "KDA",
  "result.hero": "Héroe",
  "result.level": "Nivel {n} — {label}",

  // ── Score card ──
  "score.0": "¡Griefing! Mejor suerte la próxima vez.",
  "score.1": "No está mal, pero aún reportado.",
  "score.2": "¡Cerca! Casi se sale con la suya.",
  "score.3": "¡Lectura perfecta! Este jugador está limpio.",
  "score.hard.0": "¡Griefing! Mejor suerte la próxima vez.",
  "score.hard.1": "No es genial, pero podría ser peor.",
  "score.hard.2": "No está mal, pero aún reportado.",
  "score.hard.3": "¡Cerca! Casi se sale con la suya.",
  "score.hard.4": "¡Lectura perfecta! Este jugador está limpio.",
  "score.hero": "Héroe: {name}",
  "score.matchId": "ID de partida:",
  "score.puzzleOf": "Puzle {current} de {total}",
  "score.copy": "Copiar resultados",
  "score.copied": "¡Copiado!",
  "score.backToPuzzles": "Volver a puzles",
  "score.backToMenu": "Volver al menú",
  "score.nextDaily": "Próximo puzle diario en",

  // ── Puzzle grid ──
  "levels.title": "Puzles",
  "levels.desc": "{completed}/{total} completados",
  "levels.back": "Volver al menú",
  "levels.hardMode.on": "Modo difícil: ON",
  "levels.hardMode.off": "Modo difícil: OFF",
  "levels.stats.title": "Estadísticas de puzles",
  "levels.stats.played": "Jugados",
  "levels.stats.accuracy": "Precisión",

  // ── Puzzle navigation ──
  "nav.prevPuzzle": "Puzle anterior",
  "nav.nextPuzzle": "Siguiente puzle",
  "nav.backToGrid": "Cuadrícula",

  // ── Loading ──
  "loading.puzzle": "Cargando puzle...",

  // ── About ──
  "about.title": "Sobre nosotros",
  "about.text1":
    "<gold>REPORTED</gold> es un juego de adivinanzas inspirado en Wordle para jugadores de Dota 2. Se te muestra una partida clasificatoria real con una build inusual y fuera del meta, y debes adivinar el resultado: ¿ganaron? ¿En qué rango? ¿Cuál fue su KDA?",
  "about.text2":
    'Todos los datos de partidas provienen de la API de <link href="https://www.opendota.com">OpenDota</link>. Los nuevos puzles se obtienen exclusivamente de partidas clasificatorias del último parche.',
  "about.disclaimer":
    "Dota 2 es una marca registrada de Valve Corporation. Valve Corporation no respalda ni patrocina este proyecto.",

  // ── Privacy ──
  "privacy.title": "Política de privacidad",
  "privacy.text":
    "No recopilamos datos personales ni mostramos anuncios. Tu progreso de juego se almacena localmente en tu navegador. Se publicará una política de privacidad completa aquí si eso cambia.",

  // ── Answer translations ──
  "answer.Win": "Victoria",
  "answer.Loss": "Derrota",
  "answer.Herald": "Heraldo",
  "answer.Guardian": "Guardián",
  "answer.Crusader": "Cruzado",
  "answer.Archon": "Arconte",
  "answer.Legend": "Leyenda",
  "answer.Ancient": "Ancestro",
  "answer.Divine": "Divino",
  "answer.Immortal": "Inmortal",

  // ── Survey ──
  "survey.question": "¿Reportarías esta build?",
  "survey.yes": "Sí, reportar",
  "survey.no": "No, está bien",
  "survey.thanks": "¡Gracias por tu opinión!",
  "survey.reportPercent": "{percent}% de los jugadores reportaría esta build.",

  // ── Global stats ──
  "stats.levelCorrect": "{percent}% de los jugadores adivinaron correctamente",
  "stats.levelCorrect.daily": "{percent}% de los jugadores adivinaron correctamente hoy",
  "stats.avgScore": "Puntuación media: {avg}/{max}",
};

export default es;
