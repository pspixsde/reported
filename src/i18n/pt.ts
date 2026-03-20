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
  "mode.puzzles.desc": "20 puzzles padrão e 20 difíceis. Complete todos.",
  "mode.puzzles.progress": "{completed}/{total} puzzles concluídos",
  "mode.clash.title": "Build Clash",
  "mode.clash.desc": "Um duelo diário entre duas builds estranhas.",
  "mode.clash.completed": "Concluído hoje",

  // ── Stats ──
  "stats.title": "Estatísticas do Desafio Diário",
  "stats.played": "Jogados",
  "stats.accuracy": "Precisão",

  // ── Header ──
  "header.daily": "Diário",
  "header.puzzles": "Puzzles",
  "header.clash": "Build Clash",
  "header.dailyCount": "Diário: {count}",

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
  "puzzle.aghs": "Aghanim's Scepter",
  "puzzle.shard": "Aghanim's Shard",
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
  "guess.clash.winner.prompt": "Qual jogador venceu sua partida com esta build?",
  "guess.clash.kda.prompt": "Qual jogador teve a melhor razão de KDA?",
  "guess.clash.rank.prompt": "Associe estes dois ranks aos jogadores corretos.",
  "guess.clash.swap": "Trocar",
  "guess.clash.confirm": "Confirmar",

  // ── Result feedback ──
  "result.winloss": "Vitória/Derrota",
  "result.rank": "Faixa de Rank",
  "result.kda": "KDA",
  "result.hero": "Herói",
  "result.level": "Nível {n} — {label}",
  "result.clash.winner": "Vencedor",
  "result.clash.kda": "Melhor KDA",
  "result.clash.rank": "Associação de rank",

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
  "score.clash.0": "Errou tudo. Mais sorte amanhã.",
  "score.clash.1": "Um acerto. Precisa de mais.",
  "score.clash.2": "Boa leitura. Quase perfeito.",
  "score.clash.3": "Leitura perfeita do Clash!",
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
  "levels.standard.title": "Puzzles padrão",
  "levels.hard.title": "Puzzles difíceis",
  "levels.stats.title": "Estatísticas dos Puzzles",
  "levels.stats.played": "Jogados",
  "levels.stats.accuracy": "Precisão",
  "levels.newPuzzlesMonthly": "Novos puzzles todo mes!",

  // ── Puzzle navigation ──
  "nav.prevPuzzle": "Puzzle anterior",
  "nav.nextPuzzle": "Próximo puzzle",
  "nav.backToGrid": "Grade",

  // ── Loading ──
  "loading.puzzle": "Carregando puzzle...",
  "loading.clash": "Carregando Build Clash...",

  // ── About ──
  "about.title": "Sobre Nós",
  "about.text1":
    "<gold>REPORTED</gold> é um jogo de adivinhação inspirado no Wordle para jogadores de Dota 2. Jogue Daily Challenge, Puzzles e Build Clash usando partidas ranqueadas reais com builds incomuns.",
  "about.text2":
    'Todos os dados de partidas vêm da API do <link href="https://www.opendota.com">OpenDota</link>. Novos puzzles são obtidos exclusivamente de partidas ranqueadas do patch mais recente.',
  "about.disclaimer":
    "Dota 2 é uma marca registrada da Valve Corporation. A Valve Corporation não endossa nem patrocina este projeto.",

  // ── Privacy ──
  "privacy.title": "Política de Privacidade",
  "privacy.text":
    "Não coletamos dados pessoais nem exibimos anúncios. Seu progresso no jogo é armazenado localmente no seu navegador. Uma política de privacidade completa será publicada aqui se isso mudar.",

  // ── Help ──
  "help.title": "Ajuda",
  "help.howToPlay": "Como jogar",
  "help.daily": "Desafio Diário: um puzzle por dia, o mesmo para todos.",
  "help.puzzles": "Modo Puzzles: jogue puzzles padrão e difíceis no seu ritmo.",
  "help.clash": "Build Clash: compare duas builds estranhas e adivinhe vencedor, melhor KDA e associação de ranks.",
  "help.levels": "Puzzles padrão têm 3 níveis: Vitória/Derrota, KDA e Rank.",
  "help.hardMode": "Puzzles difíceis têm 4 níveis: Herói, Vitória/Derrota, KDA e Rank.",
  "help.facets": "As facetas aparecem nas builds e opções de herói para dar mais contexto.",
  "help.scoring": "Você ganha 1 ponto por acerto. A pontuação é 0-3 no padrão e 0-4 no difícil.",
  "help.settings": "Use Configurações para Mais Estatísticas e Modo Daltônico. O progresso salva automaticamente.",

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
  "clash.player1": "Jogador 1",
  "clash.player2": "Jogador 2",

  // ── Global stats ──
  "stats.levelCorrect": "{percent}% dos jogadores acertaram",
  "stats.levelCorrect.daily": "{percent}% dos jogadores acertaram hoje",
  "stats.avgScore": "Pontuação Global Média: {avg}/{max}",
  "stats.clash.title": "Estatísticas do Build Clash",
};

export default pt;
