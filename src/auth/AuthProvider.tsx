"use client";
// src/auth/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, getMe } from '../api/client';
import { getAccessToken, setAccessToken, clearAccessToken, loadTokenFromStorage, saveTokenToStorage, clearTokenFromStorage, saveUserToStorage, loadUserFromStorage } from './tokenStore';

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
};

interface AuthContextType {
  user: User | null;
  role: 'ADMIN' | 'USER' | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeToken(token: string): any | null {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp) return false;
  return payload.exp < Math.floor(Date.now() / 1000);
}

function userFromToken(token: string): Partial<User> | null {
  const payload = decodeToken(token);
  if (!payload?.sub) return null;
  return { id: payload.sub, role: payload.role };
}

// ── Synchronous pre-init (runs when the JS module is first evaluated, before any render) ──
// This eliminates the loading-spinner flash for users who are already logged in.
let _preUser: User | null = null;
let _preToken: string | null = null;

if (typeof window !== 'undefined') {
  loadTokenFromStorage();
  const tok = getAccessToken();
  if (tok && !isTokenExpired(tok)) {
    _preToken = tok;
    // Try cached full profile first, fall back to minimal JWT data
    _preUser = loadUserFromStorage() || (userFromToken(tok) as User | null);
  } else {
    clearAccessToken();
    clearTokenFromStorage();
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with null to match SSR, then hydrate from localStorage after mount
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchProfile() {
    try {
      const me = await getMe();
      if (me?.id) {
        setUser(me);
        saveUserToStorage(me);
      }
    } catch {
      // Keep cached user — stays logged in
    }
  }

  useEffect(() => {
    // Runs only on client after hydration — no SSR mismatch
    if (_preUser) setUser(_preUser);
    if (_preToken) {
      setAccessTokenState(_preToken);
      fetchProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiLogin(email, password);

      if (!data?.access_token) {
        setError('Ungültige Anmeldedaten');
        return;
      }

      setAccessToken(data.access_token);
      saveTokenToStorage();
      setAccessTokenState(data.access_token);

      if (data.user?.id) {
        setUser(data.user);
        saveUserToStorage(data.user);
      } else {
        const basic = userFromToken(data.access_token);
        if (basic) setUser(basic as User);
        fetchProfile();
      }
    } catch (err: any) {
      if (err.status === 408) {
        setError('Der Server startet gerade hoch. Bitte einen Moment warten und erneut versuchen.');
      } else if (err.status === 401 || err.message?.toLowerCase().includes('invalid')) {
        setError('Ungültige E-Mail-Adresse oder Passwort');
      } else {
        setError(err.message || 'Anmeldung fehlgeschlagen');
      }
      setUser(null);
      clearAccessToken();
      clearTokenFromStorage();
      setAccessTokenState(null);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    clearAccessToken();
    clearTokenFromStorage();
    setAccessTokenState(null);
    setError(null);
  }

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, accessToken, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
