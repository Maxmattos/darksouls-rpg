import { loadBestiario, loadBloodiedOrigens, loadItens, initChannel, subscribe, publish, exportJSON, bindImport } from './io.js';
import { defaultState, loadState, saveState, setState, getState, dispatch, setOnChange, normalizeState } from './estado.js';
import { renderMaster, renderPlayers } from './render.js';

let bestiario = {};
let origens = {};
let itens = {};
let _view = 'master';

/* Determine view from URL */
function detectView() {
  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'players' ? 'players' : 'master';
}

function showView(view) {
  document.getElementById('view-master').hidden = (view !== 'master');
  document.getElementById('view-players').hidden = (view !== 'players');
}

function render(state) {
  if (_view === 'master') renderMaster(state, bestiario, origens, itens);
  else renderPlayers(state, origens, itens);
}

/* ========================================================
   LISTENERS — Vista Mestre
   ======================================================== */

function bindMasterListeners() {

  /* Delegação de eventos nos cards de PC */
  document.getElementById('pcs-grid').addEventListener('change', (e) => {
    const input = e.target;
    if (input.dataset.action === 'set-slot') {
      dispatch('SET_EQUIP_SLOT', { pcId: input.dataset.pc, slot: input.dataset.slot, itemId: input.value || null });
      return;
    }
    const pcId = input.dataset.pc;
    const field = input.dataset.field;
    if (!pcId || !field) return;
    const val = parseInt(input.value, 10);
    if (isNaN(val)) return;
    dispatch('SET_PC_FIELD', { pcId, field, value: val });
  });

  document.getElementById('pcs-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const pcId = btn.dataset.pc;

    if (action === 'mark-death') dispatch('MARK_DEATH', { pcId });
    else if (action === 'recover-mark') dispatch('RECOVER_MARK', { pcId });
    else if (action === 'drink-estus') dispatch('DRINK_ESTUS', { pcId });
    else if (action === 'return-combat') openRejoinModal(pcId);
  });

  /* Delegação — inimigos */
  document.getElementById('inimigos-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.inimigo;

    if (action === 'advance-fase') dispatch('ADVANCE_FASE', { inimigoId: id });
    else if (action === 'retreat-fase') dispatch('RETREAT_FASE', { inimigoId: id });
    else if (action === 'remove-inimigo') handleRemoveInimigo(id, btn.dataset.direct === 'true');
    else if (action === 'mostrar-narrativa') showNarrativa(id);
    else if (btn.dataset.toggle) toggleInimigoCard(btn.dataset.toggle);
  });

  document.getElementById('inimigos-list').addEventListener('change', (e) => {
    const el = e.target;
    const action = el.dataset.action;
    const id = el.dataset.inimigo;
    if (!action || !id) return;

    if (action === 'set-position-inimigo') {
      const val = parseInt(el.value, 10);
      if (!isNaN(val)) {
        dispatch('SET_INIMIGO_FIELD', { inimigoId: id, field: el.dataset.field, value: val });
        dispatch('CHECK_PHASE_ADVANCE', { inimigoId: id, bestiario });
      }
    } else if (action === 'set-arma') {
      dispatch('SET_INIMIGO_FIELD', { inimigoId: id, field: 'arma_equipada', value: el.value });
    }
  });

  /* Input de texto do nome — debounced para não re-renderizar a cada tecla */
  document.getElementById('inimigos-list').addEventListener('input', (e) => {
    const el = e.target;
    const action = el.dataset.action;
    const id = el.dataset.inimigo;
    if (!action || !id) return;

    clearTimeout(el._debounce);
    el._debounce = setTimeout(() => {
      if (action === 'set-nome-inimigo') {
        dispatch('SET_INIMIGO_FIELD', { inimigoId: id, field: 'nome_exibicao', value: el.value });
      }
    }, 400);
  });

  /* Combate */
  document.getElementById('btn-iniciar-combate').addEventListener('click', openCombateModal);
  document.getElementById('btn-encerrar-combate').addEventListener('click', () => {
    dispatch('END_COMBAT');
  });

  /* Modal combate */
  document.getElementById('modal-combate-confirmar').addEventListener('click', confirmCombateModal);
  document.getElementById('modal-combate-cancelar').addEventListener('click', () => {
    document.getElementById('modal-combate').close();
  });

  /* Modal add inimigo */
  document.getElementById('btn-add-inimigo').addEventListener('click', openAddInimigoModal);
  document.getElementById('modal-add-cancelar').addEventListener('click', () => {
    document.getElementById('modal-add-inimigo').close();
  });

  /* Modal confirmar remoção */
  document.getElementById('modal-confirm-ok').addEventListener('click', () => {
    const id = document.getElementById('modal-confirm-remove').dataset.pendingId;
    if (id) dispatch('REMOVE_INIMIGO', { inimigoId: id });
    document.getElementById('modal-confirm-remove').close();
  });
  document.getElementById('modal-confirm-cancelar').addEventListener('click', () => {
    document.getElementById('modal-confirm-remove').close();
  });

  /* Modal rejoin */
  document.getElementById('modal-rejoin-confirmar').addEventListener('click', confirmRejoin);
  document.getElementById('modal-rejoin-cancelar').addEventListener('click', () => {
    document.getElementById('modal-rejoin').close();
  });

  /* Export */
  document.getElementById('btn-export').addEventListener('click', () => {
    exportJSON(getState());
  });

  /* Import — listener ligado uma vez; o <label> abre o seletor nativamente */
  bindImport((newState) => openConfirmLoad(newState));

  /* Reset de sessão */
  document.getElementById('btn-reset').addEventListener('click', resetSession);

  /* Modal confirm load */
  document.getElementById('modal-load-cancelar').addEventListener('click', () => {
    document.getElementById('modal-confirm-load').close();
  });
}

/* ---- Modal: Iniciar combate ---- */

function openCombateModal() {
  const state = getState();
  const pcsVivos = state.pcs.filter(p => p.status === 'vivo');
  const container = document.getElementById('modal-combate-inputs');
  container.innerHTML = pcsVivos.map(pc => `
    <div class="modal-combate-field">
      <span class="modal-combate-label">${pc.nome}</span>
      <input type="number" id="pool-${pc.id}" min="0" value="0" style="width:70px">
    </div>
  `).join('');
  document.getElementById('modal-combate').showModal();
}

function confirmCombateModal() {
  const state = getState();
  const pcsVivos = state.pcs.filter(p => p.status === 'vivo');
  const pools = {};
  for (const pc of pcsVivos) {
    const val = parseInt(document.getElementById(`pool-${pc.id}`)?.value ?? '0', 10);
    pools[pc.id] = isNaN(val) ? 0 : val;
  }
  dispatch('INIT_COMBAT', { pools });
  document.getElementById('modal-combate').close();
}

/* ---- Modal: Adicionar inimigo ---- */

function openAddInimigoModal() {
  const lista = document.getElementById('modal-add-lista');
  lista.innerHTML = Object.entries(bestiario).map(([key, val]) => `
    <div class="bestario-item" data-ref="${key}">
      <span class="bestario-item-nome">${val.nome}</span>
      <span class="bestario-item-tipo">${val.tipo || ''}</span>
    </div>
  `).join('') || '<p>Bestiário não carregado.</p>';

  lista.querySelectorAll('.bestario-item').forEach(item => {
    item.addEventListener('click', () => {
      dispatch('ADD_INIMIGO', { bestiarioRef: item.dataset.ref, bestiario });
      document.getElementById('modal-add-inimigo').close();
    });
  });

  document.getElementById('modal-add-inimigo').showModal();
}

/* ---- Remover inimigo ---- */

function handleRemoveInimigo(id, direct) {
  if (direct) {
    dispatch('REMOVE_INIMIGO', { inimigoId: id });
    return;
  }
  const state = getState();
  const inimigo = state.inimigos.find(e => e.id === id);
  const modal = document.getElementById('modal-confirm-remove');
  modal.dataset.pendingId = id;
  document.getElementById('modal-confirm-msg').textContent =
    `Remover "${inimigo?.nome_exibicao ?? id}"? Esta ação não pode ser desfeita.`;
  modal.showModal();
}

/* ---- Expandir/colapsar card de inimigo ---- */

function toggleInimigoCard(inimigoId) {
  const card = document.querySelector(`[data-inimigo-id="${inimigoId}"]`);
  if (!card) return;
  const body = card.querySelector('.card-inimigo-body');
  if (!body) return;
  const collapsed = body.classList.toggle('collapsed');
  card._collapsed = collapsed;
  const btn = card.querySelector(`[data-toggle="${inimigoId}"]`);
  if (btn) btn.textContent = collapsed ? '▶' : '▼';
}

/* ---- Narrativa overlay ---- */

function showNarrativa(inimigoId) {
  const state = getState();
  const inimigo = state.inimigos.find(e => e.id === inimigoId);
  if (!inimigo) return;
  const base = bestiario[inimigo.bestiario_ref];
  if (!base?.narrativa) return;

  const overlay = document.createElement('div');
  overlay.className = 'narrativa-overlay';
  overlay.innerHTML = `
    <div class="narrativa-box">
      <button id="btn-close-narrativa" aria-label="Fechar">✕</button>
      <p>${base.narrativa}</p>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#btn-close-narrativa').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

/* ---- Rejoin modal ---- */

function openRejoinModal(pcId) {
  const state = getState();
  const pc = state.pcs.find(p => p.id === pcId);
  if (!pc) return;
  const modal = document.getElementById('modal-rejoin');
  modal.dataset.pendingPc = pcId;
  document.getElementById('modal-rejoin-title').textContent = `Retornar ao combate — ${pc.nome}`;
  document.getElementById('modal-rejoin-msg').textContent =
    state.combate.ativo
      ? 'Combate ativo. Digite o pool temporário rolado.'
      : 'Fora de combate. Nenhum pool temporário será atribuído.';
  document.getElementById('modal-rejoin-input-wrap').hidden = !state.combate.ativo;
  document.getElementById('modal-rejoin-pool').value = 0;
  modal.showModal();
}

function confirmRejoin() {
  const modal = document.getElementById('modal-rejoin');
  const pcId = modal.dataset.pendingPc;
  const pool = parseInt(document.getElementById('modal-rejoin-pool').value ?? '0', 10) || 0;
  dispatch('RETURN_TO_COMBAT', { pcId, poolTemporario: pool });
  modal.close();
}

/* ---- Confirm load ---- */

let _pendingLoadState = null;

function openConfirmLoad(newState) {
  _pendingLoadState = newState;
  document.getElementById('modal-confirm-load').showModal();
}

function bindLoadConfirm() {
  document.getElementById('modal-load-ok').addEventListener('click', () => {
    if (_pendingLoadState) {
      // Mesma normalização do localStorage: JSONs antigos (sem ac_base/mods/slots) migram.
      dispatch('LOAD_STATE', { newState: normalizeState(_pendingLoadState) });
      _pendingLoadState = null;
    }
    document.getElementById('modal-confirm-load').close();
  });
}

/* ---- Reset de sessão ---- */

function resetSession() {
  if (!confirm('Resetar TODA a sessão para o padrão? Estado atual será perdido — exporte antes se quiser guardar.')) return;
  const fresh = defaultState();
  setState(fresh);
  saveState(fresh);
  publish(fresh);
  render(fresh);
}

/* ---- Vista Jogadores ---- */

function bindPlayersSync() {
  const channelOk = initChannel();
  if (!channelOk) {
    document.getElementById('sync-alert').hidden = false;
    return;
  }
  subscribe((newState) => {
    setState(newState);
    saveState(newState);
    render(newState);
  });
}

/* ========================================================
   INIT
   ======================================================== */

export async function init() {
  _view = detectView();
  showView(_view);

  [bestiario, origens, itens] = await Promise.all([loadBestiario(), loadBloodiedOrigens(), loadItens()]);

  if (!bestiario || Object.keys(bestiario).length === 0) {
    console.warn('Bestiário vazio ou não carregado.');
  }
  if (!origens || Object.keys(origens).length === 0) {
    console.warn('bloodied_origens.json vazio ou não carregado.');
  }

  const saved = loadState();
  const state = saved ?? defaultState();
  setState(state);

  if (_view === 'master') {
    initChannel();
    setOnChange((s) => render(s));
    bindMasterListeners();
    bindLoadConfirm();
    render(state);
    publish(state);
  } else {
    bindPlayersSync();
    render(state);
  }
}

init();
