import { useState } from 'react';

export default function AuthPanel({ auth }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (mode === 'register' && f.password !== f.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') await auth.login({ email: f.email, password: f.password });
      else await auth.register({ name: f.name, email: f.email, password: f.password, password_confirmation: f.confirm });
    } catch (ex) {
      setError(ex.message === 'network error' ? 'Cannot reach the API. Is the stack running?' : ex.message);
      setBusy(false);
    }
  };

  return (
    <section className="auth" aria-labelledby="auth-h">
      <aside className="auth-side">
        <p className="auth-title">Notes, served from cache when they can be.</p>
        <p className="muted">Every list request shows where the answer came from, and how long it took.</p>
        <ul className="legend">
          <li><span className="src hit">hit</span> read from Redis</li>
          <li><span className="src miss">miss</span> read from the database</li>
        </ul>
      </aside>
      <div className="auth-form">
      <h2 id="auth-h">{mode === 'login' ? 'Log in' : 'Create an account'}</h2>
      <form onSubmit={submit} className="form" noValidate>
        {mode === 'register' && (
          <label>Name<input value={f.name} onChange={set('name')} autoComplete="name" required /></label>
        )}
        <label>Email<input type="email" value={f.email} onChange={set('email')} autoComplete="email" required /></label>
        <label>Password<input type="password" value={f.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>
        {mode === 'register' && (
          <label>Confirm password<input type="password" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" required /></label>
        )}
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}</button>
          <button type="button" className="ghost" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setF({ ...f, confirm: '' }); }}>
            {mode === 'login' ? 'Need an account?' : 'I already have one'}
          </button>
        </div>
      </form>
      </div>
    </section>
  );
}
