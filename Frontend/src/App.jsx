import { useEffect, useState } from 'react';
import useHealthMonitor from './hooks/useHealthMonitor';
import useAuth from './hooks/useAuth';
import RebootBanner from './components/RebootBanner';
import StatusPanel from './components/StatusPanel';
import AuthPanel from './components/AuthPanel';
import NotesPanel from './components/NotesPanel';
import OutagePanel from './components/OutagePanel';
import RequestLog from './components/RequestLog';
import BackgroundPicker from './components/BackgroundPicker';
import Logo from './components/Logo';

const fromHash = () => (window.location.hash === '#status' ? 'status' : 'main');

export default function App() {
  const monitor = useHealthMonitor(5000);
  const auth = useAuth();
  const [page, setPage] = useState(fromHash);

  // The hash is the page: the browser's Back button works too.
  useEffect(() => {
    const onHash = () => setPage(fromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const go = (to) => { window.location.hash = to === 'status' ? 'status' : ''; };

  const failing = [monitor.snapshot?.db === 'down' && 'database', monitor.snapshot?.redis === 'down' && 'Redis'].filter(Boolean);
  const detail = monitor.state === 'degraded' && failing.length ? `(${failing.join(' and ')} not responding)` : '';

  const inApp = page === 'main' && auth.token;

  if (inApp) {
    return (
      <div className="app">
        <RebootBanner state={monitor.state} detail={detail} />
        <header className="appbar">
          <div className="brand">
            <Logo className="brand-ico" />
            <b>Notes</b>
          </div>
          <div className="who">
            <BackgroundPicker />
            <button className="ghost status-link" aria-label="System status" onClick={() => go('status')}><span className={`dot ${monitor.state || ''}`} aria-hidden="true" /><span className="lbl">System status</span></button>
            <span className="avatar" title={auth.user?.email || ''} aria-hidden="true">{(auth.user?.name || auth.user?.email || '?')[0].toUpperCase()}</span>
            <button className="ghost logout-btn" aria-label="Log out" onClick={auth.logout}>
              <svg className="bg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
              <span className="lbl">Log out</span>
            </button>
          </div>
        </header>
        <NotesPanel />
      </div>
    );
  }

  return (
    <div className="page">
      <RebootBanner state={monitor.state} detail={detail} />
      <header className="top">
        <div className="brand">
          <Logo className="logo" />
          <div>
            <h1>{page === 'status' ? 'System status' : 'Notes App'}</h1>
            <p>{page === 'status' ? 'Health of the web app, database and Redis' : 'Create, edit and manage your notes'}</p>
          </div>
        </div>
        <div className="who">
          <BackgroundPicker />
          {page === 'status' ? (
            <button className="ghost" onClick={() => go('main')}>← Back</button>
          ) : (
            <>
              {auth.token && <span>{auth.user?.name || auth.user?.email || 'Signed in'}</span>}
              <button className="ghost status-link" onClick={() => go('status')}>
                <span className={`dot ${monitor.state || ''}`} aria-hidden="true" />
                System status
              </button>
              {auth.token && <button className="ghost small" onClick={auth.logout}>Log out</button>}
            </>
          )}
        </div>
      </header>

      {page === 'status' ? (
        <main className="grid">
          <StatusPanel monitor={monitor} />
          <OutagePanel monitor={monitor} />
          <RequestLog />
        </main>
      ) : auth.token ? (
        <main className="grid"><NotesPanel /></main>
      ) : (
        <AuthPanel auth={auth} />
      )}
    </div>
  );
}
