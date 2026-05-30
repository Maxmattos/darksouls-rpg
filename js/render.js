import { isBloodied, bloodiedEfeitos } from './logica.js';

const ATTR_LABELS = { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };

/* ---- Utilitários de DOM ---- */

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

/* Atualiza um campo sem destruir foco */
function patchField(el, html) {
  if (el && el.innerHTML !== html) el.innerHTML = html;
}

/* ---- Render de atributos com Bloodied diff ---- */

function renderAttrRow(atributos, atributosDelta, cssPrefix) {
  return Object.entries(ATTR_LABELS).map(([key, label]) => {
    const base = atributos[key] ?? 0;
    const delta = atributosDelta[key] ?? 0;
    let valHtml;
    if (delta !== 0) {
      valHtml = `<span>${base}</span><span class="attr-arrow">→</span><span class="attr-new-val">${base + delta}</span>`;
    } else {
      valHtml = `<span>${base}</span>`;
    }
    return `<div class="${cssPrefix}-item">
      <span class="${cssPrefix}-label">${label}</span>
      <span class="${cssPrefix}-val${delta !== 0 ? ' bloodied-changed' : ''}">${valHtml}</span>
    </div>`;
  }).join('');
}

/* ---- Pips de morte ---- */

function renderPips(mortes, cls) {
  return [0, 1, 2].map(i => `<span class="${cls}${i < mortes ? ' ativo' : ''}"></span>`).join('');
}

/* ========================================================
   VISTA MESTRE
   ======================================================== */

export function renderMaster(state, bestiario, origens) {
  setText('session-nome', state.sessao.nome);
  setText('session-data', state.sessao.data);

  const grid = document.getElementById('pcs-grid');
  if (grid) {
    // Render diff: reutiliza cards existentes por id
    const existingIds = new Set([...grid.children].map(c => c.dataset.pcId));
    const newIds = new Set(state.pcs.map(p => p.id));

    // Remove removidos (raro mas possível em imports)
    for (const child of [...grid.children]) {
      if (!newIds.has(child.dataset.pcId)) child.remove();
    }

    for (const pc of state.pcs) {
      let card = grid.querySelector(`[data-pc-id="${pc.id}"]`);
      if (!card) {
        card = document.createElement('article');
        card.dataset.pcId = pc.id;
        card.className = 'card-pc';
        grid.appendChild(card);
      }
      renderPcCardMaster(card, pc, state, origens);
    }

    // Ordenar filhos conforme state.pcs
    state.pcs.forEach((pc, i) => {
      const card = grid.querySelector(`[data-pc-id="${pc.id}"]`);
      if (card && grid.children[i] !== card) grid.appendChild(card);
    });
  }

  renderInimigos(state, bestiario);
  renderCombatBar(state);
}

function renderPcCardMaster(card, pc, state, origens) {
  const blooded = isBloodied(pc, state.combate);
  const morto = pc.status === 'morto_aguardando_respawn';

  card.className = 'card-pc' + (blooded ? ' bloodied' : '') + (morto ? ' morto' : '');

  const efeitos = blooded ? bloodiedEfeitos(pc, origens) : { atributosDelta: {}, acDelta: 0, textos: [] };
  const acEfetiva = (pc.ac_base ?? 10) + efeitos.acDelta;
  const poolTemp = state.combate.pool_inicial_combate[pc.id] ?? null;

  const attrHtml = renderAttrRow(pc.atributos, efeitos.atributosDelta, 'attr');

  const badgesHtml = [
    blooded ? `<span class="badge badge-bloodied">Bloodied</span>` : '',
    pc.marca_de_sangue_ativa ? `<span class="badge badge-marca">Marca de Sangue</span>` : '',
    pc.mortes >= 3 ? `<span class="badge badge-permadeath">Permadeath iminente</span>` : ''
  ].join('');

  const positionTempHtml = (state.combate.ativo && poolTemp != null)
    ? `<span class="position-temp">(+${poolTemp} temp)</span>`
    : '';

  const bloodiedEfeitosHtml = (blooded && efeitos.textos.length > 0)
    ? `<ul class="bloodied-efeitos">${efeitos.textos.map(t => `<li>${t}</li>`).join('')}</ul>`
    : '';

  const acDisplay = efeitos.acDelta !== 0
    ? `${pc.ac_base} <span class="attr-arrow">→</span> <span class="attr-new-val">${acEfetiva}</span>`
    : `${acEfetiva}`;

  const acHtml = `<span class="stat-label">AC</span><span class="stat-value-display">${acDisplay}</span>`;

  const btnMarcarMorte = pc.mortes >= 3 || morto
    ? `<button class="btn-danger" data-action="mark-death" data-pc="${pc.id}" disabled>Marcar morte</button>`
    : `<button class="btn-danger" data-action="mark-death" data-pc="${pc.id}">Marcar morte</button>`;

  const btnRecuperar = pc.marca_de_sangue_ativa
    ? `<button data-action="recover-mark" data-pc="${pc.id}">Recuperar marca</button>`
    : `<button data-action="recover-mark" data-pc="${pc.id}" disabled>Recuperar marca</button>`;

  const btnRetornar = morto
    ? `<button class="btn-primary" data-action="return-combat" data-pc="${pc.id}">Retornar ao combate</button>`
    : '';

  const btnEstus = `<button data-action="drink-estus" data-pc="${pc.id}"${pc.estus_atual <= 0 ? ' disabled' : ''}>Beber Estus</button>`;

  const youDiedHtml = morto
    ? `<div class="you-died-overlay"><span class="you-died-text">YOU DIED</span></div>`
    : '';

  card.innerHTML = `
    ${youDiedHtml}
    <div class="card-pc-header">
      <div>
        <div class="card-pc-nome">${pc.nome}</div>
        <div class="card-pc-classe">${pc.classe} · ${pc.origem}</div>
      </div>
      <div>${badgesHtml}</div>
    </div>
    <div class="atributos-row">${attrHtml}</div>
    <div class="stat-row">${acHtml}</div>
    <div class="stat-row">
      <span class="stat-label">Position</span>
      <input type="number" class="field-position" data-pc="${pc.id}" data-field="position_atual" value="${pc.position_atual}" min="0" style="width:60px">
      <span class="stat-value-display"> / ${pc.base_position}</span>
      ${positionTempHtml}
    </div>
    <div class="stat-row">
      <span class="stat-label">Base Position</span>
      <input type="number" data-pc="${pc.id}" data-field="base_position" value="${pc.base_position}" min="1" style="width:60px">
    </div>
    <div class="stat-row">
      <span class="stat-label">Estus</span>
      <input type="number" data-pc="${pc.id}" data-field="estus_atual" value="${pc.estus_atual}" min="0" style="width:48px">
      <span>/</span>
      <input type="number" data-pc="${pc.id}" data-field="estus_max" value="${pc.estus_max}" min="0" style="width:48px">
    </div>
    <div class="stat-row">
      <span class="stat-label">Almas coletadas</span>
      <input type="number" data-pc="${pc.id}" data-field="almas_coletadas" value="${pc.almas_coletadas}" min="0" style="width:80px">
    </div>
    <div class="stat-row">
      <span class="stat-label">Almas bancadas</span>
      <input type="number" data-pc="${pc.id}" data-field="almas_bancadas" value="${pc.almas_bancadas}" min="0" style="width:80px">
    </div>
    <div class="mortes-row">
      <span class="stat-label">Mortes</span>
      <div class="mortes-pips">${renderPips(pc.mortes, 'pip')}</div>
      <span style="font-size:11px;color:var(--text-dim)">${pc.mortes}/3</span>
    </div>
    ${bloodiedEfeitosHtml}
    <div class="card-pc-actions">
      ${btnEstus}
      ${btnMarcarMorte}
      ${btnRecuperar}
      ${btnRetornar}
    </div>
  `;
}

/* ---- Inimigos ---- */

function renderInimigos(state, bestiario) {
  const container = document.getElementById('inimigos-list');
  if (!container) return;

  const existingIds = new Set([...container.children].map(c => c.dataset.inimigoId));
  const newIds = new Set(state.inimigos.map(e => e.id));

  for (const child of [...container.children]) {
    if (!newIds.has(child.dataset.inimigoId)) child.remove();
  }

  for (const inimigo of state.inimigos) {
    let card = container.querySelector(`[data-inimigo-id="${inimigo.id}"]`);
    const isNew = !card;
    if (isNew) {
      card = document.createElement('div');
      card.dataset.inimigoId = inimigo.id;
      card.className = 'card-inimigo';
      container.appendChild(card);
    }
    renderEnemyCard(card, inimigo, state, bestiario, isNew);
  }
}

function renderEnemyCard(card, inimigo, state, bestiario, expanded) {
  const base = bestiario[inimigo.bestiario_ref];
  const bloodied_em = base ? base.bloodied_em : null;
  const isBloodiedInimigo = bloodied_em != null && inimigo.position_atual <= bloodied_em && inimigo.position_atual > 0;
  const isMorto = inimigo.position_atual <= 0;

  card.className = 'card-inimigo' + (isBloodiedInimigo ? ' bloodied' : '') + (isMorto ? ' morto-inimigo' : '');

  const faseAtual = base && base.fases ? base.fases.find(f => f.id === inimigo.fase_atual) : null;

  const faseHtml = inimigo.fase_atual != null ? `
    <span class="badge badge-bloodied" style="font-size:10px">Fase ${inimigo.fase_atual}</span>
    <div class="fase-actions">
      <button data-action="retreat-fase" data-inimigo="${inimigo.id}" title="Voltar fase">◀</button>
      <button data-action="advance-fase" data-inimigo="${inimigo.id}" title="Avançar fase">▶</button>
    </div>` : '';

  const collapseKey = `inimigo-collapse-${inimigo.id}`;
  const isCollapsed = card._collapsed === true && !expanded;

  const statsHtml = base ? `
    <div class="inimigo-stats-grid">
      <div class="inimigo-stat"><span class="inimigo-stat-label">AC:</span>${base.ac}</div>
      <div class="inimigo-stat"><span class="inimigo-stat-label">Vel:</span>${base.velocidade_m}m</div>
      ${base.iniciativa_dc ? `<div class="inimigo-stat"><span class="inimigo-stat-label">Iniciativa DC:</span>${base.iniciativa_dc}</div>` : ''}
      ${base.iniciativa ? `<div class="inimigo-stat"><span class="inimigo-stat-label">Iniciativa:</span>${base.iniciativa}</div>` : ''}
      <div class="inimigo-stat"><span class="inimigo-stat-label">Almas:</span>${base.almas}</div>
      ${base.imunidades_dano?.length ? `<div class="inimigo-stat"><span class="inimigo-stat-label">Imune:</span>${base.imunidades_dano.join(', ')}</div>` : ''}
      ${base.resistencias_dano?.length ? `<div class="inimigo-stat"><span class="inimigo-stat-label">Resist:</span>${base.resistencias_dano.join(', ')}</div>` : ''}
      ${base.imunidades_condicao?.length ? `<div class="inimigo-stat"><span class="inimigo-stat-label">Imune cond:</span>${base.imunidades_condicao.join(', ')}</div>` : ''}
    </div>` : `<p style="color:var(--brasa);font-size:12px">⚠ Ref "${inimigo.bestiario_ref}" não encontrada no bestiário</p>`;

  const tracosHtml = base?.tracos?.length ? `
    <div>
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">TRAÇOS</div>
      ${base.tracos.map(t => `<div class="acao-item"><span class="acao-nome">${t.nome}</span> — ${t.efeito}</div>`).join('')}
    </div>` : '';

  // Arma equipada: aparece independente de `acoes` existirem
  const armaEqAtual = base?.armas_disponiveis?.find(w => w.nome === inimigo.arma_equipada);
  const armaHtml = base?.armas_disponiveis?.length ? `
    <div>
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">ARMA EQUIPADA</div>
      <div class="stat-row">
        <select class="arma-select" data-action="set-arma" data-inimigo="${inimigo.id}">
          ${base.armas_disponiveis.map(a =>
            `<option value="${a.nome}"${inimigo.arma_equipada === a.nome ? ' selected' : ''}>${a.nome}</option>`
          ).join('')}
        </select>
      </div>
      ${armaEqAtual ? `<div class="acao-item" style="margin-top:4px">
        <span class="acao-nome">${armaEqAtual.nome}</span>
        ${armaEqAtual.tipo} · ${armaEqAtual.ataque} · Alcance ${armaEqAtual.alcance} · ${armaEqAtual.dano}
      </div>` : ''}
    </div>` : '';

  const acoesHtml = base?.acoes?.length ? `
    <div>
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">AÇÕES</div>
      <div class="acoes-list">
        ${base.acoes.map(a => {
          const detalhes = [
            a.ataque ? `Ataque ${a.ataque}` : '',
            a.alcance ? `Alcance ${a.alcance}` : '',
            a.dano ? `Dano ${a.dano}` : '',
            a.save ? `Save ${a.save}` : '',
            a.efeito ? a.efeito : '',
            a.extra ? a.extra : ''
          ].filter(Boolean).join(' · ');
          return `<div class="acao-item"><span class="acao-nome">${a.nome}</span> — ${detalhes}</div>`;
        }).join('')}
      </div>
    </div>` : '';

  const fasesListHtml = base?.fases?.length ? `
    <div class="fases-list">
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">FASES</div>
      ${base.fases.map(f => `
        <div class="fase-item${f.id === inimigo.fase_atual ? ' ativa' : ''}">
          <strong>${f.nome}</strong> (${f.gatilho}) — ${f.regra}
        </div>`).join('')}
    </div>` : '';

  const narrativaBtn = base?.narrativa
    ? `<button data-action="mostrar-narrativa" data-inimigo="${inimigo.id}" style="font-size:11px">Mostrar narrativa</button>`
    : '';

  const removeTitle = isMorto ? 'Remover (0 Position)' : 'Remover inimigo';
  const removeDirect = isMorto;

  card.innerHTML = `
    <div class="card-inimigo-header">
      <button class="btn-toggle-inimigo" data-toggle="${inimigo.id}" aria-label="Expandir/recolher">${isCollapsed ? '▶' : '▼'}</button>
      <input class="inimigo-nome-input" type="text" data-action="set-nome-inimigo" data-inimigo="${inimigo.id}" value="${inimigo.nome_exibicao}" aria-label="Nome do inimigo">
      <div class="inimigo-position-wrap">
        <input type="number" data-action="set-position-inimigo" data-inimigo="${inimigo.id}" data-field="position_atual" value="${inimigo.position_atual}" min="0" style="width:52px" aria-label="Position atual">
        <span>/</span>
        <input type="number" data-action="set-position-inimigo" data-inimigo="${inimigo.id}" data-field="position_max" value="${inimigo.position_max}" min="1" style="width:52px" aria-label="Position máxima">
      </div>
      ${faseHtml}
      ${isBloodiedInimigo ? `<span class="badge badge-bloodied">Bloodied</span>` : ''}
      <button class="btn-remove-inimigo" data-action="remove-inimigo" data-inimigo="${inimigo.id}" data-direct="${removeDirect}" aria-label="${removeTitle}" title="${removeTitle}">✕</button>
    </div>
    <div class="card-inimigo-body${isCollapsed ? ' collapsed' : ''}">
      ${statsHtml}
      ${tracosHtml}
      ${armaHtml}
      ${acoesHtml}
      ${fasesListHtml}
      ${isBloodiedInimigo && faseAtual ? `<div style="color:var(--brasa);font-size:12px;border-left:2px solid var(--brasa);padding-left:6px">Fase atual: ${faseAtual.regra}</div>` : ''}
      <div>
        <label for="nota-${inimigo.id}" style="font-size:11px;color:var(--text-dim)">Nota:</label>
        <textarea id="nota-${inimigo.id}" data-action="set-nota-inimigo" data-inimigo="${inimigo.id}" rows="2">${inimigo.nota}</textarea>
      </div>
      ${narrativaBtn}
    </div>
  `;
}

/* ---- Barra de combate ---- */

function renderCombatBar(state) {
  const label = document.getElementById('combat-label');
  const btnIniciar = document.getElementById('btn-iniciar-combate');
  const btnEncerrar = document.getElementById('btn-encerrar-combate');
  if (!label || !btnIniciar || !btnEncerrar) return;

  if (state.combate.ativo) {
    label.textContent = 'Combate em andamento';
    label.style.color = 'var(--brasa)';
    btnIniciar.disabled = true;
    btnEncerrar.disabled = false;
  } else {
    label.textContent = 'Fora de combate';
    label.style.color = 'var(--dourado)';
    btnIniciar.disabled = false;
    btnEncerrar.disabled = true;
  }
}

/* ========================================================
   VISTA JOGADORES
   ======================================================== */

export function renderPlayers(state, origens) {
  const el = document.getElementById('players-session-nome');
  if (el) el.textContent = state.sessao.nome;

  const grid = document.getElementById('players-pcs-grid');
  if (!grid) return;

  const existingIds = new Set([...grid.children].map(c => c.dataset.pcId));
  const newIds = new Set(state.pcs.map(p => p.id));

  for (const child of [...grid.children]) {
    if (!newIds.has(child.dataset.pcId)) child.remove();
  }

  for (const pc of state.pcs) {
    let card = grid.querySelector(`[data-pc-id="${pc.id}"]`);
    if (!card) {
      card = document.createElement('article');
      card.dataset.pcId = pc.id;
      grid.appendChild(card);
    }
    renderPcCardPlayers(card, pc, state, origens);
  }

  state.pcs.forEach((pc, i) => {
    const card = grid.querySelector(`[data-pc-id="${pc.id}"]`);
    if (card && grid.children[i] !== card) grid.appendChild(card);
  });
}

function renderPcCardPlayers(card, pc, state, origens) {
  const blooded = isBloodied(pc, state.combate);
  const morto = pc.status === 'morto_aguardando_respawn';

  card.className = 'card-pc-player' + (blooded ? ' bloodied' : '') + (morto ? ' morto' : '');
  card.dataset.pcId = pc.id;

  const efeitos = blooded ? bloodiedEfeitos(pc, origens) : { atributosDelta: {}, acDelta: 0, textos: [] };
  const poolTemp = state.combate.pool_inicial_combate[pc.id] ?? null;

  const attrHtml = renderAttrRow(pc.atributos, efeitos.atributosDelta, 'player-attr');

  const badgesHtml = [
    blooded ? `<span class="badge badge-bloodied">Bloodied</span>` : '',
    pc.marca_de_sangue_ativa ? `<span class="badge badge-marca">Marca de Sangue</span>` : '',
    morto ? `<span class="badge badge-morte">Aguardando respawn</span>` : ''
  ].filter(Boolean).join('');

  const positionTempHtml = (state.combate.ativo && poolTemp != null)
    ? `<span class="player-position-temp">(+${poolTemp} temp)</span>`
    : '';

  const bloodiedEfeitosHtml = (blooded && efeitos.textos.length > 0)
    ? `<ul class="player-bloodied-efeitos">${efeitos.textos.map(t => `<li>${t}</li>`).join('')}</ul>`
    : '';

  const youDiedHtml = morto
    ? `<div class="you-died-text-player">YOU DIED</div>`
    : '';

  card.innerHTML = `
    ${youDiedHtml}
    <div class="player-nome">${pc.nome}</div>
    <div class="player-classe">${pc.classe} · ${pc.origem}</div>
    <div class="player-badges">${badgesHtml}</div>
    <div class="player-stat-row">
      <span class="player-stat-label">Position</span>
      <span class="player-stat-val">${pc.position_atual}</span>
      <span class="player-stat-sep"> / ${pc.base_position}</span>
      ${positionTempHtml}
    </div>
    <div class="player-stat-row">
      <span class="player-stat-label">Estus</span>
      <span class="player-stat-val">${pc.estus_atual}</span>
      <span class="player-stat-sep"> / ${pc.estus_max}</span>
    </div>
    <div class="player-stat-row">
      <span class="player-stat-label">Almas coletadas</span>
      <span class="player-stat-val">${pc.almas_coletadas}</span>
    </div>
    <div class="player-stat-row">
      <span class="player-stat-label">Almas bancadas</span>
      <span class="player-stat-val">${pc.almas_bancadas}</span>
    </div>
    <div class="player-stat-row">
      <span class="player-stat-label">Mortes</span>
      <div class="player-mortes-pips">${renderPips(pc.mortes, 'player-pip')}</div>
    </div>
    <div class="player-atributos">${attrHtml}</div>
    ${bloodiedEfeitosHtml}
  `;
}
