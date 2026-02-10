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

  // Helper: decode JWT and check expiration
  function isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true;
    }
  }

  useEffect(() => {
    loadTokenFromStorage();
    const token = getAccessToken();
    if (token && isTokenExpired(token)) {
      clearAccessToken();
      clearTokenFromStorage();
      setAccessTokenState(null);
      setUser(null);
      setLoading(false);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return;
    }
    setAccessTokenState(token || null);
    if (token) {
      // Validate token by calling bootstrapUser
      bootstrapUser()
        .then(() => setLoading(false))
        .catch(() => {
          // If invalid, clear token from everywhere
          clearAccessToken();
          clearTokenFromStorage();
          setAccessTokenState(null);
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  async function bootstrapUser(email?: string) {
    setLoading(true);
    setError(null);
    try {
      const me = await getMe(email!);
      setUser(me);
    } catch (err: any) {
      setUser(null);
      if (err.status === 401) clearAccessToken();
      if (err.status === 408) setError('Server is waking up or slow. Please wait a moment and try again.');
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
        // No access token, treat as failed login
        clearAccessToken();
        clearTokenFromStorage();
        setAccessTokenState(null);
        setUser(null);
        setError('No access token received');
        return;
      }
      await bootstrapUser(email);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setUser(null);
      clearAccessToken();
      clearTokenFromStorage();
      setAccessTokenState(null);
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
    // Defensive: also clear error and role if needed
    setError(null);
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f8f9fa',
      }}>
        <img
          src="/logoip3.png"
          alt="Logo"
          style={{
            width: 180,
            height: 180,
            marginBottom: 0,
            animation: 'bounce 1.2s infinite',
            display: 'block',
          }}
        />
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            20% { transform: translateY(-30px); }
            40% { transform: translateY(-50px); }
            60% { transform: translateY(-30px); }
            80% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    );
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
