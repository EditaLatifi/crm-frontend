"use client";
// src/auth/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, getMe } from '../api/client';
import { getAccessToken, setAccessToken, clearAccessToken, loadTokenFromStorage, saveTokenToStorage, clearTokenFromStorage } from './tokenStore';

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

// Decode JWT payload without verification — for immediate local use only
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

// Build a minimal user object from JWT payload (no network needed)
function userFromToken(token: string): Partial<User> | null {
  const payload = decodeToken(token);
  if (!payload?.sub) return null;
  return { id: payload.sub, role: payload.role };
}

function clearAuth(setAccessTokenState: (t: null) => void) {
  clearAccessToken();
  clearTokenFromStorage();
  setAccessTokenState(null);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch full profile in the background — does NOT block or log out on failure
  async function fetchProfile() {
    try {
      const me = await getMe();
      if (me && me.id) setUser(me);
    } catch {
      // Profile fetch failed (server cold start or network issue)
      // We keep the minimal user from JWT — the user stays logged in
    }
  }

  useEffect(() => {
    loadTokenFromStorage();
    const token = getAccessToken();

    if (!token || isTokenExpired(token)) {
      clearAuth(setAccessTokenState);
      setLoading(false);
      return;
    }

    // Set minimal user from JWT immediately — app is usable right away
    const basic = userFromToken(token);
    if (basic) setUser(basic as User);
    setAccessTokenState(token);
    setLoading(false); // Don't block on profile fetch

    // Fetch full profile (name, email) in background
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiLogin(email, password);

      if (!data?.access_token) {
        setError('Ungültige Anmeldedaten');
        setLoading(false);
        return;
      }

      setAccessToken(data.access_token);
      saveTokenToStorage();
      setAccessTokenState(data.access_token);

      // Login response already contains user — no extra API call needed
      if (data.user?.id) {
        setUser(data.user);
      } else {
        // Fallback: decode JWT for minimal user, fetch profile in background
        const basic = userFromToken(data.access_token);
        if (basic) setUser(basic as User);
        fetchProfile();
      }
    } catch (err: any) {
      if (err.status === 408) {
        setError('Der Server startet gerade hoch. Bitte einen Moment warten und erneut versuchen.');
      } else if (err.status === 401 || (err.message && err.message.toLowerCase().includes('invalid'))) {
        setError('Ungültige E-Mail-Adresse oder Passwort');
      } else {
        setError(err.message || 'Anmeldung fehlgeschlagen');
      }
      setUser(null);
      clearAuth(setAccessTokenState);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    clearAuth(setAccessTokenState);
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
        background: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse-ring {
            0%   { transform: scale(0.92); opacity: 0.6; }
            50%  { transform: scale(1.04); opacity: 0.15; }
            100% { transform: scale(0.92); opacity: 0.6; }
          }
          @keyframes dot-flash {
            0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
            40%            { opacity: 1;   transform: scale(1); }
          }
        `}</style>

        <div style={{ animation: 'fadeIn 0.4s ease both', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {/* Logo with subtle pulse halo */}
          <div style={{ position: 'relative', width: 72, height: 72, marginBottom: 28 }}>
            <div style={{
              position: 'absolute', inset: -10, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
              animation: 'pulse-ring 2s ease-in-out infinite',
            }} />
            <img
              src="/logoip3.png"
              alt="Logo"
              style={{ width: 72, height: 72, borderRadius: 16, display: 'block', position: 'relative', zIndex: 1 }}
            />
          </div>

          {/* Spinner */}
          <div style={{
            width: 32, height: 32,
            border: '3px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite',
            marginBottom: 20,
          }} />

          {/* Dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 160, 320].map(delay => (
              <div key={delay} style={{
                width: 6, height: 6, borderRadius: '50%', background: '#93c5fd',
                animation: `dot-flash 1.2s ease-in-out ${delay}ms infinite`,
              }} />
            ))}
          </div>
        </div>
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
