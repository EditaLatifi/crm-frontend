"use client";
import React, { useState, useEffect } from 'react';
import { api } from '../../src/api/client';

const errStyle: React.CSSProperties = { color: '#dc2626', fontSize: 12, marginTop: 3 };
const inputStyle = (hasErr: boolean): React.CSSProperties => ({
  width: '100%', padding: 8, borderRadius: 4,
  border: `1px solid ${hasErr ? '#dc2626' : '#ccc'}`,
  outline: 'none',
});

export default function ContactForm({ onSubmit, initialData }: {
  onSubmit: (data: any) => void;
  initialData?: any;
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [accountId, setAccountId] = useState(initialData?.accountId || '');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoadingAccounts(true);
    api.get('/accounts')
      .then((data: any) => { setAccounts(Array.isArray(data) ? data : []); setLoadingAccounts(false); })
      .catch(() => setLoadingAccounts(false));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name ist erforderlich';
    else if (name.trim().length < 2) e.name = 'Name muss mindestens 2 Zeichen haben';
    if (!email.trim()) e.email = 'E-Mail ist erforderlich';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Ungültige E-Mail-Adresse';
    if (phone && !/^[+\d\s\-()\u00C0-\u024F]{6,20}$/.test(phone)) e.phone = 'Ungültige Telefonnummer';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      await Promise.resolve(onSubmit({ name: name.trim(), email: email.trim(), phone, accountId }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: 12 }}>
        <label>Name *</label><br />
        <input value={name} onChange={e => setName(e.target.value)} style={inputStyle(!!errors.name)} />
        {errors.name && <div style={errStyle}>{errors.name}</div>}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>E-Mail *</label><br />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle(!!errors.email)} />
        {errors.email && <div style={errStyle}>{errors.email}</div>}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Telefon</label><br />
        <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle(!!errors.phone)} />
        {errors.phone && <div style={errStyle}>{errors.phone}</div>}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Konto (optional)</label><br />
        {loadingAccounts ? (
          <div style={{ color: '#888', padding: 8 }}>Lade Konten...</div>
        ) : (
          <select value={accountId} onChange={e => setAccountId(e.target.value)} style={inputStyle(false)}>
            <option value="">Kein Konto</option>
            {accounts.map((acc: any) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        )}
      </div>
      <button type="submit" disabled={saving} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', marginTop: 8, opacity: saving ? 0.7 : 1, fontSize: 14 }}>{saving ? 'Speichern…' : 'Kontakt speichern'}</button>
    </form>
  );
}
