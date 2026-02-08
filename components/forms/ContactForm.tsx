"use client";
import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    setLoadingAccounts(true);
    fetch('/api/accounts')
      .then(res => res.json())
      .then(data => {
        setAccounts(Array.isArray(data) ? data : []);
        console.log('Fetched accounts:', data); // Debug log
        setLoadingAccounts(false);
      })
      .catch(() => setLoadingAccounts(false));
  }, []);

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ name, email, phone, accountId }); }}>
      <div style={{ marginBottom: 12 }}>
        <label>Name</label><br />
        <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>E-Mail</label><br />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Telefon</label><br />
        <input value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Konto (optional)</label><br />
        {loadingAccounts ? (
          <div style={{ color: '#888', padding: 8 }}>Lade Konti...</div>
        ) : (
          <select value={accountId} onChange={e => setAccountId(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
            <option value="">Kei Konto</option>
            {accounts.map((acc: any) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        )}
      </div>
      <button type="submit" style={{ background: '#0052cc', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>Kontakt speichere</button>
    </form>
  );
}
