Você é um agente trabalhando num projeto pessoal de RPG de mesa baseado em
"DARK SOULS: The Roleplaying Game" da Steamforged Games.

CONTEXTO DO PROJETO
- Campanha homebrew em português. Mestre: usuário. Jogadores: Caio (Marin),
  Greg (Zarkov), e outros (Drakar, Elvyra) que são Bruno e Kevin respectivamente.
- Sistema base: Dark Souls RPG (Steamforged). Sabidamente cheio de erros na
  primeira tiragem; existe reimpressão oficial corrigida + erratas comunitárias.
  Em qualquer conflito de regra: priorizar (1) reimpressão oficial,
  (2) errata/FAQ comunitário consolidado, (3) primeira tiragem.
- Mecânicas-chave já estabelecidas pela mesa:
  * Position = HP + stamina + recurso de habilidades (regra do livro).
  * Descanso: curto = metade da Position; longo = só em fogueira.
  * Morte: 3 mortes por personagem. Pegar a alma na arena (1 ação) reseta o
    contador. 3 mortes consecutivas sem recuperar = personagem cai no abismo
    espiritual (perdido).
  * Empurrar/arrastar/levantar: até 30× Força.
- Lore homebrew central: Nish Windwalker (NPC âncora), cego após batalha com
  Gwyn, invoca undeads via ritual herético. Os PCs são acordados por ele no
  Undead Asylum. Marin é filho de Nish. Zarkov entra no pacto dos Peregrinos
  da Escuridão (boss final dele: Darklurker). Dusk = esposa morta de Nish.

ESTRUTURA DE PASTAS (já existente no notebook do mestre)
- /Battle Maps           mapas táticos das sessões
- /sessoes               roteiro de cada sessão
- /trilha_sonora_rpg     playlists/cues
- DS RPG - EN.pdf        livro original em inglês
- DS RPG - PT.pdf        livro traduzido (não-oficial; conferir com EN sempre)
- Mecanicas.md           consolidado de regras (livro + caseiras) — fonte da verdade
- painel_mestre.html     painel web do mestre (HUD de sessão)

REGRAS DE OUTPUT (para você, agente)
- Sem "vou implementar…" / "implementei X, Y…". Sem resumo final.
- Mudança pequena = só o trecho. Não recolar arquivo inteiro.
- Comentário só quando o "porquê" não é evidente. Nunca o "o quê".
- Ambíguo em algo que muda implementação: uma pergunta objetiva.
  Cosmético: assume e segue.
- Sem dependência externa nova sem perguntar.
- Conflito de regras DS RPG: aplicar ordem de prioridade acima.
- PT do livro tem erros de tradução; em dúvida, abrir EN.

ESTADO ATUAL
- Mecanicas.md ainda não está unificado (livro + caseiras). É a próxima tarefa.
- painel_mestre.html existe mas precisa de definição: lê JSON de estado da
  sessão (Position/Estus/Almas dos PCs, contador de mortes, fogueira ativa).
- Versionamento: git pessoal a ser configurado (computador já tem git
  corporativo; usar includeIf por diretório).