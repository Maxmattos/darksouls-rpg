# MECÂNICAS — Dark Souls RPG
### Versão reconciliada com a Sessão 0

Esta página consolida as regras caseiras combinadas na **Sessão 0** com as regras-base do livro. **Onde houver conflito, vale o que está escrito aqui.**

> **O que mudou em relação à versão antiga:**
> 1. A regra de **Morte** foi expandida para a versão detalhada da Sessão 0 (contador individual, reset de chefe pela névoa, vitória do grupo, TPK).
> 2. O exemplo de **Position** foi corrigido: no nível 1 rola-se **1 dado de origem** (ex.: 1d10), não 2d10. O número de dados = seu nível.

---

## Position (a "vida" do sistema)

**Position Base** = Modificador de Constituição + maior valor do dado de Position da Origem + Nível atual.

> Exemplo: Cavaleiro com CON 15 (+2) e Origem Bruta (Position 1d10) no 1º nível → 2 + 10 + 1 = **13** de Position Base.

**A cada nível após o 1º:** Position Base atual + Modificador de Constituição.

> Exemplo: ao chegar ao 2º nível, o mesmo Cavaleiro soma +2 → Position Base **15**.

**Em combate (Position temporária):** ao entrar em combate, você rola um número de dados de Position igual ao **seu nível** (do tipo de dado da sua Origem) e soma à sua Position atual para aquele conflito.

> Exemplo (nível 1, origem 1d10): rola **1d10**, tira 7 → Position 13 + 7 = **20** para a luta.
> Exemplo (nível 2, origem 1d10): rola **2d10**.

**Gastar Position:**
- Aumente o resultado de um dado em **+1 por Position** gasta.
- Aumente o dano de um ataque corpo a corpo ou à distância em **no mínimo 5** (pode gastar mais, mas o mínimo é sempre 5), salvo habilidade especial de arma.
- Aumente o movimento: **+1,5 m por Position** gasta (máximo = seu valor de Velocidade Base).

**Restrições:**
- Só pode gastar Position **consigo mesmo**.
- Só pode gastar Position **uma vez por turno**.
- **Não** pode ativar efeitos críticos gastando Position.

**Recálculo de Constituição:** se a CON base mudar (para mais ou para menos), recalcule a Position desde o 1º nível como se sempre tivesse sido aquele valor.

---

## Iniciativa (Fast / Slow)

Cada criatura tem uma **DC de Iniciativa**. Você rola d20 + modificador:
- Resultado **igual ou acima** da DC → você age **antes** dela (Fast).
- Resultado **abaixo** → você age **depois** dela (Slow).

Entre os próprios jogadores, a ordem é **livre** (combinem combos).

---

## Descanso

| Tipo | Efeito |
|---|---|
| **Curto** | Recupera **metade** da Position. |
| **Longo** | Só em uma **fogueira**; recupera Position total e habilidades. |

> **Atenção:** descansar em fogueira **ressuscita os inimigos comuns** da área nas posições originais (clássico Dark Souls). Chefes derrotados **não** voltam.

---

## Almas

**Tipos de alma:**
- **Coletadas:** as que você carrega. **Podem ser perdidas** ao morrer (ver regra de Morte).
- **Armazenadas (bancadas na fogueira):** **nunca** se perdem na morte. Uma vez bancadas, não voltam a ser "coletadas" — ficam seguras. É a válvula de escape estratégica.
- **Gastas:** usadas para subir de nível e comprar equipamento.

**Ganho:** almas valem como XP, com base no Challenge Rating do inimigo, e são **divididas igualmente** entre os membros do grupo.

**Tabela de almas por nível** (almas acumuladas para *atingir* o nível):

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

---

## Morte (regra caseira — versão detalhada da Sessão 0)

**Contador individual** por personagem. Limite de **3 mortes consecutivas** sem recuperar.

**Ao morrer (Position chega a 0):**
- O personagem renasce na **última fogueira** em que descansou.
- Larga **todas as almas coletadas** no local da morte: uma **marca de sangue**.

**O contador:**
- **Recuperar a marca de sangue** (gastando uma ação no local) → contador volta a **0** e você recupera as almas.
- **Morrer de novo antes de recuperar** a marca → o lote anterior se perde **para sempre**, e o contador sobe (+1).
- **3 mortes consecutivas** sem recuperar = **morte definitiva**: o personagem é perdido para o abismo espiritual (permadeath).

**Chefes e a névoa:**
- **Reentrar na névoa** do chefe enquanto a batalha continua → o chefe **reseta** ao estado inicial (Position cheia, fase 1). Pode apagar todo o progresso do grupo. Avise antes.
- Se o grupo **vence** o chefe enquanto você está morto → a névoa cai e você recupera sua marca de sangue **em segurança**, sem reset.

**TPK (todos caem):** conta uma morte para todos; todos perdem o lote (irrecuperável) e o contador de todos vai para **2**.

> **Observação:** *não* usamos a regra do livro de "metade do grupo morto = falha". Tudo é individual.

---

## Parry (provisório — ainda não fechado)

Por enquanto, usamos a versão **RAW segura**: gastar a sua reação para ganhar **+2 de AC** contra um ataque corpo a corpo.

> Itens relevantes: **Escudo Alvo** — gastar 2 Position para uma reação defensiva.

**A definir depois:** a versão caseira "8 ou 80" (alto risco / alta recompensa).

---

## Equipamento inicial (exemplos)

| Item | Tipo / AC / Dano | Especial | Custo |
|---|---|---|---|
| **Estoque** | Espada Empurrando · 1d8 perfurante · Delicadeza | Gastar 1 Position → +1d3 de dano no próximo ataque | 500 almas |
| **Escudo Alvo** | Escudo Pequeno · +1 AC | Ao sofrer dano pela 1ª vez num combate, gastar 2 Position para uma reação de defesa | 200 almas |
| **Armadura Assassina** | AC 12 + mod de Destreza | Com vantagem em ataque à distância/furtividade, +1d6 de dano num acerto (aplica sempre que usar ataque furtivo/mira mortal) | 850 almas |
