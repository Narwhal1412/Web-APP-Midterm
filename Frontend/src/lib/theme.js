// Background presets. Each sets three CSS variables used in styles.css.
export const PRESETS = [
  { id: 'midnight', name: 'Midnight',    base: '#050a18', top: '#0e1a38', glow: 'rgba(120,160,255,.16)' },
  { id: 'glow',     name: 'Black glow',  base: '#000000', top: '#0d0d0d', glow: 'rgba(124,140,255,.20)' },
    { id: 'black',    name: 'Pure black',  base: '#000000', top: '#000000', glow: 'rgba(255,255,255,0)' },
  { id: 'graphite', name: 'Graphite',    base: '#141414', top: '#262626', glow: 'rgba(255,255,255,.08)' },
  { id: 'wine',     name: 'Wine',        base: '#12040a', top: '#2a0b18', glow: 'rgba(255,120,160,.14)' },
];

const KEY = 'notes-bg-v2';
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixWhite = (h, t) => '#' + hex(h).map((v) => Math.round(v + (255 - v) * t).toString(16).padStart(2, '0')).join('');

export function resolve(choice) {
  if (choice?.custom && /^#[0-9a-f]{6}$/i.test(choice.custom)) {
    return { base: choice.custom, top: mixWhite(choice.custom, 0.12), glow: 'rgba(255,255,255,.12)' };
  }
  return PRESETS.find((p) => p.id === choice?.id) || PRESETS[0];
}

export function applyBg(choice) {
  const t = resolve(choice);
  const s = document.documentElement.style;
  s.setProperty('--bg-base', t.base);
  s.setProperty('--bg-top', t.top);
  s.setProperty('--glow', t.glow);
}

export function loadBg() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { id: 'midnight' }; } catch { return { id: 'midnight' }; }
}
export function saveBg(choice) {
  try { localStorage.setItem(KEY, JSON.stringify(choice)); } catch { /* ignore */ }
}
