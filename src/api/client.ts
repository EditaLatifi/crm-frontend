// src/api/client.ts
import { getAccessToken, setAccessToken, clearAccessToken } from '../auth/tokenStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 35s — enough for Render/Railway free tier cold start (~30s)
const TIMEOUT_MS = 35000;

export type ApiError = {
  status: number;
  message: string;
};

async function doFetch(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, credentials: 'include', signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw { status: 408, message: 'Der Server startet gerade hoch. Bitte einen Moment warten...' };
    }
    throw err;
  }
}

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}, retryOn401 = true): Promise<any> {
  let token = getAccessToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const url = typeof input === 'string' && /^https?:\/\//.test(input) ? input : `${API_BASE_URL}${input}`;

  let res = await doFetch(url, { ...init, headers });

  if (res.status === 401 && retryOn401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      token = getAccessToken();
      headers.set('Authorization', `Bearer ${token}`);
      res = await doFetch(url, { ...init, headers });
    } else {
      clearAccessToken();
      throw { status: 401, message: 'Sitzung abgelaufen. Bitte erneut anmelden.' };
    }
  }

  if (!res.ok) {
    let message = 'Unbekannter Fehler';
    try { message = (await res.json()).message || message; } catch {}
    throw { status: res.status, message };
  }
  if (res.status === 204) return null;
  return res.json();
}

async function refreshToken(): Promise<boolean> {
  try {
    const token = getAccessToken();
    if (!token) return false;
    const url = `${API_BASE_URL}/auth/refresh`;
    const res = await doFetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (!data?.access_token) return false;
    setAccessToken(data.access_token);
    // Persist refreshed token
    const { saveTokenToStorage } = await import('../auth/tokenStore');
    saveTokenToStorage();
    return true;
  } catch {
    return false;
  }
}

// ─── Simple GET cache + request deduplication ───
const _cache = new Map<string, { data: any; ts: number }>();
const _inflight = new Map<string, Promise<any>>();
const CACHE_TTL = 30_000; // 30 seconds

function cachedGet(url: string): Promise<any> {
  const now = Date.now();
  const hit = _cache.get(url);
  if (hit && now - hit.ts < CACHE_TTL) return Promise.resolve(hit.data);

  // Deduplicate concurrent requests for the same URL
  const existing = _inflight.get(url);
  if (existing) return existing;

  const req = fetchWithAuth(url, { method: 'GET' }).then(data => {
    _cache.set(url, { data, ts: Date.now() });
    _inflight.delete(url);
    return data;
  }).catch(err => {
    _inflight.delete(url);
    throw err;
  });
  _inflight.set(url, req);
  return req;
}

function invalidateCache(prefix?: string) {
  if (!prefix) { _cache.clear(); return; }
  for (const key of _cache.keys()) {
    if (key.includes(prefix)) _cache.delete(key);
  }
}

export const api = {
  get: (url: string) => cachedGet(url),
  post: (url: string, body?: any) => {
    invalidateCache();
    return fetchWithAuth(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  },
  patch: (url: string, body?: any) => {
    invalidateCache();
    return fetchWithAuth(url, { method: 'PATCH', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  },
  delete: (url: string) => {
    invalidateCache();
    return fetchWithAuth(url, { method: 'DELETE' });
  },
  upload: (url: string, formData: FormData) => {
    invalidateCache();
    return fetchWithAuth(url, { method: 'POST', body: formData });
  },
  invalidateCache,
};

// Unauthenticated health ping — used for keep-alive
export async function ping(): Promise<boolean> {
  try {
    const url = `${API_BASE_URL}/health`;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    await fetch(url, { signal: controller.signal });
    clearTimeout(t);
    return true;
  } catch {
    return false;
  }
}

export async function login(email: string, password: string) {
  // Login has its own retry: try once, if cold start (408) wait 3s and try again
  try {
    return await api.post('/auth/login', { email, password });
  } catch (err: any) {
    if (err.status === 408) {
      // Server was sleeping — it's awake now, retry once
      await new Promise(r => setTimeout(r, 2000));
      return await api.post('/auth/login', { email, password });
    }
    throw err;
  }
}

export async function getMe() {
  return api.post('/users/me', {});
}
