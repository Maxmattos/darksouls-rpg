Você é um agente trabalhando num projeto pessoal de RPG de mesa baseado em
"DARK SOULS: The Roleplaying Game" da Steamforged Games.

CONTEXTO DO PROJETO
- Campanha homebrew em português. Mestre: usuário. Jogadores: Caio (Marin),
  Greg (Zarkov), Bruno (Drakar), Kevin (Elvyra).
- Sistema base: Dark Souls RPG (Steamforged), reimpressão 2022 (versão
  corrigida — confirmado: copyright interno 2022, sem o bug do "paladin"
  como classe, Knight equipa o próprio kit consistentemente).
- Fonte da verdade de regras: `Mecanicas.md` na raiz. SEMPRE consultar
  antes de responder qualquer dúvida de regra.
- Ordem de prioridade em conflito: (1) Mecanicas.md, (2) livro EN
  reimpresso, (3) errata/FAQ comunitário, (4) livro PT não-oficial.

LORE HOMEBREW CENTRAL
- Nish Windwalker — NPC âncora, cego após batalha com Gwyn, invoca
  undeads via ritual herético. Acorda os PCs no Undead Asylum.
- Marin — Pyromancer, origem Caster. Tema: luz da lua.
- Zarkov — entra no pacto dos Peregrinos da Escuridão (boss final dele:
  Darklurker).
- Drakar — ex-Cavaleiro do Braseiro, agora "sem chama".
- Elvyra — Cavaleira de Prata, serviu a Gwyn.
- Dusk — esposa morta de Nish.

HOUSERULES DISTINTIVAS (detalhe completo em Mecanicas.md)
- Morte: contador individual 0–3. Ao morrer, larga almas como "marca de
  sangue" no local. Recuperar (1 ação) zera o contador. 3 mortes
  consecutivas sem recuperar = permadeath. A mesa NÃO usa Hollowing nem
  falha de grupo RAW.
- Ataque não-visto fora de combate: crítico automático.
- Parry HR pendente; em uso: RAW (+2 CA como reação).

ARQUITETURA DO PAINEL (decisão já tomada — detalhe em spec_painel.md)
- Um único `painel_mestre.html`, duas vistas via URL (`?view=master`
  e `?view=players`).
- Sincronização entre janelas via `BroadcastChannel` API. Sem servidor.
- Sem framework, sem CDN. HTML/CSS/JS puro.

ESTRUTURA DE PASTAS
- /Battle Maps           mapas táticos das sessões
- /sessoes               roteiro de cada sessão
- /trilha_sonora_rpg     playlists/cues
- CLAUDE.md              este arquivo (harness do projeto)
- Mecanicas.md           fonte da verdade de regras
- spec_painel.md         spec do painel
- spec_ideias_projeto.md backlog e itens pós-v1
- painel_mestre.html     implementação do painel (a criar depois da spec)
- DS RPG - EN.pdf        livro original (não versionado — copyright)
- DS RPG - PT.pdf        tradução não-oficial (só pra conferir termos)

CONVENÇÃO DE SESSÕES (a partir da Sessão 2): arquivos de sessão em
`sessoes/sessao_0X.md` — plano, sem tema/duração/data no nome. Sessões
podem transbordar entre si (a Sessão 1 não terminou), então não fixe
fronteira de conteúdo no nome. Sessão 1 fica onde está.

RITMO E FORMATO DE SESSÃO
- Calibrar cada sessão real para até ~3h. A Sessão 1 rodou ~2h com muita
  conversa/RP. Se os jogadores progredirem rápido, plantar obstáculo/NPC
  para esticar até ~3h sem atropelar.
- Roteiro objetivo, curto, claro. Gatilho rápido > leitura longa (parar
  pra ler quebra a imersão). Fala longa só onde o tom/mistério exige
  (NPC-âncora). O roteiro conduz a ORDEM da sessão; stat blocks no painel.
- Cues [IMG] e 🎵 inline, no ponto da cena.

IMAGENS: os jogadores respondem muito a imagens. Prompts são gerados nas
conversas de prep (com contexto de cena) e formatados para o ChatGPT.
Consultar `imagens/estilo_imagens.md` para estilo global e lock
visual por personagem. No roteiro, marcar [IMG] onde a imagem entra.
- Todo prompt de imagem orienta a IA a usar a referência oficial do local
  correspondente em Dark Souls.

REGRAS DE OUTPUT (para você, agente)
- Sem "vou implementar…" / "implementei X, Y…". Sem resumo final.
- Mudança pequena = só o trecho. Não recolar arquivo inteiro.
- Comentário só quando o "porquê" não é evidente. Nunca o "o quê".
- Ambíguo em algo que muda implementação: uma pergunta objetiva.
  Cosmético: assume e segue.
- Sem dependência externa nova sem perguntar.
- Conflito de regras DS RPG: aplicar ordem de prioridade acima.
- PT do livro tem erros de tradução; em dúvida, abrir EN.
- Spec-driven: alterar comportamento começa pela spec, não pelo código.

ESTADO ATUAL
- Mecanicas.md consolidado. Pendências registradas no próprio arquivo
  (Encumbrance fino, Attunement slots por classe, Parry HR). Nenhuma
  bloqueia a sessão 1.
- Git pessoal configurado via includeIf por diretório (isolado da
  identidade corporativa).
- Repo público: github.com/Maxmattos/darksouls-rpg (branch main).
- Próximo: implementar painel_mestre.html a partir de spec_painel.md
  (branch feat/painel-mestre).
- Sessão 1 (01/06/2026, ~2h): completados Ato 0–2; parou na fogueira antes
  do boss. Grupo ainda nível 1.
- Sessão 2 = Ato 3 (Asylum Demon) + Ato 4 (penhasco/Nish → Majula jogável:
  Serelyn, mecânica de fogueira, nível 2, Rendal, Lenigrast). Roteiro em
  `sessoes/sessao_02.md`.