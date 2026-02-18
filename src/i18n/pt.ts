import type { TranslationKey } from "./en";

const pt: Record<TranslationKey, string> = {
  // ── Main menu ──
  "app.title": "REPORTED",
  "app.tagline":
    "Adivinhe o resultado de partidas reais de Dota 2 com builds incomuns e fora do meta. Consegue ler o jogo?",
  "app.loading": "Carregando dados do jogo...",

  // ── Mode select ──
  "mode.daily.title": "Desafio Diário",
  "mode.daily.desc": "Um puzzle por dia. Igual para todos.",
  "mode.daily.completed": "Concluído hoje",
  "mode.puzzles.title": "Puzzles",
  "mode.puzzles.desc": "30 puzzles. Complete todos.",
  "mode.puzzles.progress": "{completed}/{total} puzzles concluídos",

  // ── Stats ──
  "stats.title": "Estatísticas do Desafio Diário",
  "stats.played": "Jogados",
  "stats.accuracy": "Precisão",

  // ── Header ──
  "header.daily": "Diário",
  "header.puzzles": "Puzzles",
  "header.dailyCount": "Diário: {count}",
  "header.streak": "{count} sequência",

  // ── Settings ──
  "settings.title": "Configurações",
  "settings.easyMode": "Mais Estatísticas",
  "settings.easyMode.desc": "Mostra patrimônio líquido e estatísticas de creeps.",
  "settings.colorblind": "Modo Daltônico",
  "settings.colorblind.desc": "Usa azul/laranja em vez de verde/vermelho",

  // ── Language ──
  "lang.title": "Idioma",
  "lang.en": "Inglês",
  "lang.ru": "Russo",
  "lang.es": "Espanhol",
  "lang.pt": "Português",
  "lang.selected": "Selecionado",
  "lang.more": "Selecione seu idioma preferido.",

  // ── Puzzle card ──
  "puzzle.items": "Itens",
  "puzzle.gold": "{value} de ouro",
  "puzzle.cs": "{lastHits} / {denies} CS",
  "puzzle.hiddenHero": "???",

  // ── Guess panel ──
  "guess.winloss": "Vitória/Derrota",
  "guess.rank": "Rank",
  "guess.kda": "KDA",
  "guess.hero": "Herói",
  "guess.level1.prompt":
    "Este jogador <b>venceu</b> ou <b>perdeu</b> esta partida?",
  "guess.win": "Vitória",
  "guess.loss": "Derrota",
  "guess.level2.prompt":
    "Qual foi o <b>K / D / A</b> do jogador?",
  "guess.level3.prompt":
    "Em qual <b>faixa de rank</b> esta partida foi jogada?",
  "guess.hero.prompt":
    "Com qual <b>herói</b> esta build foi jogada?",

  // ── Result feedback ──
  "result.winloss": "Vitória/Derrota",
  "result.rank": "Faixa de Rank",
  "result.kda": "KDA",
  "result.hero": "Herói",
  "result.level": "Nível {n} — {label}",

  // ── Score card ──
  "score.0": "Griefing! Mais sorte na próxima vez.",
  "score.1": "Não foi mal, mas ainda reportado.",
  "score.2": "Quase! Por pouco não escapou.",
  "score.3": "Leitura perfeita! Este jogador está limpo.",
  "score.hard.0": "Griefing! Mais sorte na próxima vez.",
  "score.hard.1": "Não foi ótimo, mas poderia ser pior.",
  "score.hard.2": "Não foi mal, mas ainda reportado.",
  "score.hard.3": "Quase! Por pouco não escapou.",
  "score.hard.4": "Leitura perfeita! Este jogador está limpo.",
  "score.hero": "Herói: {name}",
  "score.matchId": "ID da partida:",
  "score.puzzleOf": "Puzzle {current} de {total}",
  "score.copy": "Copiar Resultados",
  "score.copied": "Copiado!",
  "score.backToPuzzles": "Voltar aos Puzzles",
  "score.backToMenu": "Voltar ao Menu",
  "score.nextDaily": "Próximo puzzle diário em",

  // ── Puzzle grid ──
  "levels.title": "Puzzles",
  "levels.desc": "{completed}/{total} concluídos",
  "levels.back": "Voltar ao Menu",
  "levels.hardMode.on": "Modo Difícil: ON",
  "levels.hardMode.off": "Modo Difícil: OFF",
  "levels.stats.title": "Estatísticas dos Puzzles",
  "levels.stats.played": "Jogados",
  "levels.stats.accuracy": "Precisão",

  // ── Puzzle navigation ──
  "nav.prevPuzzle": "Puzzle anterior",
  "nav.nextPuzzle": "Próximo puzzle",
  "nav.backToGrid": "Grade",

  // ── Loading ──
  "loading.puzzle": "Carregando puzzle...",

  // ── About ──
  "about.title": "Sobre Nós",
  "about.text1":
    "<gold>REPORTED</gold> é um jogo de adivinhação inspirado no Wordle para jogadores de Dota 2. Você vê uma partida ranqueada real com uma build incomum e fora do meta, e deve adivinhar o resultado — venceram? Qual faixa de rank? Qual foi o KDA?",
  "about.text2":
    'Todos os dados de partidas vêm da API do <link href="https://www.opendota.com">OpenDota</link>. Novos puzzles são obtidos exclusivamente de partidas ranqueadas do patch mais recente.',
  "about.disclaimer":
    "Dota 2 é uma marca registrada da Valve Corporation. A Valve Corporation não endossa nem patrocina este projeto.",

  // ── Privacy ──
  "privacy.title": "Política de Privacidade",
  "privacy.text":
    "Não coletamos dados pessoais nem exibimos anúncios. Seu progresso no jogo é armazenado localmente no seu navegador. Uma política de privacidade completa será publicada aqui se isso mudar.",

  // ── Answer translations ──
  "answer.Win": "Vitória",
  "answer.Loss": "Derrota",
  "answer.Herald": "Arauto",
  "answer.Guardian": "Guardião",
  "answer.Crusader": "Cruzado",
  "answer.Archon": "Arconte",
  "answer.Legend": "Lenda",
  "answer.Ancient": "Ancestral",
  "answer.Divine": "Divino",
  "answer.Immortal": "Imortal",

  // ── Survey ──
  "survey.question": "Você reportaria esta build?",
  "survey.yes": "Sim, Reportar",
  "survey.no": "Não, Está Bem",
  "survey.thanks": "Obrigado pelo seu feedback!",
  "survey.reportPercent": "{percent}% dos jogadores reportariam esta build.",

  // ── Global stats ──
  "stats.levelCorrect": "{percent}% dos jogadores acertaram",
  "stats.levelCorrect.daily": "{percent}% dos jogadores acertaram hoje",
  "stats.avgScore": "Pontuação Global Média: {avg}/{max}",
};

export default pt;
