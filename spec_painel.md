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
      "nome": "string",
      "position_max": "int",
      "position_atual": "int",
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
      "id": "asylum_demon",
      "nome": "Asylum Demon",
      "position_max": 60,
      "position_atual": 60,
      "nota": "Fase 2 (Bloodied ≤30): multiataque. Resistência a Magia."
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

### Seção de inimigos

| Campo | Modo |
|---|---|
| Nome | editável |
| Position atual / máxima | dois campos editáveis; exibidos como `atual / max` |
| Nota | texto livre editável |

Ação global: **+ Adicionar inimigo** (cria entrada com valores zerados).
Ação por inimigo: **Remover** (com confirmação).

*Position máxima dos inimigos é visível somente na vista mestre.*

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

### Responsividade

- **1080p**: 4 cards em linha ou 2×2
- **1440p / 4K**: escala proporcional com unidades `vw`/`vh` nos valores principais

---

## 6. Persistência

| Operação | Comportamento |
|---|---|
| Auto-save | Cada mudança de estado serializa JSON em `localStorage["rpg_ds_state"]` |
| Auto-resume | Ao abrir `?view=master`: lê `localStorage["rpg_ds_state"]`; se presente, carrega sem fricção |
| Estado ausente | Inicia com os 4 PCs da campanha pré-populados (stats no schema de exemplo §3), inimigos vazio, combate inativo |
| Exportar JSON | Botão sempre visível; download de blob com nome `rpg_ds_YYYY-MM-DD.json` |
| Carregar JSON | Botão na vista mestre; abre input de arquivo; sobrescreve estado atual com confirmação |

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
- Spell tracking individual por PC
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
