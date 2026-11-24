import useHealthMonitor from './hooks/useHealthMonitor';
import useAuth from './hooks/useAuth';
import RebootBanner from './components/RebootBanner';
import StatusPanel from './components/StatusPanel';
import AuthPanel from './components/AuthPanel';
import NotesPanel from './components/NotesPanel';
import OutagePanel from './components/OutagePanel';
import RequestLog from './components/RequestLog';

export default function App() {
  const monitor = useHealthMonitor(1000);
  const auth = useAuth();

  const failing = [monitor.snapshot?.db === 'down' && 'database', monitor.snapshot?.redis === 'down' && 'Redis'].filter(Boolean);
  const detail = monitor.state === 'degraded' && failing.length ? `(${failing.join(' and ')} not responding)` : '';

  return (
    <div className="page">
      <RebootBanner state={monitor.state} detail={detail} />
      <header className="top">
        <div>
          <h1>Docker Stack Monitor</h1>
          <p>Web app, database and Redis running under docker-compose</p>
        </div>
        {auth.token && (
          <div className="who">
            <span>{auth.user?.name || auth.user?.email || 'Signed in'}</span>
            <button className="ghost small" onClick={auth.logout}>Log out</button>
          </div>
        )}
      </header>
      <main className="grid">
        <StatusPanel monitor={monitor} />
        {auth.token ? <NotesPanel /> : <AuthPanel auth={auth} />}
        <OutagePanel monitor={monitor} />
        <RequestLog />
      </main>
    </div>
  );
}
