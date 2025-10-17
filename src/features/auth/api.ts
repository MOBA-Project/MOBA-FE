// Auth API client aligned to Swagger `/auth/*` with graceful fallback for dev

import { apiJson, apiFetch } from 'shared/api/fetcher';

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
  try {
    const data = await apiJson(`${'/auth/protected'}`, { headers: authHeaders() });
    return { id: (data as any).id, nickname: (data as any).nickname };
  } catch {
    const data = await apiJson(`${'/users/protected'}`, { headers: authHeaders() });
    return { id: (data as any).id, nickname: (data as any).nick || (data as any).nickname };
  }
}

export async function login(payload: { id: string; password: string }) {
  const data = await apiJson(`${'/auth/login'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  // Store access token for subsequent calls
  if (data?.accessToken && typeof localStorage !== 'undefined') localStorage.setItem('token', data.accessToken);
  return data;
}

export async function signup(payload: { id: string; password: string; nickname: string }) {
  return apiJson(`${'/auth/signup'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateProfile(payload: { nickname?: string; password?: string; currentPassword?: string }) {
  // Prefer /auth/update
  try {
    return await apiJson(`${'/auth/update'}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ nickname: payload.nickname, password: payload.password, currentPassword: payload.currentPassword }),
    });
  } catch {
    // Fallback /users/update expects { nick, pw, currentPw }
    const legacy = await apiJson(`${'/users/update'}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ nick: payload.nickname, pw: payload.password, currentPw: payload.currentPassword }),
    });
    return legacy;
  }
}

export async function logout() {
  const csrf = getCookie('csrfToken');
  const res = await apiFetch(`${'/auth/logout'}`, {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrf, ...authHeaders() },
  });
  // Regardless of server, clear local token
  if (typeof localStorage !== 'undefined') localStorage.removeItem('token');
  return res.ok;
}

export async function deleteAccount() {
  const csrf = getCookie('csrfToken');
  const del = await apiJson(`${'/auth/delete'}`, {
    method: 'DELETE',
    headers: { 'X-CSRF-Token': csrf, ...authHeaders() },
  });
  if (typeof localStorage !== 'undefined') localStorage.removeItem('token');
  return del;
}

export async function refreshAccessToken() {
  const csrf = getCookie('csrfToken');
  const data = await apiJson(`${'/auth/refresh'}`, {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrf, 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  if (data?.accessToken && typeof localStorage !== 'undefined') localStorage.setItem('token', data.accessToken);
  return data;
}

export async function checkIdAvailable(id: string) {
  try {
    await apiJson(`${'/auth/check-id'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return { available: true };
  } catch (e: any) {
    if (e?.status === 409) return { available: false };
    throw e;
  }
}
