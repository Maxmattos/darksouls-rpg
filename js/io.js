const CHANNEL_NAME = 'rpg_ds';
let _channel = null;

export async function loadBestiario() {
  try {
    const r = await fetch('./bestiario.json');
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch (e) {
    console.warn('Falha ao carregar bestiario.json:', e);
    return {};
  }
}

export async function loadBloodiedOrigens() {
  try {
    const r = await fetch('./bloodied_origens.json');
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch (e) {
    console.warn('Falha ao carregar bloodied_origens.json:', e);
    return {};
  }
}

export async function loadItens() {
  try {
    const r = await fetch('./itens.json');
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch (e) {
    console.warn('Falha ao carregar itens.json:', e);
    return {};
  }
}

export function initChannel() {
  if (typeof BroadcastChannel === 'undefined') return false;
  try {
    _channel = new BroadcastChannel(CHANNEL_NAME);
    return true;
  } catch {
    return false;
  }
}

export function publish(state) {
  if (_channel) _channel.postMessage(JSON.stringify(state));
}

export function subscribe(cb) {
  if (!_channel) return;
  _channel.onmessage = (e) => {
    try { cb(JSON.parse(e.data)); } catch { /* malformed message */ }
  };
}

export function exportJSON(state) {
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rpg_ds_${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(onLoad) {
  const input = document.getElementById('input-import');
  input.addEventListener('change', function handler(e) {
    input.removeEventListener('change', handler);
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const state = JSON.parse(ev.target.result);
        onLoad(state);
      } catch {
        alert('Arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }, { once: false });
  input.click();
}
