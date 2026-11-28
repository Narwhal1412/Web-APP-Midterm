import { useState } from 'react';
import ServiceCard from './ServiceCard';
import { api } from '../api/client';
import { parseHealth } from '../utils/health';
import { formatDuration } from '../utils/format';

export default function StatusPanel({ monitor }) {
  const { state, snapshot } = monitor;
  const [check, setCheck] = useState(null);
  const [busy, setBusy] = useState(false);

  // The web service is "up" as long as it answers, even with 503 (a dependency is down).
  const web = state === null ? 'unknown' : state === 'down' ? 'down' : 'up';
  const dep = (s) => (web === 'up' ? s || 'unknown' : 'unknown');

  // Manual check: same endpoint as the poller, but logged by the API client.
  const runCheck = async () => {
    setBusy(true);
    try {
      const { status, ms, body } = await api.health({ log: true });
      setCheck({ ok: true, status, ms, parsed: parseHealth(body) });
    } catch (e) {
      setCheck({ ok: false, status: e.status || 0, ms: e.ms, message: e.message, parsed: e.body ? parseHealth(e.body) : null });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="span-2" aria-labelledby="status-h">
      <div className="row-between" style={{ margin: 0 }}>
        <h2 id="status-h">Service status</h2>
        <button onClick={runCheck} disabled={busy}>{busy ? 'Checking…' : 'Check health'}</button>
      </div>
      {check && (
        <p className={`check ${check.ok ? 'ok' : 'fail'}`} role="status">
          GET /api/health → <strong>{check.status || 'no response'}</strong> in {check.ms} ms
          {check.parsed && ` · database: ${check.parsed.db}, redis: ${check.parsed.redis}`}
          {!check.ok && !check.status && ` (${check.message})`}
        </p>
      )}
      <div className="cards">
        <ServiceCard name="Web / API" hint="Backend service behind nginx" status={web}
          rows={[
            ['Container', web === 'up' ? snapshot?.container : '–'],
            ['Uptime', web === 'up' && snapshot?.uptime != null ? formatDuration(snapshot.uptime * 1000) : '–'],
          ]} />
        <ServiceCard name="Database" hint="Source of truth" status={dep(snapshot?.db)} rows={[]} />
        <ServiceCard name="Redis" hint="Cache for the notes list" status={dep(snapshot?.redis)} rows={[]} />
      </div>
    </section>
  );
}
