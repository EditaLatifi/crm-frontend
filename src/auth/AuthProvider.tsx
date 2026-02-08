"use client";
// src/auth/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMe, login as apiLogin } from '../api/client';
import { getAccessToken, setAccessToken, clearAccessToken, loadTokenFromStorage, saveTokenToStorage, clearTokenFromStorage} from './tokenStore';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, try to load token from storage (if fallback is used)
  useEffect(() => {
    loadTokenFromStorage();
    const token = getAccessToken();
    setAccessTokenState(token || null);
    bootstrapUser();
    setLoading(false);
    // eslint-disable-next-line
  }, []);

  async function bootstrapUser(email?: string) {
    setLoading(true);
    setError(null);
    try {
      if (!email) {
        setUser(null);
        setLoading(false);
        return;
      }
      const me = await getMe(email);
      setUser(me);
    } catch (err: any) {
      setUser(null);
      if (err.status === 401) clearAccessToken();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiLogin(email, password);
      console.log('[AuthProvider] login response:', data);
      if (data.access_token) {
        setAccessToken(data.access_token);
        saveTokenToStorage();
        setAccessTokenState(data.access_token);
        console.log('[AuthProvider] set and saved accessToken:', data.access_token);
      } else {
        console.warn('[AuthProvider] No accessToken in login response!');
      }
      await bootstrapUser(email);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setUser(null);
      clearAccessToken();
      clearTokenFromStorage();
      console.error('[AuthProvider] login error:', err);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    clearAccessToken();
    clearTokenFromStorage();
    setAccessTokenState(null);
  }

  if (loading) return null;
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
