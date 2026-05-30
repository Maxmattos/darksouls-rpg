# Spec — Painel do Mestre

Campanha Dark Souls RPG · homebrew em português
Regras: ver `Mecanicas.md` (fonte da verdade). Este documento não as duplica.

---

## 1. Objetivo e contexto

Ferramenta do mestre para rastrear estado de PCs e inimigos durante a sessão. Roda como arquivo HTML estático no notebook do mestre, sem servidor, sem instalação, via `file://`.

Dois dispositivos físicos simultâneos:
- **Notebook do mestre** — vista completa, edita tudo
- **TV via HDMI** — vista dos jogadores, read-only, legível a ~2–3 m

---

## 2. Arquitetura

### Vistas

Um único arquivo `painel_mestre.html`. Vista selecionada por query string:

| URL | Quem usa | Modo |
|---|---|---|
| `painel_mestre.html?view=master` | Notebook do mestre | Leitura + edição |
| `painel_mestre.html?view=players` | TV via HDMI | Somente leitura |

### Sincronização

BroadcastChannel API (channel: `"rpg_ds"`). A vista mestre publica o estado completo como JSON a cada mudança. A vista jogadores escuta e re-renderiza. Sem polling, sem servidor.

Se BroadcastChannel estiver indisponível (ex.: protocolo não suportado): a vista jogadores exibe alerta de sincronização indisponível e congela no último estado carregado.

### Persistência

Duas camadas complementares:

| Camada | Mecanismo | Quando usar |
|---|---|---|
| Auto-save | `localStorage["rpg_ds_state"]` | Caso comum — protege contra fechamento acidental |
| Snapshot manual | Export/Import de blob JSON | Backup no fim da sessão, migração de máquina, rollback |

**Por que não File System Access API?** FSAPI exige permissão a cada abertura de arquivo e tem suporte inconsistente em `file://`. localStorage + blob download é sem fricção e funciona offline por padrão.

---

## 3. Schema de estado

### Definição

```json
{
  "sessao": {
    "id": "string",
    "nome": "string",
    "data": "YYYY-MM-DD"
  },
  "pcs": [
    {
      "id": "string",
      "nome": "string",
      "classe": "string",
      "origem": "string",
      "nivel": "int",
      "con_mod": "int",
      "atributos": {
        "str": "int",
        "dex": "int",
        "con": "int",
        "int": "int",
        "wis": "int",
        "cha": "int"
      },
      "base_position": "int",
      "position_atual": "int",
      "estus_atual": "int",
      "estus_max": "int",
      "almas_coletadas": "int",
      "almas_marca_de_sangue": "int",
      "almas_bancadas": "int",
      "mortes": "int (0–3)",
      "marca_de_sangue_ativa": "bool",
      "status": "\"vivo\" | \"morto_aguardando_respawn\""
    }
  ],
  "inimigos": [
    {
      "id": "string",
      "bestiario_ref": "string (chave em bestiario.json)",
      "nome_exibicao": "string (default = bestiario[ref].nome; mestre pode customizar)",
      "arma_equipada": "string | null (só pra inimigos com armas_disponiveis)",
      "position_atual": "int",
      "position_max": "int (default = bestiario[ref].position_max; editável)",
      "fase_atual": "int | null (só pra inimigos com fases; default = 1)",
      "nota": "string"
    }
  ],
  "combate": {
    "ativo": "bool",
    "pool_inicial_combate": { "<pc_id>": "int" }
  }
}
```

### Invariantes do schema

- `position_atual` pode ultrapassar `base_position` durante combate (pool temporário somado). Ao encerrar: `position_atual = min(base_position, position_atual)` — ver Mecanicas.md §1 Position.
- `almas_coletadas` vai a zero ao morrer; `almas_marca_de_sangue` recebe o valor salvo; `almas_bancadas` nunca se perde.
- `estus_max` derivado da tabela (Mecanicas.md §3 Estus Flask): níveis 1–4 → 3, 5–9 → 4, 10–16 → 5, 17–20 → 6.
- `pool_inicial_combate` é vazio `{}` quando `combate.ativo == false`. Ao iniciar combate, só PCs com `status == "vivo"` recebem entrada.
- `pool_inicial_combate[pc_id]` é imutável durante o combate — usado para o limiar de Bloodied e para exibição de "Position temporária" nas vistas.
- Bloodied (Mecanicas.md §1): só calculado quando `combate.ativo == true`. Limiar = `pool_inicial_combate[pc_id] × 0.5`. Ativo quando `position_atual ≤ limiar`.
- Inimigo sem `bestiario_ref` correspondente: painel exibe placeholder com alerta — não quebra.
- Inimigo com fases: ao `position_atual` cruzar `bloodied_em` (descendo), `fase_atual` avança automaticamente; ao subir de volta, NÃO regride (decisão narrativa do mestre).
- Stats estáticos (ac, atributos, ações, traços) vêm do bestiário via lookup; estado dinâmico é só o que está no schema acima.
- Atributos base ficam imutáveis no schema. Bônus de Bloodied são calculados em tempo de render, não persistidos. Quando PC entra em Bloodied, valores derivados (modificador, AC efetiva) são recomputados e exibidos com destaque visual.

### Exemplo preenchido — sessão 1, nível 1, combate inativo

```json
{
  "sessao": {
    "id": "s01",
    "nome": "O Silêncio das Grades",
    "data": "2026-06-01"
  },
  "pcs": [
    {
      "id": "marin",
      "nome": "Marin",
      "classe": "Pyromancer",
      "origem": "Caster",
      "nivel": 1,
      "con_mod": 0,
      "atributos": { "str": 10, "dex": 12, "con": 10, "int": 14, "wis": 13, "cha": 15 },
      "base_position": 7,
      "position_atual": 7,
      "estus_atual": 3,
      "estus_max": 3,
      "almas_coletadas": 0,
      "almas_marca_de_sangue": 0,
      "almas_bancadas": 0,
      "mortes": 0,
      "marca_de_sangue_ativa": false,
      "status": "vivo"
    },
    {
      "id": "zarkov",
      "nome": "Zarkov",
      "classe": "Assassin",
      "origem": "Fencer",
      "nivel": 1,
      "con_mod": 2,
      "atributos": { "str": 12, "dex": 15, "con": 14, "int": 13, "wis": 10, "cha": 10 },
      "base_position": 11,
      "position_atual": 11,
      "estus_atual": 3,
      "estus_max": 3,
      "almas_coletadas": 0,
      "almas_marca_de_sangue": 0,
      "almas_bancadas": 0,
      "mortes": 0,
      "marca_de_sangue_ativa": false,
      "status": "vivo"
    },
    {
      "id": "drakar",
      "nome": "Drakar",
      "classe": "Knight",
      "origem": "Brute",
      "nivel": 1,
      "con_mod": 2,
      "atributos": { "str": 15, "dex": 10, "con": 14, "int": 10, "wis": 12, "cha": 13 },
      "base_position": 13,
      "position_atual": 13,
      "estus_atual": 3,
      "estus_max": 3,
      "almas_coletadas": 0,
      "almas_marca_de_sangue": 0,
      "almas_bancadas": 0,
      "mortes": 0,
      "marca_de_sangue_ativa": false,
      "status": "vivo"
    },
    {
      "id": "elvyra",
      "nome": "Elvyra",
      "classe": "The Deprived",
      "origem": "Brute",
      "nivel": 1,
      "con_mod": 2,
      "atributos": { "str": 16, "dex": 10, "con": 14, "int": 10, "wis": 12, "cha": 14 },
      "base_position": 13,
      "position_atual": 13,
      "estus_atual": 3,
      "estus_max": 3,
      "almas_coletadas": 0,
      "almas_marca_de_sangue": 0,
      "almas_bancadas": 0,
      "mortes": 0,
      "marca_de_sangue_ativa": false,
      "status": "vivo"
    }
  ],
  "inimigos": [
    {
      "id": "hs_1",
      "bestiario_ref": "hollow_soldier",
      "nome_exibicao": "Hollow Soldier — Espada",
      "arma_equipada": "Espada Enferrujada",
      "position_atual": 22,
      "position_max": 22,
      "fase_atual": null,
      "nota": ""
    },
    {
      "id": "hs_2",
      "bestiario_ref": "hollow_soldier",
      "nome_exibicao": "Hollow Soldier — Alabarda",
      "arma_equipada": "Alabarda",
      "position_atual": 22,
      "position_max": 22,
      "fase_atual": null,
      "nota": ""
    },
    {
      "id": "hs_3",
      "bestiario_ref": "hollow_soldier",
      "nome_exibicao": "Hollow Soldier — Besta",
      "arma_equipada": "Besta Leve",
      "position_atual": 22,
      "position_max": 22,
      "fase_atual": null,
      "nota": ""
    },
    {
      "id": "asd_1",
      "bestiario_ref": "asylum_demon_tutorial",
      "nome_exibicao": "Asylum Demon",
      "arma_equipada": null,
      "position_atual": 60,
      "position_max": 60,
      "fase_atual": 1,
      "nota": ""
    }
  ],
  "combate": {
    "ativo": false,
    "pool_inicial_combate": {}
  }
}
```

---

## 4. Vista Mestre

### Layout geral

Três seções verticais:
1. **PCs** — 4 cards em linha (ou 2×2)
2. **Inimigos** — lista expandível
3. **Controles de combate** — barra inferior

### Card de PC

| Campo | Modo | Observação |
|---|---|---|
| Nome | exibição | |
| Position atual | editável | pode ultrapassar `base_position` em combate |
| Base Position | editável | máximo de referência; nunca inflado pelo pool |
| Position temporária | exibição, só em combate | `pool_inicial_combate[pc_id]` |
| Estus atual / máx | editável / editável | |
| Almas coletadas | editável | |
| Almas bancadas | editável | |
| Contador de mortes | exibição + ação | botão "Marcar morte" desabilitado se `mortes == 3` |
| Marca de sangue | toggle | ativa/desativa manualmente |
| Status | exibição | `vivo` ou indicador de respawn pendente |
| Badge Bloodied | derivado, só em combate | acende quando `position_atual ≤ pool_inicial_combate[id] × 0.5` |

**Ações por PC:**

| Ação | Efeito |
|---|---|
| Marcar morte | `mortes++`; `almas_marca_de_sangue = almas_coletadas`; `almas_coletadas = 0`; `marca_de_sangue_ativa = true`; `status = "morto_aguardando_respawn"`; `position_atual = base_position` (respawn na fogueira) |
| Recuperar marca | `mortes = 0`; `almas_coletadas += almas_marca_de_sangue`; `almas_marca_de_sangue = 0`; `marca_de_sangue_ativa = false` |
| Retornar ao combate | `status = "vivo"`; se `combate.ativo`, abre entrada de pool temporário para esse PC |
| Beber Estus | `estus_atual--` (mín 0); `position_atual = min(teto, position_atual + floor(base_position / 2))` onde `teto = combate.ativo ? base_position + pool_inicial_combate[id] : base_position` |

### Exibição de atributos no card

Atributos sempre visíveis no card (linha compacta no topo). Quando PC entra em Bloodied:
- Atributos afetados (ex: DEX pro Fencer) exibidos como `15 → 17` em **cor amarela** (`#c9a84c` — dourado da paleta).
- Atributos não afetados permanecem em cor normal.
- AC também exibida; se afetada por Bloodied, mesma transição visual (ex: `12 → 14` amarelo).
- Modificadores recalculados implicitamente; o painel não precisa exibir mod separadamente — exibir só o valor final do atributo basta pro jogador calcular.

**Estado visual do card:**
- Vivo, fora de combate: aparência normal (paleta padrão).
- Vivo, em Bloodied: card com fundo laranja-brasa (`#c94f1e` translúcido). Atributos afetados em amarelo (`15 → 17`). Abaixo do badge, listar os efeitos textuais (`tipo='texto'`) como bullet points.
- Status `morto_aguardando_respawn`: card todo em escala de cinza, com texto sobreposto 'YOU DIED' em vermelho-sangue (`#8b0000`), fonte serifada, grande. Botões de ação do card permanecem acessíveis para o mestre.

### Seção de inimigos

Cada inimigo é renderizado como card expansível. Cabeçalho (sempre visível):

| Campo | Modo |
|---|---|
| Nome exibição | editável |
| Position atual / máx | editável (formato `X / Y`) |
| Fase atual | exibição + ação (botão "Avançar fase" / "Voltar fase") |
| Bloodied badge | derivado, acende quando `position_atual ≤ bloodied_em` |
| Remover | botão com confirmação |

Corpo do card (colapsável, padrão expandido durante combate):

- Atributos e AC (vindos do bestiário)
- Resistências / imunidades (vindos do bestiário)
- Traços (lista do bestiário)
- Ações disponíveis (lista do bestiário, com seletor de arma quando o inimigo tem `armas_disponiveis`)
- Fases (lista do bestiário, com `fase_atual` destacada)
- Nota livre (editável, persistida no estado)
- Botão "Mostrar narrativa" (abre overlay com texto narrativo do bestiário pra ler em voz alta)

Ação global: **+ Adicionar do bestiário** abre modal com lista de bestiário; selecionar instancia um inimigo no estado. (v1 pode ser dropdown simples; UI rica fica pra v2.)

**Estado visual do card:**
- Vivo, fora de Bloodied: aparência normal.
- Vivo, em Bloodied (`position_atual ≤ bloodied_em`): fundo laranja-brasa + descrição da fase atual (`fases[fase_atual].regra`) exibida abaixo do badge.
- `position_atual == 0`: fundo vermelho intenso (`#5a0000`). Card permanece na lista. Remoção é manual — não é automática. Justificativa: criaturas com 'Keeps Crawling On' (Hollow Soldier) podem retornar a 1 Position via CON save; remover automaticamente quebraria a mecânica.
- Botão de remoção rápida (X) no canto superior direito, sempre visível. Comportamento:
  - Inimigo vivo (`position_atual > 0`): X dispara modal de confirmação.
  - Inimigo a 0 Position: X remove direto, sem confirmação.

### Controles de combate

**Iniciar combate** (habilitado somente quando `combate.ativo == false`):
1. Abre modal com um campo numérico por PC com `status == "vivo"`
2. Mestre digita o valor que cada jogador rolou em mesa (dado de origem × nível — ver Mecanicas.md §1 Pool de combate)
3. Ao confirmar: `pool_inicial_combate[id] = valor`; `position_atual += valor`; `combate.ativo = true`

**Encerrar combate** (habilitado somente quando `combate.ativo == true`):
1. Para cada PC: `position_atual = min(base_position, position_atual)` — ver Mecanicas.md §1
2. Limpa `pool_inicial_combate`
3. `combate.ativo = false`

---

## 5. Vista Jogadores

### Campos exibidos por PC

| Campo | Observação |
|---|---|
| Nome | |
| Position atual / base | formato `X / Y` |
| Position temporária | exibida somente quando `combate.ativo == true` |
| Estus atual / máx | |
| Almas coletadas | |
| Almas bancadas | |
| Contador de mortes | ícones ou número |
| Badge Bloodied | visível somente em combate, quando ativo |
| Badge Marca de sangue | quando `marca_de_sangue_ativa == true` |
| Indicador de respawn pendente | quando `status == "morto_aguardando_respawn"` |

**Inimigos:** não exibidos.
**Sem nenhum controle interativo** — zero botões, zero campos editáveis.

### Estética

| Elemento | Valor |
|---|---|
| Fundo | `#0a0a0a` |
| Texto principal | `#e8dcc8` (creme) |
| Acentos críticos (Bloodied, morte) | `#c94f1e` (brasa) |
| Acentos de destaque (almas, títulos) | `#c9a84c` (dourado) |
| Títulos | fonte serifada do sistema |
| Corpo / valores | sans-serif do sistema, tamanho base ≥ 24 px nos valores principais |

Badges de estado (Bloodied, marca de sangue, respawn) devem ser grandes e coloridos — não apenas texto pequeno.

**Estado visual do card:**
- Bloodied: fundo laranja-brasa + atributos afetados em amarelo (mesma formatação da vista mestre) + lista de efeitos textuais abaixo do badge. Jogador vê o benefício e usa ativamente, com destaque pros atributos que mudaram.
- Morto aguardando respawn: card todo em escala de cinza, com texto sobreposto 'YOU DIED' em vermelho-sangue (`#8b0000`), fonte serifada, grande.
- Inimigos não aparecem nesta vista (independente de estado).

### Responsividade

- **1080p**: 4 cards em linha ou 2×2
- **1440p / 4K**: escala proporcional com unidades `vw`/`vh` nos valores principais

---

## 6. Persistência

| Operação | Comportamento |
|---|---|
| Auto-save | Cada mudança de estado serializa JSON em `localStorage["rpg_ds_state"]` |
| Auto-resume | Ao abrir `?view=master`: lê `localStorage["rpg_ds_state"]`; se presente, carrega sem fricção |
| Estado ausente | Inicia com os 4 PCs da campanha pré-populados (stats em §3) e os inimigos da sessão 1 pré-populados (3 Hollow Soldiers + Asylum Demon, refs em bestiario.json), combate inativo |
| Exportar JSON | Botão sempre visível; download de blob com nome `rpg_ds_YYYY-MM-DD.json` |
| Carregar JSON | Botão na vista mestre; abre input de arquivo; sobrescreve estado atual com confirmação |
| Carga do bestiário | Na inicialização, painel faz fetch de `bestiario.json` (mesma pasta). Se falhar, exibe alerta e usa fallback vazio. Bestiário NÃO entra em localStorage — sempre lido do arquivo. |
| Carga de bloodied_origens.json | Inicialização: fetch do JSON da mesma pasta. Falha exibe alerta; cards em Bloodied mostram só fundo laranja sem detalhe de efeitos. |

---

## 7. Edge cases

| Cenário | Comportamento |
|---|---|
| PC morto ao iniciar combate | Excluído do modal de pool temporário; sem entrada em `pool_inicial_combate`; Bloodied não calculado; `status` permanece `morto_aguardando_respawn` |
| PC morre durante combate | "Marcar morte" segue o fluxo normal; `status = "morto_aguardando_respawn"`; ao clicar "Retornar ao combate", mestre digita o pool temporário para esse PC |
| Recuperação de marca mid-combat | `mortes = 0`; `marca_de_sangue_ativa = false`; pool temporário não é atribuído retroativamente — mestre usa "Retornar ao combate" se o PC rejoinar o encontro |
| Recuperar marca fora do local | Painel não valida proximidade física da marca. Premissa: mestre só aciona a ação quando o PC alcançou narrativamente o local de morte. |
| Segunda morte sem recuperar marca | `mortes++`; lote anterior de `almas_marca_de_sangue` sobrescrito e perdido; `almas_marca_de_sangue` recebe o valor de `almas_coletadas` da segunda morte; `almas_coletadas = 0`; `marca_de_sangue_ativa` permanece `true` (nova marca no novo local) |
| `mortes == 3` | Badge visual de permadeath iminente; botão "Marcar morte" desabilitado — permadeath é decisão narrativa do mestre, registrada fora do painel |
| Encerrar combate com position acima da base | `position_atual = min(base_position, position_atual)` — regra do livro (Mecanicas.md §1) |
| Encerrar combate sem ter iniciado | Botão desabilitado; nenhuma ação |
| Recuperar marca sem marca ativa | Botão desabilitado |
| TPK | Mestre marca morte em cada PC individualmente; encerra combate manualmente |
| Bloodied fora de combate | Indicador não exibido — cálculo só ocorre com `combate.ativo == true` |
| BroadcastChannel indisponível | Vista jogadores exibe alerta; congela no último estado carregado |
| Carregar JSON com estado existente | Confirmação antes de sobrescrever |

---

## 8. Não-objetivos

- Fogueira como entidade gerenciável no painel
- Rastreamento de iniciativa / ordem de turno
- Level up automatizado (backlog — ver `spec_ideias_projeto.md`)
- Acesso de jogadores por dispositivo próprio
- Login, autenticação, servidor
- Banco de dados
- Suporte a mais de 4 PCs

---

## 9. Critério de "pronto pra sessão 1"

- [ ] `?view=master` abre e carrega estado do localStorage automaticamente
- [ ] `?view=players` abre e recebe atualizações em tempo real via BroadcastChannel
- [ ] Todos os campos dos 4 PCs são editáveis na vista mestre
- [ ] Iniciar combate abre modal para digitar pools temporários de todos os PCs vivos
- [ ] Encerrar combate reverte `position_atual` para `min(base_position, position_atual)`
- [ ] Bloodied calculado e exibido em ambas as vistas somente durante combate
- [ ] "Marcar morte", "Recuperar marca" e "Retornar ao combate" funcionam conforme o edge case §7
- [ ] Inimigos: campos de nome, position atual/máx e nota editáveis; + Adicionar; Remover com confirmação
- [ ] Position máxima dos inimigos visível somente na vista mestre
- [ ] Exportar JSON funcional (download de blob)
- [ ] Carregar JSON funcional (com confirmação ao sobrescrever)
- [ ] Vista jogadores não exibe inimigos nem controles
- [ ] Estética Dark Souls aplicada na vista jogadores; legível a 2–3 m em 1080p
- [ ] `bestiario.json` é carregado no startup; falha exibe alerta sem quebrar painel
- [ ] Os 4 inimigos da sessão 1 (3 Hollow Soldiers + Asylum Demon) aparecem pré-populados ao abrir o painel pela primeira vez (estado vazio)
- [ ] bloodied_origens.json carrega; cards em Bloodied mostram efeitos da origem
- [ ] Atributos afetados ficam amarelos com transição `15 → 17` visível
- [ ] AC em Bloodied (Brute, Caster, Jack) também mostra transição visual
