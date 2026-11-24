import { downloadCsv } from '../utils/csv';
import { formatTime } from '../utils/format';

export default function OutagePanel({ monitor }) {
  const { events, clearEvents } = monitor;
  const exportCsv = () =>
    downloadCsv('outage-events.csv',
      events.map((e) => ({ time: new Date(e.at).toISOString(), event: e.type === 'down' ? `down (${e.state})` : 'recovered', downtime_ms: e.downtimeMs ?? '' })),
      [{ key: 'time', label: 'time' }, { key: 'event', label: 'event' }, { key: 'downtime_ms', label: 'downtime_ms' }]);

  return (
    <section className="card span-2" aria-labelledby="out-h">
      <div className="row-between" style={{ margin: 0 }}>
        <h2 id="out-h">Outage timeline</h2>
        <div className="actions tight">
          <button className="ghost small" onClick={exportCsv} disabled={!events.length}>Export CSV</button>
          <button className="ghost small" onClick={clearEvents} disabled={!events.length}>Clear</button>
        </div>
      </div>
      <p className="hint">Stop a service from a terminal (for example <span className="mono">docker compose kill backend</span>) and watch how long it stays down before Docker restarts it.</p>
      {events.length === 0 ? (
        <p className="muted" style={{ marginTop: 10 }}>No outage recorded yet.</p>
      ) : (
        <ol className="timeline">
          {events.map((e) => (
            <li key={e.id} className={e.type}>
              <span className="mono">{formatTime(e.at)}</span>
              {e.type === 'down'
                ? e.state === 'degraded' ? ' Health check failing (503): database or Redis is down' : ' Server not responding'
                : ` Recovered after ${(e.downtimeMs / 1000).toFixed(1)} s`}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
