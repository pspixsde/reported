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
  "mode.daily.completed": "Completado hoy",
  "mode.puzzles.title": "Puzles",
  "mode.puzzles.desc": "20 puzles estándar y 20 difíciles. Complétalos todos.",
  "mode.puzzles.progress": "{completed}/{total} puzles completados",
  "mode.clash.title": "Build Clash",
  "mode.clash.desc": "Un duelo diario entre dos builds raras.",
  "mode.clash.completed": "Completado hoy",

  // ── Stats ──
  "stats.title": "Estadísticas del desafío diario",
  "stats.played": "Jugados",
  "stats.accuracy": "Precisión",

  // ── Header ──
  "header.daily": "Diario",
  "header.puzzles": "Puzles",
  "header.clash": "Build Clash",
  "header.dailyCount": "Diario: {count}",

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
  "lang.pt": "Portugués",
  "lang.selected": "Seleccionado",
  "lang.more": "Selecciona tu idioma preferido.",

  // ── Puzzle card ──
  "puzzle.items": "Objetos",
  "puzzle.gold": "{value} de oro",
  "puzzle.cs": "{lastHits} / {denies} CS",
  "puzzle.aghs": "Aghanim's Scepter",
  "puzzle.shard": "Aghanim's Shard",
  "puzzle.hiddenHero": "???",

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
  "guess.clash.winner.prompt": "¿Qué jugador ganó su partida con esta build?",
  "guess.clash.kda.prompt": "¿Qué jugador tuvo mejor ratio de KDA?",
  "guess.clash.rank.prompt": "Asigna estos dos rangos a los jugadores correctos.",
  "guess.clash.swap": "Intercambiar",
  "guess.clash.confirm": "Confirmar",

  // ── Result feedback ──
  "result.winloss": "Victoria/Derrota",
  "result.rank": "Rango",
  "result.kda": "KDA",
  "result.hero": "Héroe",
  "result.level": "Nivel {n} — {label}",
  "result.clash.winner": "Ganador",
  "result.clash.kda": "Mejor KDA",
  "result.clash.rank": "Asignación de rango",

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
  "score.clash.0": "Fallaste todo. Mejor suerte mañana.",
  "score.clash.1": "Una lectura correcta. Falta más.",
  "score.clash.2": "Muy bien. Casi perfecto.",
  "score.clash.3": "¡Lectura perfecta del Clash!",
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
  "levels.standard.title": "Puzles estándar",
  "levels.hard.title": "Puzles difíciles",
  "levels.stats.title": "Estadísticas de puzles",
  "levels.stats.played": "Jugados",
  "levels.stats.accuracy": "Precisión",
  "levels.newPuzzlesMonthly": "¡Nuevos puzles cada mes!",

  // ── Puzzle navigation ──
  "nav.prevPuzzle": "Puzle anterior",
  "nav.nextPuzzle": "Siguiente puzle",
  "nav.backToGrid": "Cuadrícula",

  // ── Loading ──
  "loading.puzzle": "Cargando puzle...",
  "loading.clash": "Cargando Build Clash...",

  // ── About ──
  "about.title": "Sobre nosotros",
  "about.text1":
    "<gold>REPORTED</gold> es un juego de adivinanzas inspirado en Wordle para jugadores de Dota 2. Juega Daily Challenge, Puzzles y Build Clash usando partidas clasificatorias reales con builds inusuales.",
  "about.text2":
    'Todos los datos de partidas provienen de la API de <link href="https://www.opendota.com">OpenDota</link>. Los nuevos puzles se obtienen exclusivamente de partidas clasificatorias del último parche.',
  "about.disclaimer":
    "Dota 2 es una marca registrada de Valve Corporation. Valve Corporation no respalda ni patrocina este proyecto.",

  // ── Privacy ──
  "privacy.title": "Política de privacidad",
  "privacy.text":
    "No recopilamos datos personales ni mostramos anuncios. Tu progreso de juego se almacena localmente en tu navegador. Se publicará una política de privacidad completa aquí si eso cambia.",

  // ── Help ──
  "help.title": "Ayuda",
  "help.howToPlay": "Como jugar",
  "help.daily": "Desafío diario: un puzle por día, igual para todos.",
  "help.puzzles": "Modo Puzles: juega puzles estándar y difíciles a tu ritmo.",
  "help.clash": "Build Clash: compara dos builds raras y adivina ganador, mejor KDA y asignación de rangos.",
  "help.levels": "Los puzles estándar tienen 3 niveles: Victoria/Derrota, KDA y Rango.",
  "help.hardMode": "Los puzles difíciles tienen 4 niveles: Héroe, Victoria/Derrota, KDA y Rango.",
  "help.scoring": "Obtienes 1 punto por cada acierto. La puntuación es 0-3 en estándar y 0-4 en difícil.",
  "help.settings": "Usa Ajustes para Más estadísticas y Modo daltónico. El progreso se guarda automáticamente.",

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
  "clash.player1": "Jugador 1",
  "clash.player2": "Jugador 2",

  // ── Global stats ──
  "stats.levelCorrect": "{percent}% de los jugadores adivinaron correctamente",
  "stats.levelCorrect.daily": "{percent}% de los jugadores adivinaron correctamente hoy",
  "stats.avgScore": "Puntuación global media: {avg}/{max}",
  "stats.clash.title": "Estadísticas de Build Clash",
};

export default es;
