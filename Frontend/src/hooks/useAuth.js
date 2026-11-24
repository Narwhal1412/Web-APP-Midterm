import { useEffect, useState } from 'react';
import { api, tokenStore } from '../api/client';

export default function useAuth() {
  const [token, setToken] = useState(tokenStore.get());
  const [user, setUser] = useState(null);

  // Restore the user after a page reload.
  useEffect(() => {
    if (!tokenStore.get()) return;
    api.me().then(({ body }) => setUser(body?.data ?? body)).catch(() => {});
  }, []);

  // Any 401 from the API means the token is no longer valid.
  useEffect(() => {
    const expired = () => {
      tokenStore.clear();
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:expired', expired);
    return () => window.removeEventListener('auth:expired', expired);
  }, []);

  const finish = ({ body }) => {
    const t = body?.token ?? body?.access_token;
    if (!t) throw new Error('The server did not return a token.');
    tokenStore.set(t);
    setToken(t);
    setUser(body.user ?? null);
  };

  return {
    token,
    user,
    login: async (p) => finish(await api.login(p)),
    register: async (p) => finish(await api.register(p)),
    logout: async () => {
      try {
        await api.logout();
      } catch {
        /* the local logout below is enough */
      }
      tokenStore.clear();
      setToken(null);
      setUser(null);
    },
  };
}
