import { useEffect, useState } from 'react';
import useHealthMonitor from './hooks/useHealthMonitor';
import useAuth from './hooks/useAuth';
import RebootBanner from './components/RebootBanner';
import StatusPanel from './components/StatusPanel';
import AuthPanel from './components/AuthPanel';
import NotesPanel from './components/NotesPanel';
import OutagePanel from './components/OutagePanel';
import RequestLog from './components/RequestLog';

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

  return (
    <div className="page">
      <RebootBanner state={monitor.state} detail={detail} />
      <header className="top">
        <div className="brand">
          <svg className="logo" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#ff7a3d" />
            <g fill="#2a1100"><rect x="6" y="13" width="5" height="5" /><rect x="13" y="13" width="5" height="5" /><rect x="20" y="13" width="5" height="5" /><rect x="13" y="6" width="5" height="5" /></g>
          </svg>
          <div>
            <h1>{page === 'status' ? 'System status' : 'Docker Stack Monitor'}</h1>
            <p>{page === 'status' ? 'Health of the web app, database and Redis' : 'Web app, database and Redis running under docker-compose'}</p>
          </div>
        </div>
        <div className="who">
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
