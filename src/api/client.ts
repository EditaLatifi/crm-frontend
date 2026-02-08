// src/api/client.ts
import { getAccessToken, setAccessToken, clearAccessToken} from '../auth/tokenStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type ApiError = {
  status: number;
  message: string;
};

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}, retry = true): Promise<any> {
  let token = getAccessToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let url = typeof input === 'string' && /^https?:\/\//.test(input) ? input : `${API_BASE_URL}${input}`;
  // Debug log for token and headers
  console.log('fetchWithAuth', { url, token, headers: Object.fromEntries(headers.entries()) });
  let res = await fetch(url, { ...init, headers, credentials: 'include' });
  if (res.status === 401 && retry) {
    // Try refresh
    const refreshed = await refreshToken();
    if (refreshed) {
      token = getAccessToken();
      headers.set('Authorization', `Bearer ${token}`);
      res = await fetch(url, { ...init, headers, credentials: 'include' });
    } else {
      clearAccessToken();
      throw { status: 401, message: 'Session expired' };
    }
  }
  if (!res.ok) {
    let message = 'Unknown error';
    try { message = (await res.json()).message || message; } catch {}
    throw { status: res.status, message };
  }
  if (res.status === 204) return null;
  return res.json();
}

async function refreshToken(): Promise<boolean> {
  // No refresh token logic; always fail refresh
  return false;
}

export const api = {
  get: (url: string) => fetchWithAuth(url, { method: 'GET' }),
  post: (url: string, body?: any) => fetchWithAuth(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  patch: (url: string, body?: any) => fetchWithAuth(url, { method: 'PATCH', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  delete: (url: string) => fetchWithAuth(url, { method: 'DELETE' }),
};

// Typed helpers (example)
export async function login(email: string, password: string) {
  return api.post('/auth/login', { email, password });
}

export async function getMe(email: string) {
  return api.post('/api/users/me', {});
}
