// frontend/pages/LoginPage.tsx
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../src/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
});

export default function LoginPage() {
  const { login, loading, error, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (user) router.replace('/deals');
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      setFormError(result.error.issues[0].message);
      return;
    }
    try {
      await login(form.email, form.password);
    } catch (err: any) {
      setFormError(err.message || 'Login failed');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div style={{ width: 360, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: 32, boxShadow: 'none', fontFamily: 'Inter, system-ui, Segoe UI, Arial, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <img src="/logoip3.png" alt="Logo" style={{ height: 60, marginBottom: 8 }} />
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>Email</label>
            <input
              type="email"
              style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '8px', fontSize: '14px', background: '#f8fafc', color: 'var(--color-text)' }}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              autoFocus
              autoComplete="username"
            />
          </div>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '8px', fontSize: '14px', background: '#f8fafc', color: 'var(--color-text)', paddingRight: '36px' }}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute',
                right: 8,
                top: 32,
                background: 'none',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                height: 24,
                width: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {(formError || error) && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: '6px', padding: '8px', fontSize: '12px', marginTop: 4 }}>{formError || error}</div>
          )}
          <button
            type="submit"
            style={{ width: '100%', background: 'var(--color-accent)', color: '#fff', padding: '10px 0', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '14px', marginTop: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'background 0.15s' }}
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Sign in'}
          </button>
        </form>
        <div style={{ marginTop: 24, fontSize: '12px', color: 'var(--color-meta)', textAlign: 'center' }}>© {new Date().getFullYear()} CRM Enterprise</div>
      </div>
    </div>
  );
}
