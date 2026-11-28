import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/client';
import { useShowCache } from '../lib/settings';
import Logo from './Logo';

const Ico = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const I = {
  notes: <Ico><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4" /><path d="M9 12h7M9 16h5" /></Ico>,
  search: <Ico><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></Ico>,
  grid: <Ico><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></Ico>,
  list: <Ico><path d="M4 6h16M4 12h16M4 18h16" /></Ico>,
  plus: <Ico><path d="M12 5v14M5 12h14" /></Ico>,
  edit: <Ico><path d="M4 20h4L19 9l-4-4L4 16z" /></Ico>,
  del: <Ico><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></Ico>,
  warn: <Ico><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.5" /></Ico>,
};

// Notes per page.
// Phone / narrow screens: chosen by the two layout buttons (list 20, grid 5).
// Desktop: as many notes as fill the visible area, then the next page starts.
const PAGE_SIZE = { list: 20, grid: 5 };
const DESKTOP_MIN_WIDTH = 900;
const ROW_H = 150;         // note card min height
const GAP = 14;            // gap between cards
const PAGER_H = 72;        // the fixed pager bar at the bottom
const FALLBACK_TOP = 180;  // where the list starts if it is not on screen yet

// Notes that fit between the top of the list and the pager bar.
function fitCount(layout) {
  const w = window.innerWidth, h = window.innerHeight;
  if (w < DESKTOP_MIN_WIDTH) return PAGE_SIZE[layout];
  const el = document.querySelector('.masonry, .stack');
  const top = el ? el.getBoundingClientRect().top + window.scrollY : FALLBACK_TOP;
  const rows = Math.max(1, Math.floor((h - top - PAGER_H - 8 + GAP) / (ROW_H + GAP)));
  if (layout === 'list') return rows;
  const cols = Math.max(1, Math.min(4, Math.floor((w - 220 - 44 + GAP) / (220 + GAP))));
  return cols * rows;
}

function usePageSize(layout, key) {
  const [size, setSize] = useState(() => fitCount(layout));
  useEffect(() => {
    const update = () => setSize(fitCount(layout));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [layout, key]);
  return size;
}

const asList = (b) => (Array.isArray(b) ? b : b?.data ?? b?.notes ?? []);
// Shows the backend's validation message (HTTP 422) when there is one, e.g. "The content field is required."
const errText = (e) => {
  if (e.status === 422) {
    const first = Object.values(e.body?.errors || {}).flat()[0];
    return first || e.body?.message || 'Please check the form.';
  }
  return e.status ? `Request failed (${e.status}).` : e.message === 'network error' ? 'Cannot reach the API.' : e.message;
};

export default function NotesPanel() {
  const [showCache] = useShowCache();
  const [pageNo, setPageNo] = useState(1);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [last, setLast] = useState(null);
  const [query, setQuery] = useState('');
  const [layout, setLayout] = useState(() => { try { return localStorage.getItem('notes-layout') === 'list' ? 'list' : 'grid'; } catch { return 'grid'; } });
  const pageSize = usePageSize(layout, `${notes.length > 0}-${showCache}-${loading}`);
  const [modal, setModal] = useState(null); // { note, edit }
  const [form, setForm] = useState({ title: '', content: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [noContent, setNoContent] = useState(false);
  const contentRef = useRef(null);

  const pickLayout = (l) => { setLayout(l); try { localStorage.setItem('notes-layout', l); } catch { /* ignore */ } };

  const load = async () => {
    setLoading(true); setLoadError('');
    try {
      const { body, ms, cache } = await api.notes();
      setNotes(asList(body)); setLast({ cache, ms });
    } catch (e) { setLoadError(errText(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? notes.filter((n) => `${n.title} ${n.content}`.toLowerCase().includes(q)) : notes;
  }, [notes, query]);

  // Paging: fills the screen on desktop; list 20 / grid 5 on phones.
  const pages = Math.max(1, Math.ceil(shown.length / pageSize));
  const current = Math.min(pageNo, pages);
  const visible = shown.slice((current - 1) * pageSize, current * pageSize);
  useEffect(() => { setPageNo(1); }, [query, layout]);

  const open = (note, edit) => { setError(''); setNoContent(false); setForm({ title: note?.title || '', content: note?.content || '' }); setModal({ note, edit }); };
  const close = () => setModal(null);

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Enter a title.');
    if (!form.content.trim()) { setNoContent(true); contentRef.current?.focus(); return; } // no text message, just highlight the field
    setBusy(true); setError('');
    try {
      if (modal.note) await api.updateNote(modal.note.id, form); else await api.createNote(form);
      close(); await load();
    } catch (ex) { setError(errText(ex)); } finally { setBusy(false); }
  };
  const remove = async (n) => {
    if (!window.confirm(`Delete “${n.title}”?`)) return;
    try { await api.deleteNote(n.id); close(); await load(); } catch (ex) { setLoadError(errText(ex)); }
  };

  const Actions = ({ n }) => (
    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
      <button className="icon-btn" title="Edit" aria-label={`Edit ${n.title}`} onClick={() => open(n, true)}>{I.edit}</button>
      <button className="icon-btn danger" title="Delete" aria-label={`Delete ${n.title}`} onClick={() => remove(n)}>{I.del}</button>
    </div>
  );

  return (
    <div className="shell">
      <aside className="side">
        <nav>
          <button className="nav on"><Logo className="nav-logo" />All notes</button>
        </nav>
      </aside>

      <section className="content" aria-label="Notes">
        <div className="toolbar">
          <label className="search">{I.search}<input type="search" placeholder="Search notes" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
          <div className="seg" role="group" aria-label="Layout">
            <button aria-label="Grid" aria-pressed={layout === 'grid'} onClick={() => pickLayout('grid')}>{I.grid}</button>
            <button aria-label="List" aria-pressed={layout === 'list'} onClick={() => pickLayout('list')}>{I.list}</button>
          </div>
          <button className="primary" onClick={() => open(null, true)}>{I.plus}New note</button>
        </div>
        {showCache && last && <p className="foot" role="status">List served from <span className={`src ${last.cache || ''}`}>{last.cache ? last.cache.toUpperCase() : 'unknown'}</span> in {last.ms} ms</p>}

        {loading ? (
          <div className="state"><p className="muted">Loading notes…</p></div>
        ) : loadError ? (
          <div className="state" role="alert">
            <span className="state-ico">{I.warn}</span>
            <strong>We could not load your notes</strong>
            <p className="muted">{loadError}</p>
            <button className="outline" onClick={load}>Try again</button>
          </div>
        ) : shown.length === 0 ? (
          <div className="state">
            <strong>{query ? 'No notes match your search' : 'No notes yet'}</strong>
            {!query && <button className="outline" onClick={() => open(null, true)}>Create your first note</button>}
          </div>
        ) : (
          <>
            <div className={layout === 'grid' ? 'masonry' : 'stack'}>
              {visible.map((n) => (
                <article key={n.id} className="note" tabIndex={0} onClick={() => open(n, false)} onKeyDown={(e) => e.key === 'Enter' && open(n, false)}>
                  <h3>{n.title}</h3>
                  <p>{n.content || 'No content'}</p>
                  <Actions n={n} />
                </article>
              ))}
            </div>
            {pages > 1 && (
              <nav className="pager" aria-label="Pages">
                <button className="ghost" disabled={current === 1} onClick={() => setPageNo(current - 1)}>← Prev</button>
                <span className="pager-info"><b>{current}</b> / {pages}</span>
                <button className="primary" disabled={current === pages} onClick={() => setPageNo(current + 1)}>Next →</button>
              </nav>
            )}
          </>
        )}
      </section>

      {modal && (
        <div className="overlay" onMouseDown={close}>
          <div className="dialog" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            {modal.edit ? (
              <form onSubmit={save} className="form" noValidate>
                <h2>{modal.note ? 'Edit note' : 'New note'}</h2>
                <input autoFocus placeholder="Title" aria-label="Title" maxLength={255} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <textarea ref={contentRef} className={noContent ? 'invalid' : ''} rows={8} placeholder="Take a note…" aria-label="Content" aria-invalid={noContent} value={form.content} onChange={(e) => { setNoContent(false); setForm({ ...form, content: e.target.value }); }} />
                {error && <p className="error" role="alert">{error}</p>}
                <div className="actions end"><button type="button" className="ghost" onClick={close}>Cancel</button><button className="primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button></div>
              </form>
            ) : (
              <>
                <h2>{modal.note.title}</h2>
                <p className="detail-text">{modal.note.content || 'No content'}</p>
                <div className="actions end">
                  <button className="ghost" onClick={() => remove(modal.note)}>Delete</button>
                  <button className="ghost" onClick={close}>Close</button>
                  <button className="primary" onClick={() => open(modal.note, true)}>Edit</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
