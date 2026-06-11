import { aplicarAcao } from './logica.js';
import { publish } from './io.js';

const STORAGE_KEY = 'rpg_ds_state';
let _state = null;
let _onchange = null;

export function defaultState() {
  return {
    sessao: {
      id: 's01',
      nome: 'O Silêncio das Grades',
      data: '2026-06-01'
    },
    pcs: [
      {
        id: 'marin',
        nome: 'Marin',
        classe: 'Pyromancer',
        origem: 'Caster',
        nivel: 1,
        con_mod: 0,
        atributos: { str: 10, dex: 12, con: 10, int: 14, wis: 13, cha: 15 },
        ac_base: 11,
        base_position: 7,
        position_atual: 7,
        estus_atual: 3,
        estus_max: 3,
        almas_coletadas: 0,
        almas_marca_de_sangue: 0,
        almas_bancadas: 0,
        mortes: 0,
        marca_de_sangue_ativa: false,
        imagem_url: '',
        equipamento: { mao_esq: null, mao_dir: null, armor: null, anel_esq: null, anel_dir: null },
        status: 'vivo'
      },
      {
        id: 'zarkov',
        nome: 'Zarkov',
        classe: 'Assassin',
        origem: 'Fencer',
        nivel: 1,
        con_mod: 2,
        atributos: { str: 12, dex: 15, con: 14, int: 13, wis: 10, cha: 10 },
        ac_base: 12,
        base_position: 11,
        position_atual: 11,
        estus_atual: 3,
        estus_max: 3,
        almas_coletadas: 0,
        almas_marca_de_sangue: 0,
        almas_bancadas: 0,
        mortes: 0,
        marca_de_sangue_ativa: false,
        imagem_url: '',
        equipamento: { mao_esq: null, mao_dir: null, armor: null, anel_esq: null, anel_dir: null },
        status: 'vivo'
      },
      {
        id: 'drakar',
        nome: 'Drakar',
        classe: 'Knight',
        origem: 'Brute',
        nivel: 1,
        con_mod: 2,
        atributos: { str: 15, dex: 10, con: 14, int: 10, wis: 12, cha: 13 },
        ac_base: 16,
        base_position: 13,
        position_atual: 13,
        estus_atual: 3,
        estus_max: 3,
        almas_coletadas: 0,
        almas_marca_de_sangue: 0,
        almas_bancadas: 0,
        mortes: 0,
        marca_de_sangue_ativa: false,
        imagem_url: '',
        equipamento: { mao_esq: null, mao_dir: null, armor: null, anel_esq: null, anel_dir: null },
        status: 'vivo'
      },
      {
        id: 'elvyra',
        nome: 'Elvyra',
        classe: 'The Deprived',
        origem: 'Brute',
        nivel: 1,
        con_mod: 2,
        atributos: { str: 16, dex: 10, con: 14, int: 10, wis: 12, cha: 14 },
        ac_base: 10,
        base_position: 13,
        position_atual: 13,
        estus_atual: 3,
        estus_max: 3,
        almas_coletadas: 0,
        almas_marca_de_sangue: 0,
        almas_bancadas: 0,
        mortes: 0,
        marca_de_sangue_ativa: false,
        imagem_url: '',
        equipamento: { mao_esq: null, mao_dir: null, armor: null, anel_esq: null, anel_dir: null },
        status: 'vivo'
      }
    ],
    inimigos: [],
    combate: {
      ativo: false,
      pool_inicial_combate: {}
    }
  };
}

function normalizeEquipamento(eq) {
  if (!eq) return { mao_esq: null, mao_dir: null, armor: null, anel_esq: null, anel_dir: null };
  if ('sword' in eq || 'shield' in eq || 'ring1' in eq) {
    return { mao_esq: eq.sword ?? null, mao_dir: eq.shield ?? null, armor: eq.armor ?? null, anel_esq: eq.ring1 ?? null, anel_dir: eq.ring2 ?? null };
  }
  return { mao_esq: eq.mao_esq ?? null, mao_dir: eq.mao_dir ?? null, armor: eq.armor ?? null, anel_esq: eq.anel_esq ?? null, anel_dir: eq.anel_dir ?? null };
}

function normalizeState(s) {
  if (s?.pcs) s.pcs = s.pcs.map(pc => ({ ...pc, equipamento: normalizeEquipamento(pc.equipamento) }));
  return s;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch { /* corrupted */ }
  return null;
}

export function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* quota exceeded */ }
}

export function getState() { return _state; }

export function setState(s) {
  _state = s;
}

export function setOnChange(fn) {
  _onchange = fn;
}

export function dispatch(action, payload) {
  const next = aplicarAcao(_state, action, payload);
  _state = next;
  saveState(next);
  publish(next);
  if (_onchange) _onchange(next);
}
