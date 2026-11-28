// The backend may describe a dependency as "up", {status:"up"}, true, "ok" ... accept all of them.
function asStatus(v) {
  if (v == null) return 'unknown';
  const s = String(typeof v === 'object' ? v.status ?? (v.ok === false ? 'down' : 'up') : v).toLowerCase();
  if (['up', 'ok', 'healthy', 'connected', 'true'].includes(s)) return 'up';
  if (['down', 'error', 'fail', 'failed', 'unhealthy', 'false', 'disconnected'].includes(s)) return 'down';
  return 'unknown';
}

export function parseHealth(body) {
  const c = body?.checks ?? body;
  return {
    db: asStatus(c?.database ?? c?.db),
    redis: asStatus(c?.redis ?? c?.cache),
    uptime: body?.uptime_s ?? body?.uptime ?? null,
    container: body?.container ?? null,
  };
}
