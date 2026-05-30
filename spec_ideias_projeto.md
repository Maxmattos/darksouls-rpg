# Requisitos e Backlog — Painel do Mestre DS RPG

Rastreia o que foi especificado, o que foi implementado e o que está pendente.
Atualizar conforme o projeto avança.

---

## v1 — Sessão 1 (escopo definido em `spec_painel.md`)

### Especificado

- [x] Arquitetura: único `painel_mestre.html`, duas vistas via query string
- [x] Sincronização via BroadcastChannel (sem servidor)
- [x] Persistência: localStorage + export/import JSON
- [x] Schema de estado: PCs, inimigos, combate
- [x] Vista mestre: edição de todos os campos dos 4 PCs
- [x] Vista mestre: iniciar/encerrar combate com pool temporário
- [x] Vista mestre: marcar morte, recuperar marca, retornar ao combate
- [x] Vista mestre: seção de inimigos com position atual/máx e nota
- [x] Vista mestre: position máxima dos inimigos (visível só para o mestre)
- [x] Vista jogadores: exibição read-only dos PCs, sem inimigos
- [x] Vista jogadores: estética Dark Souls, legível a 2–3 m em 1080p
- [x] Bloodied calculado e exibido em ambas as vistas (somente em combate)
- [x] Edge cases documentados: TPK, segunda morte, PC ausente em combate, etc.
- [x] Bloodied effects por origem (estrutura tipada em bloodied_origens.json)
- [x] Atributos base dos PCs no schema
- [x] Destaque visual de atributos afetados por Bloodied (15 → 17)

### Implementado

*(preencher conforme `painel_mestre.html` for construído)*

- [ ] ...

---

## Backlog

Itens fora do escopo da sessão 1. Priorizar antes da sessão em que forem necessários.

---

### Bug: Carregar JSON não responde

**Status:** identificado durante testes da v1; deixado de fora da sessão 1 porque export funciona (snapshot final basta).

**Hipótese:** handler do botão pode estar quebrado pela mudança de label/input ou pelo `e.preventDefault()` no listener.

**Investigar:** `main.js` — listener do `lbl-import`, verificar se o `input[type=file]` está sendo clicado corretamente. Pode ser que o `label` envolva o input e o click esteja sendo capturado errado.

**Prioridade:** antes da sessão 2 (para poder restaurar estado entre sessões via JSON).

---

### Efeitos de equipamento aplicados no card

**Status:** schema tem campo `equipamento: { sword, shield, armor, ring1, ring2 }` (todos null), UI já exibe os 5 slots vazios. Falta:

1. Criar `equipamento.json` na raiz — catálogo de itens com nome, tipo de slot, e efeitos estruturados (ex: `+2 AC`, `+1 DEX`, `"vantagem em saves de Força"`).
2. Modal de seleção de item por slot (similar ao "+ Adicionar do bestiário", filtrado por tipo de slot).
3. Lógica em `logica.js`: AC efetiva = `ac_base + ac_de_equipamento + ac_de_bloodied`. Atributos modificados por equipamento somam ao base antes do Bloodied.
4. Renderizar lista de efeitos ativos no bloco "EQUIPMENT EFFECTS" do card, lendo `pc.equipamento` + `equipamento.json`.

**Nota:** a entrada "Slots de equipamento do PC" mais abaixo cobre o backlog visual (imagens de item). Esta entrada cobre exclusivamente a lógica de efeito.

**Prioridade:** quando os PCs adquirirem o primeiro item com efeito mecânico significativo (provavelmente sessão 2–3).

---

### Level up mid-sessão

**Contexto:** level up é decisão do jogador, não do mestre — acontece quando o PC banca as almas na fogueira. O painel pode facilitar sem se tornar uma trava.

**Comportamento desejado:**
- Botão "Subiu de nível" por PC abre um mini-formulário com:
  - Campo `nivel` (incrementado automaticamente)
  - Campo `con_mod` (editável — o jogador pode ter aumentado CON neste nível)
- Ao confirmar: `base_position += con_mod`; `estus_max` recalculado pela tabela; `position_atual` ajustado proporcionalmente ou mantido (a decidir)
- O cálculo deve ser transparente e reversível — se o mestre errar, precisa corrigir sem refazer tudo

**Complexidade:** `con_mod` pode mudar no level up (aumento de atributo). O painel precisa do valor antigo e do novo para calcular corretamente. Detalhar na spec quando for priorizar.

**Prioridade:** necessário antes da sessão 2 (o grupo sobe para nível 2 ao final da sessão 1 — ver roteiro em `/sessoes/sessão01_01_06_2026/`).

---

### Bestiário — UI rica de seleção

**Contexto:** v1 carrega `bestiario.json` e pré-popula inimigos da sessão 1 no estado inicial. Adicionar novos inimigos durante a sessão funciona via JSON manual ou "+ Adicionar do bestiário" simples.

**Comportamento desejado:**
- Modal de busca com filtros (CR, tipo, tags como "undead", "demon", "boss")
- Preview do stat block antes de instanciar
- Sugestões de encontros balanceados por CR do grupo
- Editor in-place do bestiário (sem editar JSON manualmente)

**Prioridade:** quando o bestiário tiver 10+ entradas.

---

### Spell tracking por PC caster

**Contexto:** Marin (Pyromancer) tem attunement slots e casts por spell. Por decisão da v1, spell tracking fica fora do painel. Razões:
(1) o jogador caster já controla seus próprios recursos na ficha de personagem; o painel não deve duplicar esse controle;
(2) preserva tensão narrativa — os outros PCs (na vista TV) não descobrem por antecipação que o caster tem uma spell poderosa disponível; a revelação acontece pela narração do próprio jogador na hora do uso.

**Comportamento desejado (a refinar):**
- Seção colapsável no card do PC, visível somente na vista mestre
- Lista de spells equipadas com `nome`, `casts_atual`, `casts_max`
- Botão por spell: "Usar cast" (`casts_atual--`) e "Recarregar" (reset ao Long Rest)
- Spells só recarregam em Long Rest em fogueira (ver Mecanicas.md §3 e §6)

**Dependência:** ficha final de Marin com spell list e attunement slots da classe Pyromancer.

---

### Fogueira como entidade

**Contexto:** Long Rest só é possível em fogueira (RAW — ver Mecanicas.md §3). O painel poderia registrar qual fogueira está ativa e disparar o reset de Estus, casts e inimigos comuns.

**Comportamento desejado (a refinar):**
- Campo "Fogueira ativa" (nome livre)
- Botão "Descanso Longo": recarrega Estus de todos, recarrega casts, reseta inimigos comuns (chefes não)
- Botão "Descanso Curto": restaura metade da Base Position de cada PC

---

### Acesso de jogadores por dispositivo próprio

**Contexto:** hoje a vista jogadores roda na TV via HDMI do notebook do mestre. Futuro: cada jogador acessa no celular.

**Bloqueio:** BroadcastChannel só funciona na mesma máquina/browser. Precisaria de servidor (WebSocket, servidor local, ou solução P2P) para comunicação cross-device.

---

### Rastreamento de iniciativa / ordem de turno

**Contexto:** hoje o painel é tracker passivo de Position. Ordem de combate (Fast/Slow) é gerenciada verbalmente na mesa.

**Comportamento desejado (a refinar):**
- Input de iniciativa por criatura (DC + resultado da rolagem)
- Exibição da ordem: Fast (acima da DC) → Slow (abaixo)
- Botão "Próximo turno" avança para a próxima criatura na lista

---

### Slots de equipamento do PC

**Contexto:** painel hoje mostra atributos e Bloodied effects. Faltam os itens equipados (Dark Souls clássico): espada / escudo / armadura / anel 1 / anel 2.

**Comportamento desejado:**
- 5 slots visuais no card de PC (vista mestre E jogadores).
- Quadrados/retângulos com imagem do item ou placeholder.
- Cada item tem efeito ativo (texto curto) exibido abaixo dos atributos, antes dos efeitos de Bloodied.
- Separador visual entre "efeitos de item" e "efeitos de Bloodied".
- Edição via modal do mestre (escolher do `equipamento.json`).

**Dependência:** criar `equipamento.json` (catálogo de itens com imagem, tipo, efeito).

**Prioridade:** quando os PCs adquirirem itens com efeito ativo significativo (provavelmente após sessão 2–3).
