"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/auth/AuthProvider';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const router = useRouter();
  const { user, login, error } = useAuth();

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg('');

    // Show "waking up" hint after 5s of waiting
    const hint = setTimeout(() => {
      setStatusMsg('Server wird gestartet, bitte kurz warten...');
    }, 5000);

    try {
      await login(email, password);
    } finally {
      clearTimeout(hint);
      setSubmitting(false);
      setStatusMsg('');
    }
  }

  return (
    <div className={styles['login-bg']}>
      <div className={styles['login-container']}>
        <div className={styles['login-logo']}>
          <img src="/logoip3.png" alt="Logo" />
        </div>
        <h2 className={styles['login-title']}>Im CRM anmelden</h2>
        <form className={styles['login-form']} onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-Mail-Adresse"
            autoComplete="email"
            required
            disabled={submitting}
            className={styles['login-input']}
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Passwort"
              autoComplete="current-password"
              required
              disabled={submitting}
              className={styles['login-input']}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              tabIndex={-1}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                color: '#64748b', fontSize: 13, fontWeight: 600, lineHeight: 1,
              }}
              title={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          {error && <div className={styles['login-error']}>{error}</div>}
          {statusMsg && (
            <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', padding: '4px 0' }}>
              {statusMsg}
            </div>
          )}
          <style>{`
            @keyframes btn-spin { to { transform: rotate(360deg); } }
          `}</style>
          <button
            type="submit"
            className={styles['login-btn']}
            disabled={submitting}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: submitting ? 0.85 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {submitting && (
              <span style={{
                display: 'inline-block', width: 15, height: 15,
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'btn-spin 0.65s linear infinite',
                flexShrink: 0,
              }} />
            )}
            {submitting ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <a href="/forgot-password" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>Passwort vergessen?</a>
        </div>
        <div className={styles['login-footer']}>Powered by ip3</div>
      </div>
    </div>
  );
}
