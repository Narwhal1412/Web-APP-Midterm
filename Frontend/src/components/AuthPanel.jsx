import { useState } from 'react';

export default function AuthPanel({ auth }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') await auth.login({ email: f.email, password: f.password });
      else await auth.register(f);
    } catch (ex) {
      setError(ex.message === 'network error' ? 'Cannot reach the API. Is the stack running?' : ex.message);
      setBusy(false);
    }
  };

  return (
    <section className="card span-2" aria-labelledby="auth-h">
      <h2 id="auth-h">{mode === 'login' ? 'Log in' : 'Create an account'}</h2>
      <form onSubmit={submit} className="form" noValidate>
        {mode === 'register' && (
          <label>Name<input value={f.name} onChange={set('name')} autoComplete="name" required /></label>
        )}
        <label>Email<input type="email" value={f.email} onChange={set('email')} autoComplete="email" required /></label>
        <label>Password<input type="password" value={f.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}</button>
          <button type="button" className="ghost" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Need an account?' : 'I already have one'}
          </button>
        </div>
      </form>
    </section>
  );
}
