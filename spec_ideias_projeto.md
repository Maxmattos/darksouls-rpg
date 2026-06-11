# Requisitos e Backlog — Painel do Mestre DS RPG

Rastreia o que foi especificado, o que foi implementado e o que está pendente.
Atualizar conforme o projeto avança.

---

## Estado atual / ponto de retomada

> **ÚLTIMA LEVA (concluída):** saves computados no card de inimigo (6 atributos, proficientes
> em dourado); slots ativos do PC migrados para `mao_esq / mao_dir / armor / anel_esq /
> anel_dir`; normalização de estado migrando localStorage antigo; fix do `ATTR_ORDER`
> duplicado. Validado: tela volta a renderizar; saves aprovados.
>
> **VALIDAÇÃO VISUAL PENDENTE (fazer antes da próxima leva):** alinhamento vertical dos
> saves (atributo sobre save na mesma coluna) e labels dos slots (MÃO ESQ/DIR · ANEL
> ESQ/DIR) nas duas telas — não conferido porque a tela havia quebrado logo após.
>
> **PRÓXIMA LEVA:** motor de efeitos sobre `itens.json` (Marin como cobaia). Validação ponta
> a ponta: equipar Pyromancer Robes → AC 11→13 (amarelo+seta); + Caduceus Shield → 14;
> desequipar escudo → volta a 13.
>
> **Arquivo pronto, fora do commit até a próxima leva:** `itens.json` (4 itens do Marin
> modelados com `set`/`add`, perfil de arma e special).

---

## Prioridades — repriorização pós Sessão 1 (Undead Asylum)

Retro guiada pelo que atritou na mesa, não pelo backlog teórico. Ordem para a Sessão 2:

**P0 — Sessão 2**

1. **Sistema de itens (épica única)** — banco de itens + equipar nos slots + motor de
   efeitos recalculando atributos (com destaque amarelo/seta) + imagens. Começar pelo Marin.
2. **Persistência de sessão (salvar/carregar)** — pré-requisito do item 1: os itens
   equipados precisam sobreviver entre sessões. Absorve o antigo bug "Carregar JSON".
3. **Card de inimigo: atributos + saves visíveis + hierarquia** — o dado JÁ EXISTE no
   `bestiario.json`. É correção de render, não de schema. Necessário porque o combate
   com o Asylum vem na Sessão 2.
4. **Espaçamento dos cards de PC** — Position/Estus/Almas/Mortes estão coladas.
5. **Responsividade da vista jogadores** — ocupar % alvo de qualquer TV.

**Mudou de forma / adiado**

- Bug "Carregar JSON não responde" → absorvido pela persistência de sessão (P0 item 2).
- Campo de **Nota do inimigo** → **consertar** o bug de foco (mantém o campo). Em uso na
  Sessão 1 "deu mais problema que ajuda"; mesmo assim a anotação rápida é útil, então
  arruma em vez de remover. Causa: a seção re-renderiza e recria o textarea focado.
- **Rastreio de iniciativa** → posterior. Volta junto com o tema "notas/turno".
- **Level up mid-sessão** → mantido no backlog; reavaliar quando o grupo bancar almas
  com Serelyn (fogueira de Majula).

**P2 — sem atrito na mesa, parado até dar sinal**

- Spell tracking por caster (confirmar antes se Marin conjurou na Sessão 1).
- Bestiário — UI rica de seleção (o card atual já entrega; só investir quando falhar).
- Fogueira como entidade.
- Acesso de jogadores por dispositivo próprio (**único gatilho real para um backend**).

**Decisão de stack:** permanecer em **JS + JSON**. Sem banco de dados, sem migração de
linguagem. Justificativa na seção "Decisão: stack" abaixo.

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

### Validado em produção (Sessão 1)

- [x] Setup notebook (mestre) + TV via HDMI (jogadores) — sem falha técnica
- [x] Card de inimigo (Asylum Demon): fases, gatilhos de Position, ações, navegação de fase
- [x] Cards de PC: loop de Souls (Position, Estus, Almas coletadas/bancadas, Mortes 0/3)

---

## Decisão: stack (JS + JSON, sem DB)

Mantida deliberadamente após a Sessão 1.

- **Banco de itens = dado de referência estático**, igual ao `bestiario.json`. Carrega no
  boot via `fetch`, sem escrita em runtime. JSON é a ferramenta certa.
- **Salvar sessão = serializar o estado**: `JSON.stringify(estado)` → download; `JSON.parse`
  no import; localStorage para persistência local. Não exige banco.
- **Backend só se justifica para "acesso por dispositivo próprio"** (celular dos jogadores),
  porque BroadcastChannel não cruza máquinas. Esse é o gatilho para reconsiderar — não o
  banco de itens nem o save de sessão.

---

## P0 — Sistema de itens (épica)

Unifica três entradas que antes eram separadas (efeitos de equipamento, slots de
equipamento, banco de itens). Tudo depende de um item modelado, então é uma épica só.
**Começar por um único PC (Marin) como caso de teste antes de cadastrar todos.**

### 1. Banco de itens — `itens.json` na raiz

Catálogo estático. **Modelar os itens reais do Marin revelou que "+N aditivo" não basta** —
os efeitos se dividem em três naturezas, e só a primeira alimenta o recálculo amarelo/seta:

1. **Efeitos de stat (alimentam o motor):** com `operacao` `add` (soma, ex.: escudo +1 AC,
   anel +1) ou `set` (define a base, ex.: armadura "AC = 12 + mod DES").
2. **Perfil de arma (exibido, não recalcula):** dano, alcance, propriedades. É info de
   referência, não modificador de stat.
3. **Especial (exibido como texto, gasta Position):** ex.: grito de guerra, +1d4 de fogo,
   rerolar save. Não recalcula stat; aparece como habilidade no card.

Schema:

```json
{
  "caduceus_round_shield": {
    "nome": "Caduceus Round Shield",
    "slot": "mao",
    "tipo": "shield",
    "forca_min": 10,
    "imagem": "img/itens/caduceus_round_shield.png",
    "descricao": "Pintado com serpentes gêmeas, símbolo dos que habitavam o pântano.",
    "efeitos": [
      { "alvo": "ac", "operacao": "add", "valor": 1, "tipo": "sempre" }
    ],
    "especial": "1×/descanso longo, gaste 1 Position para rerolar um save de DES falho."
  },
  "pyromancer_robes": {
    "nome": "Pyromancer Robes",
    "slot": "armor",
    "tipo": "armor",
    "forca_min": null,
    "efeitos": [
      { "alvo": "ac", "operacao": "set", "base": 12, "usa_mod": "des", "tipo": "sempre" }
    ],
    "especial": "Reduz qualquer dano de fogo recebido em 5 (mínimo 1)."
  }
}
```

- `slot`: `mao` (arma OU escudo) | `armor` | `ring`
- `tipo`: `weapon` | `shield` | `armor` | `ring` | `catalyst` (catalisador = Flame/Staff/Talisman)
- `forca_min`: requisito de Força (`null` = nenhum). Regra do livro: para **armadura** a
  Força precisa atingir o mínimo antes de qualquer bônus dela valer.
- `efeitos[].operacao`: `add` (soma) ou `set` (define base; usa `base` + opcional `usa_mod`)
- `efeitos[].tipo`: `sempre` ou `condicional`
- `perfil` (armas, opcional): `{ dano, alcance_m, propriedades }`
- `especial`: texto da habilidade que gasta Position (exibido, não calculado)

### 2. Equipar — slots ativos (modelo do livro)

O livro separa **carregar** (15 slots de inventário) de **empunhar/vestir** (5 slots ativos).
O painel modela só os ativos:

- **1 armadura**
- **1 anel mão esquerda** + **1 anel mão direita**
- **1 mão esquerda** (arma OU escudo) + **1 mão direita** (arma OU escudo)

> **DECISÃO ABERTA (bloqueia o cadastro do Marin):** os slots atuais são `SWORD / SHIELD /
> ARMOR / RING1 / RING2`. Isso não acomoda o Marin — a Pyromancer's Flame é um **catalisador**,
> nem espada nem escudo, e não tem onde morar. Duas opções:
> - **(A) Manter SWORD/SHIELD** — mais simples, mas sem lugar pro catalisador e sem dual-wield.
> - **(B) Trocar para MÃO ESQ / MÃO DIR** (cada uma arma-ou-escudo-ou-catalisador) — fiel ao
>   livro, resolve o Marin, permite empunhar 2 quaisquer de {club, flame, escudo}.
> Recomendação: **(B)**. Não bloqueia o teste do recálculo de AC (armadura + escudo já
> funcionam em qualquer modelo), mas é pré-requisito pra representar a mão do Marin.

`pc.equipamento` referenciando o `id` do item por slot. Equipar = modal por slot, filtrado
por `tipo` compatível. **Desequipar = um clique** (limpa o slot e recalcula na hora) — é o
mecanismo que substitui o `toggle` para estados transitórios de mesa ("largou o escudo").

**Regra de mesa (não automatizar agora):** empunhar exige mão livre — 2 mãos só. Trocar o
que está na mão em combate custa a **ação "Usar um Objeto"** (sacar 1 item é grátis 1×/turno;
guardar+sacar = 2ª interação = gasta a ação). O painel reflete o que está equipado; a
legalidade fica a critério do mestre.

### 3. Motor de efeitos — recálculo unificado

Uma única função resolve todos os atributos efetivos. Bloodied passa a ser **só mais uma
fonte de efeito** no mesmo somatório (item + bloodied + futuro buff de magia). Os efeitos
`set` definem a base; os `add` somam por cima:

```
// caso da AC:
base_ac = armaduraEquipada
            ? armadura.base + (armadura.usa_mod ? mod[armadura.usa_mod] : 0)   // efeito "set"
            : 10 + mod_des                                                     // sem armadura
ac_efetiva = base_ac + Σ( efeitos "add" ativos sobre ac )   // escudo +1, anéis, bloodied...
```

Ex. Marin: sem nada AC 11 (10 + DES +1). Com Pyromancer Robes (set 12 + DES) → 13. Com
Caduceus Shield por cima (add +1) → 14. Desequipa o escudo → volta a 13.

Tipos de gatilho que determinam se um efeito está **ativo**:

- `sempre` — ativo enquanto o item está equipado (ex.: escudo +2 AC; anel +1 AC).
- `condicional` — automático por estado (ex.: bônus quando Bloodied; Position ≤ limiar).

**Sem tipo `toggle`.** Estados transitórios de mesa ("largou o escudo", "guardou a arma")
são resolvidos desequipando o item — o recálculo é automático — e reequipando depois.
Isso só funciona se o equipar/desequipar for de **um clique** (ver item 2).

### 4. Render — reaproveitar o destaque que já existe

O destaque amarelo + seta de mudança de atributo **já está implementado** (usado hoje no
Bloodied: 15 → 17). O motor de efeitos alimenta esse MESMO caminho de render. Quando
`efetivo != base`, mostra o valor efetivo em amarelo com seta (↑/↓) e o base de referência.
Vale tanto na vista mestre quanto na vista jogadores.

### 5. EQUIPMENT EFFECTS no card

Lista os efeitos ativos lendo `pc.equipamento` + `itens.json`. Hoje renderiza "—".
Separador visual entre efeitos de item e efeitos de Bloodied.

### 6. Imagens dos itens

Após a lógica funcionar. Imagem nos 5 slots (placeholder quando vazio) e imagem +
descrição na vista jogadores (preenche o espaço hoje vazio da TV).

**Caso de teste:** Marin (Pyromancer · Caster). Validar schema e recálculo com 1 PC antes
de cadastrar os outros três.

---

## P0 — Persistência de sessão (salvar/carregar)

**Status:** o antigo bug "Carregar JSON não responde" entra aqui. Export já funciona;
o import é que está quebrado.

**Hipótese do bug:** handler do `lbl-import` em `main.js` — o `label` envolvendo o
`input[type=file]` pode estar capturando o click errado, ou `e.preventDefault()` no listener.

**Por que é P0 agora:** com itens equipados, o estado deixa de ser "remontável de cabeça".
Sem salvar/carregar, a Sessão 2 começa reconstruindo equipamento, Estus, Almas e Mortes na mão.

**Comportamento:** salvar = snapshot do `estado` em JSON (download + localStorage);
carregar = restaurar de arquivo. Garantir que itens equipados e contadores de morte
voltem íntegros.

---

## P0 — Card de inimigo: atributos/saves + hierarquia

**Achado-chave:** o dado JÁ EXISTE no `bestiario.json`. Toda entrada tem:

- `atributos` como **modificadores prontos** (ex.: Asylum Demon `str:3, dex:2, con:2, int:-1, wis:0, cha:0` — já é o +3, +2 para somar no d20)
- `saves` já com o bônus (ex.: `str:5, con:4, wis:2`)

O `hollow_soldier` também tem ambos. O card só não os desenha — por isso o teste de
"tirar a arma do hollow" travou (era preciso o modificador de FOR/atletismo na mão).
**É correção de render, não de schema.**

**Reorganizar a hierarquia (topo = consulta constante → base = raro):**

1. Header — nome, HP atual/máx, fase + navegação (já existe)
2. **Atributos + saves + AC/Vel/Iniciativa** — bloco destacado, escaneável *(novo render)*
3. Fases (com seus gatilhos de golpe)
4. Ações (dano, efeito, DC)
5. Traços — menores, mais abaixo
6. Resistências / imunidades de dano / imunidades de condição — menor de tudo, na base

**Forma:** "mais quadrado" = stat block compacto, não a tira de texto corrido larga.
Atributos e info de combate fáceis de ler; o raro afunda.

**Refinação (validada na mesa):** a linha de atributos e a de saves respondem perguntas
diferentes e NÃO são redundantes — atributos = testes e disputas (ex.: tirar a arma do
hollow = teste de Força); saves = testes de resistência. A diferença de valor (FOR mod +3
vs. FOR save +5 no Asylum) é o **bônus de proficiência** somado nos saves em que a criatura
é proficiente. Exibir os **6 saves computados** (os não-proficientes = igual ao modificador),
marcando visualmente os proficientes, para o mestre ler sem calcular "se não tem é +0".

---

## P0 — Espaçamento dos cards de PC

Position, Estus, Almas coletadas, Almas bancadas e Mortes estão visualmente coladas.
Passada de CSS (respiro vertical entre linhas). Trivial; vai junto com outros ajustes de card.

---

## P0 — Responsividade da vista jogadores

**Contexto:** a vista mestre roda SEMPRE no notebook (tamanho conhecido). A vista
jogadores roda em TV de tamanho variável (~60–70"), e hoje ocupa só o canto superior
esquerdo — ~70% da tela fica preta.

**Decisão:** manter tudo visível para todos (a sugestão de "painel no canto + cena de
fundo" foi descartada por ora — quando os itens entrarem, todos precisam ver tudo).

**Comportamento:** a vista jogadores deve preencher um % alvo de qualquer viewport.
Abordagens (decidir na implementação): unidades relativas (`vw`/`vh`/`clamp`) e/ou
`scale-to-fit` por JS medindo o viewport. Vista mestre fica com layout fixo de notebook.

**Sequência:** atacar DEPOIS de itens + retrato existirem — assim sabe-se *o que* escalar
(escalar caixas vazias não resolve nada).

---

## Backlog adiado / P2

### Rastreamento de iniciativa / ordem de turno

Hoje gerenciado verbalmente; na Sessão 1 o campo de Nota do inimigo foi improvisado para
anotar a ordem (evidência de necessidade). O campo de Nota será consertado (não removido);
o rastreio de iniciativa próprio vem depois.

**Comportamento (a refinar):** input de iniciativa por criatura (DC + rolagem); ordem
Fast (acima da DC) → Slow (abaixo); botão "Próximo turno".

### Level up mid-sessão

**Contexto:** level up é decisão do jogador (banca almas na fogueira). Reavaliar quando o
grupo bancar com Serelyn em Majula.

**Comportamento (a refinar):** botão "Subiu de nível" por PC → mini-form com `nivel`
(auto) e `con_mod` (editável). Ao confirmar: `base_position += con_mod`; `estus_max`
recalculado; `position_atual` ajustado. Cálculo transparente e reversível.

### Spell tracking por PC caster

**Pendência:** confirmar se Marin conjurou na Sessão 1 antes de priorizar. Fora do painel
na v1 por decisão: (1) o caster já controla os recursos na ficha; (2) preserva tensão —
os outros PCs (vista TV) não antecipam que há spell poderosa disponível.

**Comportamento (a refinar):** seção colapsável no card, só na vista mestre; spells com
`nome`, `casts_atual`, `casts_max`; "Usar cast" / "Recarregar" (reset no Long Rest em
fogueira — Mecanicas.md §3 e §6). **Dependência:** ficha final de Marin.

### Bestiário — UI rica de seleção

O card atual já entrega valor (validado na Sessão 1). Investir só quando falhar.
Comportamento futuro: modal com filtros (CR/tipo/tags), preview do stat block, editor
in-place. Priorizar quando o bestiário tiver 10+ entradas.

### Fogueira como entidade

Long Rest só em fogueira (Mecanicas.md §3). Futuro: campo "Fogueira ativa"; botão
"Descanso Longo" (recarrega Estus, casts, reseta inimigos comuns — chefes não);
"Descanso Curto" (metade da Base Position).

### Drop de itens por inimigo (ideia — Caio, prep Sessão 2)

Combinado com os jogadores: monstros terão drop rate de itens. Quando o mestre preparar
isso, precisa registrar em algum lugar qual item cai e o que ele faz.

**Questão em aberto:** isso é feature do painel (ex.: campo `drops` no `bestiario.json`,
exibido só pro mestre / revelado ao matar) ou pertence só ao planejamento da sessão (doc)?
Há N formas de automatizar — **não é foco agora**. Registrado para não se perder.
Dependência natural: o sistema de itens (`itens.json`) já existir, pra referenciar o item por `id`.

### Acesso de jogadores por dispositivo próprio

Hoje a vista jogadores roda na TV via HDMI. Futuro: cada jogador no celular.
**Bloqueio:** BroadcastChannel só funciona na mesma máquina/browser — exigiria servidor
(WebSocket / local / P2P). **Este é o único item que justificaria sair de JS + JSON.**
