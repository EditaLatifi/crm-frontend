// src/auth/tokenStore.ts
// In-memory access token store (never trust localStorage for security)
let accessToken: string | null = null;

export function getAccessToken() {
  console.log('[tokenStore] getAccessToken:', accessToken);
  return accessToken;
}

export function setAccessToken(token: string) {
  accessToken = token;
  console.log('[tokenStore] setAccessToken:', token);
}

export function clearAccessToken() {
  accessToken = null;
  console.log('[tokenStore] clearAccessToken');
}

// If you must use localStorage (fallback), wrap with clear comments and centralize logic here.

export function loadTokenFromStorage() {
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('userToken');
    console.log('[tokenStore] loadTokenFromStorage:', accessToken);
  }
}


export function saveTokenToStorage() {
  if (typeof window !== 'undefined' && accessToken) {
    localStorage.setItem('userToken', accessToken);
    console.log('[tokenStore] saveTokenToStorage:', accessToken);
  }
}


export function clearTokenFromStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userToken');
    console.log('[tokenStore] clearTokenFromStorage');
  }
}
