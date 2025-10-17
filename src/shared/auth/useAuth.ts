import { useEffect, useState } from 'react';
import { getToken, clearToken } from './token';

type User = { id: string; nick: string } | null;

export function useAuth() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const t = getToken();
        if (!t) { if (mounted) setUser(null); return; }
        const { apiJson } = await import('shared/api/fetcher');
        let me: any;
        try { me = await apiJson('/auth/protected'); }
        catch { me = await apiJson('/users/protected'); }
        if (mounted) setUser({ id: me.id, nick: me.nickname || me.nick });
      } catch { if (mounted) setUser(null); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  return {
    user,
    loading,
    isAuthed: !!user,
    logout: () => { clearToken(); setUser(null); },
    setUser,
  };
}

