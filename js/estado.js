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
        status: 'vivo'
      }
    ],
    inimigos: [
      { id: 'hs_1', bestiario_ref: 'hollow_soldier', nome_exibicao: 'Hollow Soldier — Espada',   arma_equipada: 'Espada Enferrujada', position_atual: 22, position_max: 22, fase_atual: null, nota: '' },
      { id: 'hs_2', bestiario_ref: 'hollow_soldier', nome_exibicao: 'Hollow Soldier — Alabarda', arma_equipada: 'Alabarda',           position_atual: 22, position_max: 22, fase_atual: null, nota: '' },
      { id: 'hs_3', bestiario_ref: 'hollow_soldier', nome_exibicao: 'Hollow Soldier — Besta',    arma_equipada: 'Besta Leve',          position_atual: 22, position_max: 22, fase_atual: null, nota: '' },
      { id: 'asd_1', bestiario_ref: 'asylum_demon_tutorial', nome_exibicao: 'Asylum Demon', arma_equipada: null, position_atual: 60, position_max: 60, fase_atual: 1, nota: '' }
    ],
    combate: {
      ativo: false,
      pool_inicial_combate: {}
    }
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
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
