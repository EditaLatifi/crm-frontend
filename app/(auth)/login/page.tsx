"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/auth/AuthProvider';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Passwort"
            autoComplete="current-password"
            required
            disabled={submitting}
            className={styles['login-input']}
          />
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
        <div className={styles['login-footer']}>Powered by ip3</div>
      </div>
    </div>
  );
}
