import { useSyncExternalStore } from 'react';

// Small persisted UI settings. Currently: show/hide the "List served from CACHE/DB" line.
const KEY = 'notes-show-cache';
const EVT = 'notes-settings-change';

const read = () => { try { return localStorage.getItem(KEY) !== '0'; } catch { return true; } };

function subscribe(cb) {
  window.addEventListener(EVT, cb);
  window.addEventListener('storage', cb);
  return () => { window.removeEventListener(EVT, cb); window.removeEventListener('storage', cb); };
}

export function setShowCache(on) {
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* ignore */ }
  window.dispatchEvent(new Event(EVT));
}

// Returns [showCache, setShowCache]; default is shown.
export function useShowCache() {
  const value = useSyncExternalStore(subscribe, read, () => true);
  return [value, setShowCache];
}
