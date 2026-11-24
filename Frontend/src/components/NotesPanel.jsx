import { useEffect, useState } from 'react';
import { api } from '../api/client';

const asList = (b) => (Array.isArray(b) ? b : b?.data ?? b?.notes ?? []);

// Groups the measured list requests by cache result.
function summarize(rows) {
  const groups = {};
  rows.forEach((r) => (groups[r.source] ||= []).push(r.ms));
  return Object.entries(groups).map(([source, list]) => ({
    source,
    count: list.length,
    avg: Math.round(list.reduce((a, b) => a + b, 0) / list.length),
    min: Math.min(...list),
    max: Math.max(...list),
  }));
}

export default function NotesPanel() {
  const [notes, setNotes] = useState([]);
  const [last, setLast] = useState(null); // { cache, ms } of the latest list request
  const [form, setForm] = useState({ title: '', content: '' });
  const [editId, setEditId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const guard = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e.message === 'network error' ? 'Cannot reach the API. Is the stack running?' : e.message);
    } finally {
      setBusy(false);
    }
  };

  const load = async () => {
    const { body, ms, cache } = await api.notes();
    setNotes(asList(body));
    setLast({ cache, ms });
  };

  useEffect(() => { guard(load); }, []);

  const save = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Enter a title.');
    guard(async () => {
      if (editId) await api.updateNote(editId, form);
      else await api.createNote(form);
      setForm({ title: '', content: '' });
      setEditId(null);
      await load(); // after a write the first list is expected to be a MISS
    });
  };

  const edit = (n) => { setEditId(n.id); setForm({ title: n.title || '', content: n.content || '' }); };
  const remove = (n) => {
    if (!window.confirm(`Delete “${n.title}”?`)) return;
    guard(async () => { await api.deleteNote(n.id); await load(); });
  };

  // 20 sequential list requests: the first may be a miss, the rest should be hits.
  const runBatch = (n = 20) =>
    guard(async () => {
      const rows = [];
      for (let i = 0; i < n; i++) {
        try {
          const { ms, cache } = await api.notes();
          rows.push({ source: cache || 'unknown', ms });
        } catch {
          rows.push({ source: 'error', ms: 0 });
        }
      }
      setSummary({ n, rows: summarize(rows) });
    });

  return (
    <section className="card span-2" aria-labelledby="notes-h">
      <div className="row-between" style={{ margin: 0 }}>
        <h2 id="notes-h">My notes</h2>
        {last && (
          <span role="status" className="last">
            List served from Redis? <span className={`src ${last.cache || ''}`}>{last.cache ? last.cache.toUpperCase() : 'unknown'}</span> · {last.ms} ms
          </span>
        )}
      </div>

      <form onSubmit={save} className="form" noValidate>
        <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={255} /></label>
        <label>Content<textarea rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label>
        <div className="actions">
          <button disabled={busy}>{editId ? 'Update note' : 'Add note'}</button>
          {editId && <button type="button" className="ghost" onClick={() => { setEditId(null); setForm({ title: '', content: '' }); }}>Cancel</button>}
          <button type="button" className="ghost" onClick={() => guard(load)} disabled={busy}>Refresh list</button>
          <button type="button" className="ghost" onClick={() => runBatch(20)} disabled={busy}>Run 20 list requests</button>
        </div>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      {summary && (
        <div className="table-wrap">
          <table>
            <caption>Result of {summary.n} list requests</caption>
            <thead><tr><th>Cache</th><th>Count</th><th>Avg ms</th><th>Min</th><th>Max</th></tr></thead>
            <tbody>
              {summary.rows.map((r) => (
                <tr key={r.source}><td><span className={`src ${r.source}`}>{r.source}</span></td><td>{r.count}</td><td>{r.avg}</td><td>{r.min}</td><td>{r.max}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {notes.length === 0 ? (
        <p className="muted" style={{ marginTop: 12 }}>No notes yet.</p>
      ) : (
        <ul className="notes">
          {notes.map((n) => (
            <li key={n.id}>
              <div className="min-w-0">
                <strong>{n.title}</strong>
                {n.content && <p className="muted">{n.content}</p>}
              </div>
              <div className="actions tight">
                <button className="ghost small" onClick={() => edit(n)} disabled={busy}>Edit</button>
                <button className="ghost small" onClick={() => remove(n)} disabled={busy}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
