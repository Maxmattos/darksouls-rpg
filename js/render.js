import { isBloodied, bloodiedEfeitos } from './logica.js';

const ATTR_LABELS = { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };

const SLOTS = [
  { key: 'mao_esq',  label: 'MÃO ESQ'  },
  { key: 'mao_dir',  label: 'MÃO DIR'  },
  { key: 'armor',    label: 'ARMADURA' },
  { key: 'anel_esq', label: 'ANEL ESQ' },
  { key: 'anel_dir', label: 'ANEL DIR' },
];

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

function patchField(el, html) {
  if (el && el.innerHTML !== html) el.innerHTML = html;
}

/* ---- Helpers de card PC ---- */

function renderPcAttrCols(atributos, atributosDelta) {
  return Object.entries(ATTR_LABELS).map(([key, label]) => {
    const base = atributos[key] ?? 0;
    const delta = atributosDelta[key] ?? 0;
    const valHtml = delta !== 0
      ? `${base}<span class="attr-arrow">→</span><span class="attr-new-val">${base + delta}</span>`
      : `${base}`;
    return `<div class="pc-attr-col">
      <span class="pc-vital-label">${label}</span>
      <span class="pc-attr-val${delta !== 0 ? ' bloodied-changed' : ''}">${valHtml}</span>
    </div>`;
  }).join('');
}

function renderSlotsHtml() {
  return SLOTS.map(s => `
    <div class="pc-slot-wrap">
      <div class="pc-slot"></div>
      <span class="pc-slot-label">${s.label}</span>
    </div>`).join('');
}

function renderPortraitHtml(pc) {
  return pc.imagem_url
    ? `<img src="${pc.imagem_url}" alt="${pc.nome}">`
    : `<span class="pc-portrait-placeholder">Imagem</span>`;
}

function renderPips(mortes, cls) {
  return [0, 1, 2].map(i => `<span class="${cls}${i < mortes ? ' ativo' : ''}"></span>`).join('');
}

/* ========================================================
   VISTA MESTRE
   ======================================================== */

export function renderMaster(state, bestiario, origens) {
  setText('session-data', state.sessao.data);

  const grid = document.getElementById('pcs-grid');
  if (grid) {
    const newIds = new Set(state.pcs.map(p => p.id));

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

  const positionTempHtml = (state.combate.ativo && poolTemp != null && poolTemp > 0)
    ? `<span class="position-temp">(+${poolTemp} temp)</span>`
    : '';

  const acDisplay = efeitos.acDelta !== 0
    ? `${pc.ac_base ?? 10}<span class="attr-arrow">→</span><span class="attr-new-val">${acEfetiva}</span>`
    : `${acEfetiva}`;

  const badgesHtml = [
    blooded ? `<span class="badge badge-bloodied">Bloodied</span>` : '',
    pc.marca_de_sangue_ativa ? `<span class="badge badge-marca">Marca de Sangue</span>` : '',
    pc.mortes >= 3 ? `<span class="badge badge-permadeath">Permadeath iminente</span>` : ''
  ].filter(Boolean).join('');

  const btnEstus = `<button data-action="drink-estus" data-pc="${pc.id}"${pc.estus_atual <= 0 ? ' disabled' : ''}>Beber Estus</button>`;
  const btnMarcarMorte = (pc.mortes >= 3 || morto)
    ? `<button class="btn-danger" data-action="mark-death" data-pc="${pc.id}" disabled>Marcar morte</button>`
    : `<button class="btn-danger" data-action="mark-death" data-pc="${pc.id}">Marcar morte</button>`;
  const btnRecuperar = pc.marca_de_sangue_ativa
    ? `<button data-action="recover-mark" data-pc="${pc.id}">Recuperar marca</button>`
    : `<button data-action="recover-mark" data-pc="${pc.id}" disabled>Recuperar marca</button>`;
  const btnRetornar = morto
    ? `<button class="btn-primary" data-action="return-combat" data-pc="${pc.id}">Retornar ao combate</button>`
    : '';

  // TODO: equipment effects — implementar quando lógica de equipamento estiver pronta
  const bloodiedEfeitosHtml = (blooded && efeitos.textos.length > 0)
    ? `<div class="pc-effects-bloodied">
        <div class="pc-effects-subtitle">Bloodied Effects</div>
        <ul class="pc-effects-list">${efeitos.textos.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>`
    : '';

  const youDiedHtml = morto
    ? `<div class="you-died-overlay"><span class="you-died-text">YOU DIED</span></div>`
    : '';

  card.innerHTML = `
    ${youDiedHtml}
    <div class="card-pc-content">
      <div class="pc-nome">${pc.nome}</div>
      <div class="pc-subtitulo">${pc.classe} · ${pc.origem}</div>
      ${badgesHtml ? `<div class="pc-badges">${badgesHtml}</div>` : ''}
      <div class="pc-separator">◆</div>
      <div class="pc-attrs-6col">${renderPcAttrCols(pc.atributos, efeitos.atributosDelta)}</div>
      <div class="pc-separator">◆</div>
      <div class="stat-row">
        <span class="stat-label">AC</span>
        <span class="stat-value-display">${acDisplay}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Position</span>
        <input type="number" data-pc="${pc.id}" data-field="position_atual" value="${pc.position_atual}" min="0" style="width:56px">
        <span>/</span>
        <input type="number" data-pc="${pc.id}" data-field="base_position" value="${pc.base_position}" min="1" style="width:56px">
        ${positionTempHtml}
      </div>
      <div class="stat-row">
        <span class="stat-label">Estus</span>
        <input type="number" data-pc="${pc.id}" data-field="estus_atual" value="${pc.estus_atual}" min="0" style="width:48px">
        <span>/</span>
        <input type="number" data-pc="${pc.id}" data-field="estus_max" value="${pc.estus_max}" min="0" style="width:48px">
      </div>
      <div class="stat-row">
        <span class="stat-label">Almas coletadas</span>
        <input type="number" data-pc="${pc.id}" data-field="almas_coletadas" value="${pc.almas_coletadas}" min="0" style="width:72px">
      </div>
      <div class="stat-row">
        <span class="stat-label">Almas bancadas</span>
        <input type="number" data-pc="${pc.id}" data-field="almas_bancadas" value="${pc.almas_bancadas}" min="0" style="width:72px">
      </div>
      <div class="mortes-row">
        <span class="stat-label">Mortes</span>
        <div class="mortes-pips">${renderPips(pc.mortes, 'pip')}</div>
        <span style="font-size:11px;color:var(--text-dim)">${pc.mortes}/3</span>
      </div>
      <div class="card-pc-actions">
        ${btnEstus}
        ${btnMarcarMorte}
        ${btnRecuperar}
        ${btnRetornar}
      </div>
      <div class="pc-separator">◆</div>
      <div class="pc-slots">${renderSlotsHtml()}</div>
      <div class="pc-effects">
        <div class="pc-effects-equip">
          <div class="pc-separator">◆</div>
          <div class="pc-effects-subtitle">Equipment Effects</div>
          <span class="pc-effects-none">—</span>
        </div>
        ${bloodiedEfeitosHtml}
      </div>
    </div>
  `;
}

/* ---- Inimigos ---- */

function renderInimigos(state, bestiario) {
  const container = document.getElementById('inimigos-list');
  if (!container) return;

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

  const isCollapsed = card._collapsed === true && !expanded;

  const fmtMod = v => v >= 0 ? `+${v}` : `${v}`;

  // Bloco superior: AC / Vel / Iniciativa / Almas (consulta constante no turno)
  const combatInfoHtml = base ? `
    <div class="inimigo-combat-stats">
      <div class="inimigo-stat"><span class="inimigo-stat-label">AC</span>${base.ac}</div>
      <div class="inimigo-stat"><span class="inimigo-stat-label">Vel</span>${base.velocidade_m}m</div>
      ${base.iniciativa_dc ? `<div class="inimigo-stat"><span class="inimigo-stat-label">DC ini</span>${base.iniciativa_dc}</div>` : ''}
      ${base.iniciativa ? `<div class="inimigo-stat"><span class="inimigo-stat-label">Ini</span>${base.iniciativa}</div>` : ''}
      <div class="inimigo-stat"><span class="inimigo-stat-label">Almas</span>${base.almas}</div>
    </div>` : `<p style="color:var(--brasa);font-size:12px">⚠ Ref "${inimigo.bestiario_ref}" não encontrada no bestiário</p>`;

  // Stat block compacto: atributos + saves
  const atributosSavesHtml = base?.atributos ? (() => {
    const ATTR_ORDER = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    const attrsHtml = ATTR_ORDER.map(k => `
      <div class="inimigo-attr-col">
        <span class="inimigo-attr-label">${ATTR_LABELS[k]}</span>
        <span class="inimigo-attr-val">${fmtMod(base.atributos[k] ?? 0)}</span>
      </div>`).join('');
    const savesHtml = ATTR_ORDER.map(k => {
      const prof = base.saves && k in base.saves;
      const val  = prof ? base.saves[k] : (base.atributos[k] ?? 0);
      return `<span class="inimigo-save-item${prof ? ' proficiente' : ''}"><span class="inimigo-attr-label">${ATTR_LABELS[k]}</span> ${fmtMod(val)}</span>`;
    }).join('');
    return `
      <div class="inimigo-statblock">
        <div class="inimigo-attrs-row">${attrsHtml}</div>
        ${savesHtml ? `<div class="inimigo-saves-row"><span class="inimigo-saves-label">Saves:</span>${savesHtml}</div>` : ''}
      </div>`;
  })() : '';

  const fasesListHtml = base?.fases?.length ? `
    <div class="fases-list">
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">FASES</div>
      ${base.fases.map(f => `
        <div class="fase-item${f.id === inimigo.fase_atual ? ' ativa' : ''}">
          <strong>${f.nome}</strong> (${f.gatilho}) — ${f.regra}
        </div>`).join('')}
    </div>` : '';

  const armaEqAtual = base?.armas_disponiveis?.find(w => w.nome === inimigo.arma_equipada);
  const armaHtml = base?.armas_disponiveis?.length ? `
    <div>
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">ARMA EQUIPADA</div>
      <div style="display:flex;align-items:center;gap:6px">
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

  const tracosHtml = base?.tracos?.length ? `
    <div>
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:4px">TRAÇOS</div>
      ${base.tracos.map(t => `<div class="acao-item"><span class="acao-nome">${t.nome}</span> — ${t.efeito}</div>`).join('')}
    </div>` : '';

  // Resistências / imunidades — rodapé (consulta rara)
  const resistenciasItens = base ? [
    base.imunidades_dano?.length ? `<div class="inimigo-stat"><span class="inimigo-stat-label">Imune:</span>${base.imunidades_dano.join(', ')}</div>` : '',
    base.resistencias_dano?.length ? `<div class="inimigo-stat"><span class="inimigo-stat-label">Resist:</span>${base.resistencias_dano.join(', ')}</div>` : '',
    base.imunidades_condicao?.length ? `<div class="inimigo-stat"><span class="inimigo-stat-label">Imune cond:</span>${base.imunidades_condicao.join(', ')}</div>` : '',
  ].filter(Boolean) : [];
  const resistenciasHtml = resistenciasItens.length
    ? `<div class="inimigo-resistencias">${resistenciasItens.join('')}</div>`
    : '';

  const narrativaBtn = base?.narrativa
    ? `<button data-action="mostrar-narrativa" data-inimigo="${inimigo.id}" style="font-size:11px">Mostrar narrativa</button>`
    : '';

  const removeTitle = isMorto ? 'Remover (0 Position)' : 'Remover inimigo';

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
      <button class="btn-remove-inimigo" data-action="remove-inimigo" data-inimigo="${inimigo.id}" data-direct="${isMorto}" aria-label="${removeTitle}" title="${removeTitle}">✕</button>
    </div>
    <div class="card-inimigo-body${isCollapsed ? ' collapsed' : ''}">
      ${combatInfoHtml}
      ${atributosSavesHtml}
      ${fasesListHtml}
      ${armaHtml}
      ${acoesHtml}
      ${tracosHtml}
      ${resistenciasHtml}
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
  const grid = document.getElementById('players-pcs-grid');
  if (!grid) return;

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
  const acBase = pc.ac_base ?? 10;
  const acEfetiva = acBase + efeitos.acDelta;

  const positionTempHtml = (state.combate.ativo && poolTemp != null && poolTemp > 0)
    ? `<span class="pc-vital-temp">+${poolTemp}</span>`
    : '';

  const acDisplay = efeitos.acDelta !== 0
    ? `${acBase}<span class="attr-arrow">→</span><span class="attr-new-val">${acEfetiva}</span>`
    : `${acEfetiva}`;

  const badgesHtml = [
    blooded ? `<span class="badge badge-bloodied">Bloodied</span>` : '',
    pc.marca_de_sangue_ativa ? `<span class="badge badge-marca">Marca de Sangue</span>` : '',
    morto ? `<span class="badge badge-morte">Aguardando respawn</span>` : ''
  ].filter(Boolean).join('');

  // TODO: equipment effects — implementar quando lógica de equipamento estiver pronta
  const equipEfeitosHtml = `<span class="pc-effects-none">—</span>`;

  const bloodiedEfeitosHtml = (blooded && efeitos.textos.length > 0)
    ? `<div class="pc-effects-bloodied">
        <div class="pc-effects-subtitle">Bloodied Effects</div>
        <ul class="pc-effects-list">${efeitos.textos.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>`
    : '';

  const youDiedHtml = morto
    ? `<div class="you-died-overlay"><span class="you-died-text">YOU DIED</span></div>`
    : '';

  card.innerHTML = `
    ${youDiedHtml}
    <div class="card-pc-inner">
      <div class="pc-card-left">
        <div class="pc-portrait">${renderPortraitHtml(pc)}</div>
        <div class="pc-slots">${renderSlotsHtml()}</div>
      </div>
      <div class="pc-card-right">
        <div class="pc-nome">${pc.nome}</div>
        <div class="pc-subtitulo">${pc.classe} · ${pc.origem}</div>
        ${badgesHtml ? `<div class="pc-badges">${badgesHtml}</div>` : ''}
        <div class="pc-separator">◆</div>
        <div class="pc-vital-grid">
          <div class="pc-vital-stat">
            <span class="pc-vital-label">Position</span>
            <div class="pc-vital-row">
              <span class="pc-vital-val">${pc.position_atual}</span>
              <span class="pc-vital-sep">/</span>
              <span class="pc-vital-dim">${pc.base_position}</span>
              ${positionTempHtml}
            </div>
          </div>
          <div class="pc-vital-stat">
            <span class="pc-vital-label">Estus</span>
            <div class="pc-vital-row">
              <span class="pc-vital-val">${pc.estus_atual}</span>
              <span class="pc-vital-sep">/</span>
              <span class="pc-vital-dim">${pc.estus_max}</span>
            </div>
          </div>
        </div>
        <div class="pc-separator">◆</div>
        <div class="pc-attrs-6col">${renderPcAttrCols(pc.atributos, efeitos.atributosDelta)}</div>
        <div class="pc-separator">◆</div>
        <div class="pc-ac-deaths">
          <div class="pc-vital-stat">
            <span class="pc-vital-label">AC</span>
            <div class="pc-ac-val">${acDisplay}</div>
          </div>
          <div class="pc-vital-stat">
            <span class="pc-vital-label">Mortes</span>
            <div class="mortes-pips">${renderPips(pc.mortes, 'pip')}</div>
          </div>
        </div>
        <div class="pc-almas">
          <span><span class="icon-coletadas">🔥</span> Coletadas: ${pc.almas_coletadas}</span>
          <span><span class="icon-bancadas">⚱️</span> Bancadas: ${pc.almas_bancadas}</span>
        </div>
        <div class="pc-effects">
          <div class="pc-effects-equip">
            <div class="pc-separator">◆</div>
            <div class="pc-effects-subtitle">Equipment Effects</div>
            ${equipEfeitosHtml}
          </div>
          ${bloodiedEfeitosHtml}
        </div>
      </div>
    </div>
  `;
}
