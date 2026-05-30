/* Funções puras: recebem estado, devolvem novo estado. */

export function attrMod(val) {
  return Math.floor((val - 10) / 2);
}

export function estusMax(nivel) {
  if (nivel <= 4)  return 3;
  if (nivel <= 9)  return 4;
  if (nivel <= 16) return 5;
  return 6;
}

export function isBloodied(pc, combate) {
  if (!combate.ativo) return false;
  const pool = combate.pool_inicial_combate[pc.id];
  if (pool == null) return false;
  // "starting Position pool" RAW (EN p.124) = base + pool temporária
  const startingPool = pc.base_position + pool;
  return pc.position_atual <= startingPool * 0.5;
}

export function bloodiedEfeitos(pc, origens) {
  const entrada = origens[pc.origem];
  if (!entrada) return { atributosDelta: {}, acDelta: 0, textos: [] };
  const atributosDelta = {};
  let acDelta = 0;
  const textos = [];
  for (const ef of entrada.efeitos) {
    if (ef.tipo === 'atributo') atributosDelta[ef.alvo] = (atributosDelta[ef.alvo] || 0) + ef.delta;
    else if (ef.tipo === 'ac')   acDelta += ef.delta;
    else if (ef.tipo === 'texto') textos.push(ef.descricao);
  }
  return { atributosDelta, acDelta, textos };
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function pcById(state, id) {
  return state.pcs.find(p => p.id === id);
}

function inimigoById(state, id) {
  return state.inimigos.find(e => e.id === id);
}

/* ---- Ações de PC ---- */

function markDeath(state, { pcId }) {
  const s = deepClone(state);
  const pc = pcById(s, pcId);
  if (!pc || pc.mortes >= 3) return s;
  pc.mortes += 1;
  pc.almas_marca_de_sangue = pc.almas_coletadas;
  pc.almas_coletadas = 0;
  pc.marca_de_sangue_ativa = true;
  pc.status = 'morto_aguardando_respawn';
  pc.position_atual = pc.base_position;
  return s;
}

function recoverMark(state, { pcId }) {
  const s = deepClone(state);
  const pc = pcById(s, pcId);
  if (!pc || !pc.marca_de_sangue_ativa) return s;
  pc.mortes = 0;
  pc.almas_coletadas += pc.almas_marca_de_sangue;
  pc.almas_marca_de_sangue = 0;
  pc.marca_de_sangue_ativa = false;
  return s;
}

function returnToCombat(state, { pcId, poolTemporario }) {
  const s = deepClone(state);
  const pc = pcById(s, pcId);
  if (!pc) return s;
  pc.status = 'vivo';
  if (s.combate.ativo && poolTemporario > 0) {
    s.combate.pool_inicial_combate[pcId] = poolTemporario;
    pc.position_atual += poolTemporario;
  }
  return s;
}

function drinkEstus(state, { pcId }) {
  const s = deepClone(state);
  const pc = pcById(s, pcId);
  if (!pc || pc.estus_atual <= 0) return s;
  pc.estus_atual -= 1;
  const cura = Math.floor(pc.base_position / 2);
  const teto = s.combate.ativo
    ? pc.base_position + (s.combate.pool_inicial_combate[pcId] || 0)
    : pc.base_position;
  pc.position_atual = Math.min(teto, pc.position_atual + cura);
  return s;
}

/* ---- Ações de campo PC ---- */

function setPcField(state, { pcId, field, value }) {
  const s = deepClone(state);
  const pc = pcById(s, pcId);
  if (!pc) return s;
  pc[field] = value;
  return s;
}

/* ---- Combate ---- */

function initCombat(state, { pools }) {
  // pools: { [pcId]: number }
  const s = deepClone(state);
  s.combate.ativo = true;
  s.combate.pool_inicial_combate = {};
  for (const pc of s.pcs) {
    if (pc.status !== 'vivo') continue;
    const pool = pools[pc.id] || 0;
    s.combate.pool_inicial_combate[pc.id] = pool;
    pc.position_atual += pool;
  }
  return s;
}

function endCombat(state) {
  const s = deepClone(state);
  for (const pc of s.pcs) {
    if (pc.status !== 'vivo') continue;
    const pool = s.combate.pool_inicial_combate[pc.id] || 0;
    const startingPool = pc.base_position + pool;
    const poolUsado = Math.max(0, startingPool - pc.position_atual);
    const poolNaoUsado = Math.max(0, pool - poolUsado);
    pc.position_atual = Math.max(0, pc.position_atual - poolNaoUsado);
  }
  s.combate.ativo = false;
  s.combate.pool_inicial_combate = {};
  return s;
}

/* ---- Inimigos ---- */

function setInimigoField(state, { inimigoId, field, value }) {
  const s = deepClone(state);
  const e = inimigoById(s, inimigoId);
  if (!e) return s;
  e[field] = value;
  return s;
}

function advanceFase(state, { inimigoId }) {
  const s = deepClone(state);
  const e = inimigoById(s, inimigoId);
  if (!e || e.fase_atual == null) return s;
  e.fase_atual += 1;
  return s;
}

function retreatFase(state, { inimigoId }) {
  const s = deepClone(state);
  const e = inimigoById(s, inimigoId);
  if (!e || e.fase_atual == null || e.fase_atual <= 1) return s;
  e.fase_atual -= 1;
  return s;
}

function addInimigo(state, { bestiarioRef, nome, bestiario }) {
  const s = deepClone(state);
  const base = bestiario[bestiarioRef];
  const id = bestiarioRef + '_' + Date.now();
  const temFases = base && base.fases && base.fases.length > 0;
  s.inimigos.push({
    id,
    bestiario_ref: bestiarioRef,
    nome_exibicao: nome || (base ? base.nome : bestiarioRef),
    arma_equipada: base && base.armas_disponiveis ? base.armas_disponiveis[0].nome : null,
    position_atual: base ? base.position_max : 10,
    position_max: base ? base.position_max : 10,
    fase_atual: temFases ? 1 : null,
    nota: ''
  });
  return s;
}

function removeInimigo(state, { inimigoId }) {
  const s = deepClone(state);
  s.inimigos = s.inimigos.filter(e => e.id !== inimigoId);
  return s;
}

function checkPhaseAdvance(state, { inimigoId, bestiario }) {
  const s = deepClone(state);
  const e = inimigoById(s, inimigoId);
  if (!e || e.fase_atual == null) return s;
  const base = bestiario[e.bestiario_ref];
  if (!base || !base.fases) return s;
  const bloodied_em = base.bloodied_em;
  if (bloodied_em == null) return s;
  // auto-advance to next phase when crossing bloodied threshold (não regride)
  const maxFase = base.fases.length;
  if (e.position_atual <= bloodied_em && e.fase_atual < maxFase) {
    e.fase_atual = maxFase;
  }
  return s;
}

function loadFullState(state, { newState }) {
  return deepClone(newState);
}

/* ---- Router ---- */

export function aplicarAcao(state, action, payload) {
  switch (action) {
    case 'MARK_DEATH':          return markDeath(state, payload);
    case 'RECOVER_MARK':        return recoverMark(state, payload);
    case 'RETURN_TO_COMBAT':    return returnToCombat(state, payload);
    case 'DRINK_ESTUS':         return drinkEstus(state, payload);
    case 'SET_PC_FIELD':        return setPcField(state, payload);
    case 'INIT_COMBAT':         return initCombat(state, payload);
    case 'END_COMBAT':          return endCombat(state);
    case 'SET_INIMIGO_FIELD':   return setInimigoField(state, payload);
    case 'ADVANCE_FASE':        return advanceFase(state, payload);
    case 'RETREAT_FASE':        return retreatFase(state, payload);
    case 'ADD_INIMIGO':         return addInimigo(state, payload);
    case 'REMOVE_INIMIGO':      return removeInimigo(state, payload);
    case 'CHECK_PHASE_ADVANCE': return checkPhaseAdvance(state, payload);
    case 'LOAD_STATE':          return loadFullState(state, payload);
    default: return state;
  }
}
