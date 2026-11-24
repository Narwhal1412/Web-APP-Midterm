import { useSyncExternalStore } from 'react';

// Tiny external store: every request the user triggers is recorded here,
// so the table on screen (and the CSV export) is real measured data.
let entries = [];
let nextId = 1;
const subscribers = new Set();
const emit = () => subscribers.forEach((fn) => fn());

export const requestLog = {
  add(entry) {
    entries = [{ id: nextId++, ts: Date.now(), ...entry }, ...entries].slice(0, 200);
    emit();
  },
  clear() {
    entries = [];
    emit();
  },
  subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
  getSnapshot: () => entries,
};

export const useRequestLog = () => useSyncExternalStore(requestLog.subscribe, requestLog.getSnapshot);
