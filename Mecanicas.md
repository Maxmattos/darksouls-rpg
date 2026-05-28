# MECÂNICAS — Dark Souls RPG

Fonte da verdade de regras da mesa. Prioridade em caso de conflito: (1) livro EN reimpresso, (2) houserules da mesa, (3) livro PT não-oficial.

`**[HR]**` = houserule da mesa. `(EN p.XX)` = página do livro oficial inglês.

---

## 1. Personagem

### Origens

Quatro origens disponíveis. Determinam stats base e dado de Position. (EN p.26–29)

| Origem | Dado Position | Position Nv1 | Position Nv 2+ (progressão normal) | STR | DEX | CON | INT | WIS | CHA |
|---|---|---|---|---|---|---|---|---|---|
| **Brute** (Brutal) | 1d10 | 10 + CON + nível | Base atual + CON mod | 15 (+2) | 10 (+0) | 14 (+2) | 10 (+0) | 12 (+1) | 13 (+1) |
| **Fencer** (Espadachim) | 1d8 | 8 + CON + nível | Base atual + CON mod | 12 (+1) | 15 (+2) | 14 (+2) | 13 (+1) | 10 (+0) | 10 (+0) |
| **Jack of all Trades** (Coringa) | 1d8 | 8 + CON + nível | Base atual + CON mod | 13 (+1) | 13 (+1) | 12 (+1) | 12 (+1) | 13 (+1) | 12 (+1) |
| **Caster** (Conjurador) | 1d6 | 6 + CON + nível | Base atual + CON mod | 10 (+0) | 12 (+1) | 10 (+0) | 14 (+2) | 13 (+1) | 15 (+2) |

Velocidade base: 9 m (30 ft) para todas as origens.

### Classes

Dez classes disponíveis. Todas têm proficiência em toda armadura, escudos e armas (desde que os pré-requisitos sejam atendidos). (EN p.30–31)

| Classe | Atributo primário sugerido | Saves | Página EN |
|---|---|---|---|
| **Knight** (Cavaleiro) | Força | Força, Constituição | p.32 |
| **Mercenary** (Mercenário) | Destreza | Força, Destreza | p.36 |
| **Assassin** (Assassino) | Destreza | Força, Destreza | p.40 |
| **Warrior** (Guerreiro) | Força | Força, Constituição | p.44 |
| **Thief** (Ladrão) | Destreza | Destreza, Inteligência | p.48 |
| **Herald** (Arauto) | Força e Carisma | Sabedoria, Carisma | p.52 |
| **Cleric** (Clérigo) | Sabedoria | Sabedoria, Carisma | p.56 |
| **Sorcerer** (Feiticeiro) | Inteligência | Inteligência, Sabedoria | p.60 |
| **Pyromancer** (Piromanciante) | Carisma | Constituição, Carisma | p.64 |
| **The Deprived** (O Privado) | Livre | Dois à escolha | p.68 |

### Position (Posição)

Position representa saúde, stamina e recurso de habilidades ao mesmo tempo. Chegar a 0 = morte. (EN p.79)

**Base Position ao nível 1:**

> CON mod + valor máximo do dado de Position da Origem + nível atual

Exemplo: Cavaleiro CON 15 (+2), Origem Bruta (1d10), Nível 1 → 2 + 10 + 1 = **13**.

**Ao subir de nível (2º em diante):**

> Base Position atual + CON mod

Exemplo: o mesmo Cavaleiro ao nível 2 soma +2 → Base Position **15**.

Se CON mudar permanentemente: recalcular a Position desde o nível 1 como se sempre fosse aquele valor.

**Pool de combate (Position temporária):** ao iniciar o combate (após iniciativa), cada personagem rola e soma à Position atual:

> Position Temporária = Dado de Origem × Nível (EN p.80)

Exemplo: Cavaleiro nível 2 (Brute, 1d10) → rola 2d10, tira 11 → Position de combate = 15 + 11 = **26**.

Após o combate, Position reverte à Base Position ou ao valor atual, o que for menor.

**Gastar Position** (EN p.81):

- Aumentar resultado de rolagem: **+1 por Position** gasta (sem limite em rolagens de ataque)
- Aumentar dano corpo a corpo ou à distância: **mínimo de 5 Position** para +5 de dano; pode gastar mais, sempre a partir do mínimo de 5
- Aumentar movimento: **+1,5 m por 1 Position** gasta; máximo = valor de Velocidade Base

**Restrições:**
- Só em si mesmo
- Uma vez por turno
- Não ativa efeitos de crítico

### Bloodied (Ensanguentado)

Gatilho: Position de combate ≤ 50% do pool inicial do combate atual. Só ativa em combate. Se curado acima do limiar, os efeitos cessam. (EN p.124)

| Origem | Efeitos ao ficar Bloodied |
|---|---|
| **Brute** | +3 CA; vantagem em todos os testes e saves de Força; reduz todo dano recebido em 2 |
| **Fencer** | +2 Destreza; uma reação adicional por turno; reduz custo de Position de armas corpo a corpo em 1 |
| **Jack of all Trades** | +2 Sabedoria e CA; vantagem em saves contra ataques mágicos; remove uma condição negativa à escolha |
| **Caster** | +2 Inteligência, Carisma e CA; usa habilidade especial da arma equipada sem gastar Position; não provoca ataques de oportunidade enquanto Bloodied |

---

## 2. Combate

### Turno, ações, reações

**Ordem de combate** (EN p.111):
1. Determinar surpresa
2. Posicionar criaturas + determinar pools de combate
3. Rolar iniciativa (Fast/Slow)
4. Turnos em ordem
5. Nova rodada

**Iniciativa Fast/Slow** (EN p.112): cada criatura tem um valor fixo de Iniciativa DC. PCs rolam d20 + modificador:
- Resultado **≥ DC da criatura** → age **antes** (Fast)
- Resultado **< DC da criatura** → age **depois** (Slow)

Múltiplas criaturas: usa a DC da criatura de maior CR (empate: maior INT). Ordem entre os PCs do mesmo lado: **livre** — combinem combos.

**No seu turno:** mover + 1 ação. Bonus actions e reações dependem de habilidades ou spells específicos.

**Ações em combate** (EN p.117–118):

| Ação | Efeito |
|---|---|
| Attack | 1 ataque; certas habilidades permitem mais |
| Dash | dobra o movimento deste turno |
| Disengage | movimento não provoca ataques de oportunidade neste turno |
| Dodge | desvantagem em ataques contra você; vantagem em saves de DEX (até início do próximo turno) |
| Hide | teste DEX (Furtividade) para ficar oculto |
| Help | aliado ganha vantagem no próximo ataque ou teste |
| Ready | define trigger + ação; executa como reação quando o trigger ocorre |
| Cast a Spell | conforme tempo de conjuração do spell |
| Use an Object | interagir com um 2º objeto do turno |

Todas as ações da tabela estão disponíveis a qualquer personagem em qualquer turno, independente de classe.

**Reação:** 1 por rodada; recarrega no início do próximo turno. Ataque de oportunidade é o uso mais comum.

**Crítico** (EN p.117): natural 20 → acerto automático independente de CA; dano total × 2.

**Bonus action** (EN p.112): só disponível quando uma habilidade de classe ou spell especifica explicitamente "bonus action". Sem essa especificação, não existe bonus action no turno.

### Movimento e posicionamento no grid

- Velocidade padrão: 9 m (30 ft) = 6 quadrados de 1,5 m
- Pode dividir o movimento antes e depois da ação (EN p.113)
- **Terreno difícil:** custa 2× o movimento por quadrado
- **Prone (prostrado):** levantar custa metade da velocidade; ataques corpo a corpo contra você têm vantagem; ataques à distância têm desvantagem
- **Ataque de oportunidade:** ao sair do alcance de um inimigo sem usar Disengage, o inimigo usa a reação para 1 ataque corpo a corpo (EN p.121)
- **Atravessar o espaço de uma criatura hostil** (EN p.114): RAW permite apenas se a criatura for ≥ 2 tamanhos diferente. O GM pode permitir em outros casos (ex.: passar por baixo de um inimigo grande) — se a criatura tiver reação disponível, pode usar ataque de oportunidade.
- **Tamanhos no grid:** Tiny 0,75m², Small/Medium 1,5m², Large 3m², Huge 4,5m², Gargantuan 6m²+ (EN p.115)

### Cobertura (EN p.123)

| Tipo | Bônus | Descrição |
|---|---|---|
| Half (metade) | +2 CA e saves DEX | obstáculo cobre ao menos metade do corpo |
| Three-quarters (3/4) | +5 CA e saves DEX | obstáculo cobre ~3/4 do corpo |
| Total | imune a ataques diretos | completamente oculto pelo obstáculo |

Apenas a maior cobertura se aplica; não somam entre si.

Cobertura **não penaliza** o atacante que está atrás dela — apenas beneficia a defesa. Um personagem em cobertura pode atacar com arco, spell ou qualquer outra ação normalmente.

### Flanqueamento e Ataques não-vistos

**Flanqueamento em combate** (RAW, EN p.119): quando um aliado está na frente do inimigo e outro está nas costas, o atacante nas costas ganha **vantagem** no ataque.

**[HR] Ataque não-visto fora de combate:** ataque feito antes de o combate iniciar, com o alvo completamente sem noção da presença do atacante = **crítico automático**. Diferente do flanqueamento — aqui o alvo não tem nenhuma ciência do perigo.

### Gasto de Position em manobras

As mesmas regras de gasto da seção [Position](#position-posição) aplicam-se em combate: +1 por ponto em rolagens, mínimo 5 para dano, +1,5 m de movimento. Uma vez por turno, em si mesmo, sem acionar crítico.

---

## 3. Descanso e Recuperação

### Descanso Curto (Short Rest) (EN p.98)

Duração: ≥ 1 hora sem atividade extenuante.

- Restaura Position = metade da **Base Position**
- Recarrega habilidades com tag "Short Rest"

### Descanso Longo (Long Rest) (EN p.98)

Duração: ≥ 8 horas. **Exclusivo de fogueiras** — sem fogueira, o máximo possível é Short Rest. *(RAW do livro — não é houserule.)*

- Restaura Base Position completa
- Recarrega habilidades com tag "Long Rest"
- Recarrega todos os Casts de spells equipadas ao valor inicial
- Recarrega o Estus Flask completamente
- **Inimigos comuns** da área reaparecem nas posições originais
- Chefes derrotados não retornam

### Estus Flask (EN p.154, p.261)

Todo personagem começa com um Estus Flask como equipamento inicial.

| Nível do PC | Doses (draughts) |
|---|---|
| 1–4 | 3 |
| 5–9 | 4 |
| 10–16 | 5 |
| 17–20 | 6 |

**Efeito por dose (ação):** restaura Position = metade da Base Position, arredondado para baixo.

Exemplo: Cavaleiro com Base Position 13 bebe o Estus → recupera 6 de Position.

**Recarga:** Estus é recarregado completamente em um Long Rest em fogueira. O GM pode opcionalmente recarregar após um boss ou mini-boss ser derrotado (EN p.261).

---

## 4. Morte

### Livro RAW (EN p.98–99, p.126)

Ao chegar a 0 de Position: morte → reaparece na fogueira mais próxima com Base Position completa e habilidades prontas. Perde **todas as almas coletadas**.

**Falha de grupo (RAW):** se mais da metade do grupo morrer, o grupo todo falhou — todos reaparecem na fogueira e perdem almas.

**Hollowing (RAW):** ao respawnar, save **WIS DC 18** — falha = rola 1d20 na tabela de Hollowing (EN p.99), com efeitos como perda de atributos, desvantagem em rolagens, etc. Purging Stone (1.000 almas) remove um efeito de Hollowing.

**Rejoin boss fight (RAW):** ao reentrar em combate depois de morrer e respawnar, o boss **recupera toda a Position** (apenas o boss, não os aliados).

### [HR] Regra da mesa (Sessão 0)

A mesa **substitui completamente** o sistema RAW — sem Hollowing, sem falha por contagem de mortes.

**Contador individual** por personagem. Limite: **3 mortes consecutivas** sem recuperar.

**Ao morrer (Position = 0):**
- Reaparece na **última fogueira** visitada
- Larga **todas as almas coletadas** como **marca de sangue** no local da morte

**Contador:**
- Pegar a marca de sangue (1 ação no local) → contador = **0** e recupera as almas
- Morrer de novo sem recuperar → almas do lote anterior perdidas para sempre; contador +1
- **3 mortes consecutivas** sem recuperar → personagem cai no **abismo espiritual** (permadeath)

**Boss e névoa:**
- **Boss reset:** RAW (EN p.99) — reentrar na névoa faz o boss **recuperar toda a Position**. O GM avaliará durante a campanha se também reseta para Fase 1 conforme o contexto (ex.: boss em Fase 2 com Position cheia é mais perigoso que o RAW prevê).
- Grupo **vence** o boss enquanto você está morto → névoa cai, você entra e recupera a marca de sangue em segurança; contador = 0

**TPK (todos caem):** conta 1 morte para todos; almas coletadas de todos são **perdidas sem marca de sangue**; contador de todos vai para **1**.

**[HR] vs RAW:** a mesa ignora a regra do livro de "mais de metade do grupo morto = falha de grupo".

---

## 5. Itens e Equipamento

### Almas — tipos e progressão (EN p.90–91)

| Tipo | Descrição |
|---|---|
| **Coletadas** | carregadas pelo personagem; perdidas ao morrer (RAW) / ao morrer sem recuperar marca de sangue [HR] |
| **Bancadas** | guardadas em fogueira; **nunca se perdem**, nem na morte; não voltam a ser coletadas |
| **Gastas** | usadas em level up (só em fogueira) e compras |

Ao matar inimigo: cada personagem recebe **parcela igual** das almas. Level up: **exclusivo em fogueira**.

**Tabela de progressão** (EN p.91) — almas acumuladas para atingir o nível:

| Nível | Almas | Nível | Almas |
|---|---|---|---|
| 1 | 0 | 11 | 85.000 |
| 2 | 300 | 12 | 100.000 |
| 3 | 900 | 13 | 120.000 |
| 4 | 2.700 | 14 | 140.000 |
| 5 | 6.500 | 15 | 165.000 |
| 6 | 14.000 | 16 | 195.000 |
| 7 | 23.000 | 17 | 225.000 |
| 8 | 34.000 | 18 | 265.000 |
| 9 | 48.000 | 19 | 305.000 |
| 10 | 64.000 | 20 | 355.000 |

### Itens com regra modificada ou em uso ativo

| Item | Tipo / Dano | Especial | Custo |
|---|---|---|---|
| **Estoque** | Espada Empurrando · 1d8 perfurante · Delicadeza | Gastar 1 Position → +1d3 de dano no próximo ataque | 500 almas |
| **Escudo Alvo** | Escudo Pequeno · +1 CA | Ao sofrer dano pela 1ª vez no combate, gastar 2 Position para reação de defesa | 200 almas |
| **Armadura Assassina** | CA 12 + mod DEX | Com vantagem em ataque à distância/furtividade: +1d6 de dano no acerto | 850 almas |

### Carregar, empurrar, arrastar (EN p.150)

Regra base do livro aplicada. O GM usa bom senso ou pede rolagem quando o objeto for excepcionalmente pesado ou a situação for ambígua.

### Parry (EN p.122)

**RAW em uso:** gasta a reação → ganho de **+2 CA** contra um ataque corpo a corpo que acertaria você.

> **[HR] pendente:** a mesa discutiu versão "alto risco / alta recompensa" mas não foi definida. Em uso até segunda ordem: RAW.

---

## 6. Magia

### Estrutura geral (EN p.129)

Três escolas temáticas, mecanicamente **idênticas** no sistema:

| Escola | Temática | Classe primária | Atributo |
|---|---|---|---|
| **Sorceries** (Feitiçarias) | arcana, intelectual | Sorcerer | Inteligência |
| **Pyromancies** (Piromâncias) | fogo, caos | Pyromancer | Carisma |
| **Miracles** (Milagres) | divino, fé | Cleric, Herald | Sabedoria |

### Attunement Slots (EN p.130)

Cada classe mágica possui um número de **Attunement Slots** (definido na tabela de progressão da classe). Cada spell tem um valor de attunement — quantos slots ocupa. Para equipar uma spell, você precisa ter slots livres suficientes.

Spells só podem ser equipadas ou desequipadas durante um **Long Rest em fogueira**.

### Spell Level e pré-requisito de nível (EN p.130)

Cada spell tem um nível mínimo. Um Pyromancer de nível 5 pode usar spells de nível ≤ 5; não pode usar spells de nível 6+.

### Casts (EN p.130)

Cada spell tem um número de **Casts** — quantas vezes pode ser usada por Long Rest. Cada uso desconta 1. Ao chegar a 0, indisponível até o próximo Long Rest em fogueira.

Atingir 0 de Casts **não libera** os attunement slots para outra spell.

### Custo em Position em combate (EN p.131)

Algumas spells têm um **Position cost** anotado na descrição. Esse custo só se aplica **em combate**. Fora de combate, o Cast é consumido normalmente mas sem gasto de Position.

### Adquirir spells (EN p.130)

Spells são encontradas no ambiente, ganhas em combate ou compradas de mercadores. Preço por nível de spell:

| Nível | Almas | Nível | Almas |
|---|---|---|---|
| 1 | 250 | 6 | 5.000 |
| 2 | 500 | 7 | 7.000 |
| 3 | 1.000 | 8 | 10.000 |
| 4 | 2.000 | 9 | 13.000 |
| 5 | 4.000 | 10 | 16.000 |

Níveis 11–20: 20.000 a 50.000 almas (ver tabela completa EN p.130).

---

## 7. Houserules — Resumo

Lista de todas as houserules da mesa para revisão rápida. Links apontam para a seção detalhada.

- **[HR] Ataque não-visto fora de combate:** ataque com alvo sem noção da presença do atacante (antes do combate iniciar) = crítico automático. Flanqueamento em combate = vantagem (RAW). → [§ Flanqueamento e Ataques não-vistos](#flanqueamento-e-ataques-não-vistos)
- **[HR] Morte — sem Hollowing:** mesa não usa a tabela de Hollowing nem o save WIS DC 18 ao respawnar. → [§ Morte · HR](#hr-regra-da-mesa-sessão-0)
- **[HR] Morte — contador individual:** 3 mortes consecutivas sem recuperar a alma = permadeath. → [§ Morte · HR](#hr-regra-da-mesa-sessão-0)
- **[HR] Morte — boss reset:** a ser avaliado pelo GM por combate; RAW é o boss recuperar Position. → [§ Morte · HR](#hr-regra-da-mesa-sessão-0)
- **[HR] Morte — sem falha de grupo:** mesa ignora a regra "mais de metade morto = falha". → [§ Morte · HR](#hr-regra-da-mesa-sessão-0)
- **[HR] Morte — TPK:** conta 1 morte para todos, almas perdidas sem marca, contador vai para 1. → [§ Morte · HR](#hr-regra-da-mesa-sessão-0)
- **[HR] Parry — versão avançada:** pendente de definição. Em uso: RAW (+2 CA como reação). → [§ Parry](#parry-en-p122)
