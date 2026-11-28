import { requestLog } from '../lib/requestLog';

// Read from .env (VITE_API_BASE). Falls back to '/api': nginx (docker) or the Vite proxy (dev) forwards it to the backend.
const BASE = import.meta.env.VITE_API_BASE || '/api';

export const tokenStore = {
  get: () => localStorage.getItem('token'),
  set: (t) => localStorage.setItem('token', t),
  clear: () => localStorage.removeItem('token'),
};

// Reads "was this answer served from Redis?" from the response.
// Preferred: header  X-Cache: HIT | MISS.  Fallback: a field "cache" / "source" in the JSON body.
function cacheState(headers, body) {
  const h = (headers?.get('x-cache') || '').toLowerCase();
  if (h.includes('hit')) return 'hit';
  if (h.includes('miss')) return 'miss';
  const v = String(body?.cache ?? body?.source ?? body?.meta?.cache ?? '').toLowerCase();
  if (['hit', 'cache', 'redis'].includes(v)) return 'hit';
  if (['miss', 'db', 'database'].includes(v)) return 'miss';
  return null;
}

// Sends a request and measures how long it took in the browser.
async function request(method, path, { body, auth = true, log = true, timeout = 5000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const t0 = performance.now();
  let res = null;
  let data = null;
  let error = null;
  try {
    res = await fetch(BASE + path, { method, headers, signal: ctrl.signal, cache: 'no-store', body: body !== undefined ? JSON.stringify(body) : undefined });
    if (res.status !== 204) data = await res.json().catch(() => null);
  } catch (e) {
    error = e.name === 'AbortError' ? 'timeout' : 'network error';
  } finally {
    clearTimeout(timer);
  }

  const ms = Math.round(performance.now() - t0);
  const status = res?.status ?? 0;
  const ok = !error && status >= 200 && status < 300;
  const cache = cacheState(res?.headers, data);
  if (log) requestLog.add({ method, path, status, ms, ok, source: cache, error });
  if (status === 401 && auth && token) window.dispatchEvent(new Event('auth:expired'));
  if (!ok) throw Object.assign(new Error(data?.message || error || `HTTP ${status}`), { status, ms, body: data });
  return { body: data, ms, status, cache };
}

export const api = {
  health: ({ log = false } = {}) => request('GET', '/health', { auth: false, log, timeout: 900 }),
  register: (p) => request('POST', '/register', { body: p, auth: false }),
  login: (p) => request('POST', '/login', { body: p, auth: false }),
  logout: () => request('POST', '/logout'),
  me: () => request('GET', '/user'),
  notes: () => request('GET', '/notes'),
  note: (id) => request('GET', `/notes/${id}`),
  createNote: (n) => request('POST', '/notes', { body: n }),
  updateNote: (id, n) => request('PUT', `/notes/${id}`, { body: n }),
  deleteNote: (id) => request('DELETE', `/notes/${id}`),
};
