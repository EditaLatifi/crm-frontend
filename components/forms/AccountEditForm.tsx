"use client";
import React, { useState } from 'react';

export default function AccountEditForm({ initialData, onSubmit, onCancel }: {
  initialData: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'Client');
  const [address, setAddress] = useState(initialData?.address || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ name, type, address, phone, email, notes }); }} style={{ maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(30,41,59,0.08)', padding: '36px 32px', border: '1.5px solid #e5e7eb' }}>
      <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', marginBottom: 32, letterSpacing: '-1px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', paddingBottom: 12 }}>Account bearbeite</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '18px 24px', marginBottom: 24 }}>
        <label style={{ fontWeight: 700, fontSize: 16, color: '#23272f', alignSelf: 'center' }}>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 16, background: '#f8f9fb', color: '#23272f' }} />
        <label style={{ fontWeight: 700, fontSize: 16, color: '#23272f', alignSelf: 'center' }}>Typ</label>
        <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 16, background: '#f8f9fb', color: '#23272f' }}>
          <option value="Client">Kunde</option>
          <option value="Partner">Partner</option>
          <option value="Potential Client">Potenzielle Kunde</option>
        </select>
        <label style={{ fontWeight: 700, fontSize: 16, color: '#23272f', alignSelf: 'center' }}>Adress</label>
        <input value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 16, background: '#f8f9fb', color: '#23272f' }} />
        <label style={{ fontWeight: 700, fontSize: 16, color: '#23272f', alignSelf: 'center' }}>Telefon</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 16, background: '#f8f9fb', color: '#23272f' }} />
        <label style={{ fontWeight: 700, fontSize: 16, color: '#23272f', alignSelf: 'center' }}>E-Mail</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 16, background: '#f8f9fb', color: '#23272f' }} />
        <label style={{ fontWeight: 700, fontSize: 16, color: '#23272f', alignSelf: 'center' }}>Notize</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 16, background: '#f8f9fb', color: '#23272f', minHeight: 60 }} />
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="button" onClick={onCancel} style={{ background: '#f4f5f7', color: '#333', border: '1.5px solid #b3bac5', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Abbreche</button>
        <button type="submit" style={{ background: '#0052cc', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #0052cc22', letterSpacing: '0.2px' }}>Speichere</button>
      </div>
    </form>
  );
}
