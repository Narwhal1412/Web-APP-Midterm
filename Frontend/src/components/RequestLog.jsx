import { requestLog, useRequestLog } from '../lib/requestLog';
import { downloadCsv } from '../utils/csv';
import { formatTime } from '../utils/format';

export default function RequestLog() {
  const entries = useRequestLog();
  const columns = [
    { key: 'time', label: 'time' }, { key: 'method', label: 'method' }, { key: 'path', label: 'path' },
    { key: 'status', label: 'status' }, { key: 'source', label: 'source' }, { key: 'ms', label: 'ms' },
  ];
  const exportCsv = () =>
    downloadCsv('requests.csv', entries.map((e) => ({ ...e, time: new Date(e.ts).toISOString() })), columns);

  return (
    <section className="card span-2" aria-labelledby="log-h">
      <div className="row-between">
        <h2 id="log-h">Request log</h2>
        <div className="actions tight">
          <button className="ghost small" onClick={exportCsv} disabled={!entries.length}>Export CSV</button>
          <button className="ghost small" onClick={requestLog.clear} disabled={!entries.length}>Clear</button>
        </div>
      </div>
      {entries.length === 0 ? (
        <p className="muted">Requests you trigger appear here with their measured latency.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Time</th><th>Request</th><th>Status</th><th>Cache</th><th>ms</th></tr></thead>
            <tbody>
              {entries.slice(0, 50).map((e) => (
                <tr key={e.id} className={e.ok ? '' : 'bad'}>
                  <td className="mono">{formatTime(e.ts)}</td>
                  <td className="mono">{e.method} {e.path}</td>
                  <td>{e.status || e.error}</td>
                  <td>{e.source ? <span className={`src ${e.source}`}>{e.source}</span> : '–'}</td>
                  <td>{e.ms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
