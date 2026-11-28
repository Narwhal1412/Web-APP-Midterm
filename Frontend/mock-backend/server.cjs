// Minimal stand-in for the real backend, ONLY for running the frontend before the real one is ready.
// No dependencies, data lives in memory. Same API as README.md.   Run:  node mock-backend/server.cjs
const http = require('http');
const os = require('os');
const crypto = require('crypto');

const PORT = process.env.PORT || 8000;
const CACHE_TTL_MS = 30000; // how long the notes list stays "in Redis"
const DB_DELAY_MS = 60; // pretend the database is slower than the cache
const started = Date.now();

const users = new Map([['demo@example.com', { name: 'Demo User', email: 'demo@example.com', password: 'password123' }]]);
const tokens = new Map(); // token -> email
const notes = []; // { id, owner, title, content }
const cache = new Map(); // email -> { data, expires }
let nextId = 1;
let dbDown = false; // toggled by POST /api/_debug/db-down | db-up, to test the banner

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(body === undefined ? '' : JSON.stringify(body));
};
const readJson = (req) =>
  new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); } });
  });
const publicUser = (u) => ({ name: u.name, email: u.email });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const path = url.pathname;
  const route = `${req.method} ${path}`;
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const email = tokens.get(token);
  const me = email && users.get(email);

  if (route === 'GET /api/health') {
    const body = { db: dbDown ? 'down' : 'ok', redis: 'ok', container: os.hostname(), uptime_s: Math.floor((Date.now() - started) / 1000) };
    return send(res, dbDown ? 503 : 200, body);
  }
  if (route === 'POST /api/_debug/db-down') { dbDown = true; return send(res, 200, { db: 'down' }); }
  if (route === 'POST /api/_debug/db-up') { dbDown = false; return send(res, 200, { db: 'ok' }); }

  if (route === 'POST /api/register') {
    const { name, email: e, password } = await readJson(req);
    if (!name || !e || !password) return send(res, 422, { message: 'name, email and password are required.' });
    if (users.has(e)) return send(res, 422, { message: 'This email is already registered.' });
    users.set(e, { name, email: e, password });
    const t = crypto.randomUUID();
    tokens.set(t, e);
    return send(res, 201, { token: t, user: publicUser(users.get(e)) });
  }
  if (route === 'POST /api/login') {
    const { email: e, password } = await readJson(req);
    const u = users.get(e);
    if (!u || u.password !== password) return send(res, 401, { message: 'Wrong email or password.' });
    const t = crypto.randomUUID();
    tokens.set(t, e);
    return send(res, 200, { token: t, user: publicUser(u) });
  }

  // everything below needs a valid token
  if (!me) return send(res, 401, { message: 'Unauthenticated.' });

  if (route === 'POST /api/logout') { tokens.delete(token); return send(res, 204); }
  if (route === 'GET /api/user') return send(res, 200, publicUser(me));

  if (route === 'GET /api/notes') {
    const hit = cache.get(me.email);
    if (hit && hit.expires > Date.now()) return send(res, 200, { data: hit.data }, { 'X-Cache': 'HIT' });
    await sleep(DB_DELAY_MS);
    const data = notes.filter((n) => n.owner === me.email).map(({ owner, ...n }) => n).reverse();
    cache.set(me.email, { data, expires: Date.now() + CACHE_TTL_MS });
    return send(res, 200, { data }, { 'X-Cache': 'MISS' });
  }
  if (route === 'POST /api/notes') {
    const { title, content } = await readJson(req);
    if (!title) return send(res, 422, { message: 'title is required.' });
    const n = { id: nextId++, owner: me.email, title, content: content || '' };
    notes.push(n);
    cache.delete(me.email);
    return send(res, 201, { id: n.id, title: n.title, content: n.content });
  }

  const m = path.match(/^\/api\/notes\/(\d+)$/);
  if (m) {
    const n = notes.find((x) => x.id === Number(m[1]) && x.owner === me.email); // only the owner's notes
    if (!n) return send(res, 404, { message: 'Note not found.' });
    if (req.method === 'GET') return send(res, 200, { id: n.id, title: n.title, content: n.content });
    if (req.method === 'PUT') {
      const { title, content } = await readJson(req);
      if (!title) return send(res, 422, { message: 'title is required.' });
      n.title = title; n.content = content || '';
      cache.delete(me.email);
      return send(res, 200, { id: n.id, title: n.title, content: n.content });
    }
    if (req.method === 'DELETE') {
      notes.splice(notes.indexOf(n), 1);
      cache.delete(me.email);
      return send(res, 204);
    }
  }
  send(res, 404, { message: 'Not found.' });
}).listen(PORT, () => console.log(`Mock backend on http://localhost:${PORT}  (demo@example.com / password123)`));
