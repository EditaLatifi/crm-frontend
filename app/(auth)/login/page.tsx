"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, login } = require('../../../src/auth/AuthProvider').useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Login form submitted', { email, password });
    setError('');
    try {
      await login(email, password);
      console.log('Login success');
    } catch (err) {
      console.log('Login error', err);
      setError(err.message || 'Login failed');
    }
  }
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className={styles['login-bg']}>
      <div className={styles['login-container']}>
        <div className={styles['login-logo']}>
          <img src="/logoip3.png" alt="Logo" />
        </div>
        <h2 className={styles['login-title']}>Sign in to CRM</h2>
        <form className={styles['login-form']} onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            autoComplete="email"
            required
            className={styles['login-input']}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
            className={styles['login-input']}
          />
          {error && <div className={styles['login-error']}>{error}</div>}
          <button type="submit" className={styles['login-btn']}>Login</button>
        </form>
        <div className={styles['login-footer']}>Powered by ip3</div>
      </div>
    </div>
  );
}

