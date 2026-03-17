// src/auth/tokenStore.ts
// In-memory access token store (never trust localStorage for security)
let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

// If you must use localStorage (fallback), wrap with clear comments and centralize logic here.

export function loadTokenFromStorage() {
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('userToken');
  }
}


export function saveTokenToStorage() {
  if (typeof window !== 'undefined' && accessToken) {
    localStorage.setItem('userToken', accessToken);
  }
}


export function clearTokenFromStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userToken');
  }
}
