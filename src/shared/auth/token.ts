export function getToken(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('token') || localStorage.getItem('accessToken');
  } catch { return null; }
}

export function setToken(token: string) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('token', token);
  } catch {}
}

export function clearToken() {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
  } catch {}
}

export function isAuthed(): boolean { return !!getToken(); }

