"use client";
import React, { useState } from 'react';

const field: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' };
const errStyle: React.CSSProperties = { color: '#dc2626', fontSize: 12, marginTop: 3 };
const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 };

export default function AccountForm({ onSubmit, initialData }: { onSubmit: (data: any) => void; initialData?: any; }) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'CLIENT');
  const [address, setAddress] = useState(initialData?.address || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name ist erforderlich';
    else if (name.trim().length < 2) e.name = 'Name muss mindestens 2 Zeichen haben';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Ungültige E-Mail-Adresse';
    if (phone && !/^[+\d\s\-()]{6,20}$/.test(phone)) e.phone = 'Ungültige Telefonnummer';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSubmit({ name: name.trim(), type, address, phone, email, notes });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={label}>Name <span style={{ color: '#dc2626' }}>*</span></label>
        <input value={name} onChange={e => { setName(e.target.value); setErrors(ev => ({ ...ev, name: '' })); }}
          style={{ ...field, borderColor: errors.name ? '#dc2626' : '#e2e8f0' }} placeholder="Firmenname" />
        {errors.name && <div style={errStyle}>{errors.name}</div>}
      </div>
      <div>
        <label style={label}>Typ <span style={{ color: '#dc2626' }}>*</span></label>
        <select value={type} onChange={e => setType(e.target.value)} style={{ ...field }}>
          <option value="CLIENT">Kunde</option>
          <option value="POTENTIAL_CLIENT">Potenzieller Kunde</option>
          <option value="PARTNER">Partner</option>
        </select>
      </div>
      <div>
        <label style={label}>Adresse</label>
        <input value={address} onChange={e => setAddress(e.target.value)} style={field} placeholder="Straße, PLZ, Ort" />
      </div>
      <div>
        <label style={label}>Telefon</label>
        <input value={phone} onChange={e => { setPhone(e.target.value); setErrors(ev => ({ ...ev, phone: '' })); }}
          style={{ ...field, borderColor: errors.phone ? '#dc2626' : '#e2e8f0' }} placeholder="+41 44 123 45 67" />
        {errors.phone && <div style={errStyle}>{errors.phone}</div>}
      </div>
      <div>
        <label style={label}>E-Mail</label>
        <input value={email} onChange={e => { setEmail(e.target.value); setErrors(ev => ({ ...ev, email: '' })); }}
          style={{ ...field, borderColor: errors.email ? '#dc2626' : '#e2e8f0' }} placeholder="info@firma.ch" />
        {errors.email && <div style={errStyle}>{errors.email}</div>}
      </div>
      <div>
        <label style={label}>Notizen</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          style={{ ...field, resize: 'vertical', lineHeight: 1.5 }} placeholder="Interne Notizen..." />
      </div>
      <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14, marginTop: 4 }}>
        Speichern
      </button>
    </form>
  );
}
