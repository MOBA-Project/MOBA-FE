// Auth API client with graceful fallback to legacy /users endpoints

const BASE_URL = 'http://localhost:5001';

function getToken() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('token');
}

function authHeaders(extra?: Record<string, string>) {
  const token = getToken();
  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : '';
}

export async function protectedInfo() {
  // Try new /auth/protected
  let res = await fetch(`${BASE_URL}/auth/protected`, { headers: authHeaders() });
  if (res.ok) {
    const data = await res.json();
    return { id: data.id, nickname: data.nickname };
  }
  // Fallback to legacy /users/protected
  res = await fetch(`${BASE_URL}/users/protected`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Not authenticated');
  const data = await res.json();
  return { id: data.id, nickname: data.nick || data.nickname };
}

export async function updateProfile(payload: { nickname?: string; password?: string; currentPassword?: string }) {
  // Prefer /auth/update
  const tryAuth = await fetch(`${BASE_URL}/auth/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ nickname: payload.nickname, password: payload.password, currentPassword: payload.currentPassword }),
  });
  if (tryAuth.ok) return tryAuth.json();

  // Fallback /users/update expects { nick, pw, currentPw }
  const legacy = await fetch(`${BASE_URL}/users/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ nick: payload.nickname, pw: payload.password, currentPw: payload.currentPassword }),
  });
  if (!legacy.ok) throw new Error(await legacy.text());
  return legacy.json();
}

export async function logout() {
  const csrf = getCookie('csrfToken');
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrf, ...authHeaders() },
  });
  // Regardless of server, clear local token
  if (typeof localStorage !== 'undefined') localStorage.removeItem('token');
  return res.ok;
}

export async function deleteAccount() {
  const csrf = getCookie('csrfToken');
  const res = await fetch(`${BASE_URL}/auth/delete`, {
    method: 'DELETE',
    headers: { 'X-CSRF-Token': csrf, ...authHeaders() },
  });
  if (!res.ok) throw new Error(await res.text());
  if (typeof localStorage !== 'undefined') localStorage.removeItem('token');
  return res.json();
}

export async function refreshAccessToken() {
  const csrf = getCookie('csrfToken');
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrf, 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  if (data?.accessToken && typeof localStorage !== 'undefined') localStorage.setItem('token', data.accessToken);
  return data;
}

export async function checkIdAvailable(id: string) {
  const res = await fetch(`${BASE_URL}/auth/check-id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  if (res.status === 409) return { available: false };
  if (!res.ok) throw new Error(await res.text());
  return { available: true };
}

