"use client";
import React, { useState } from 'react';

const VENDOR_TYPE_OPTIONS = [
  { value: 'ARCHITEKT', label: 'Architekt' },
  { value: 'BAUINGENIEUR', label: 'Bauingenieur' },
  { value: 'ELEKTRIKER', label: 'Elektriker' },
  { value: 'SANITAER', label: 'Sanitär' },
  { value: 'HEIZUNG_LUEFTUNG', label: 'Heizung/Lüftung' },
  { value: 'MALER', label: 'Maler' },
  { value: 'ZIMMERMANN', label: 'Zimmermann' },
  { value: 'DACHDECKER', label: 'Dachdecker' },
  { value: 'GARTENBAU', label: 'Gartenbau' },
  { value: 'GENERALUNTERNEHMER', label: 'Generalunternehmer' },
  { value: 'SONSTIGES', label: 'Sonstiges' },
];

export default function AccountEditForm({ initialData, onSubmit, onCancel }: {
  initialData: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'CLIENT');
  const [address, setAddress] = useState(initialData?.address || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [vendorType, setVendorType] = useState(initialData?.vendorType || '');
  const [rating, setRating] = useState(initialData?.rating ? String(initialData.rating) : '');
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { name, type, address, phone, email, notes };
      if (type === 'SUPPLIER') {
        payload.vendorType = vendorType || null;
        payload.rating = rating ? parseInt(rating) : null;
        payload.contactPerson = contactPerson || null;
      } else {
        payload.vendorType = null;
        payload.rating = null;
        payload.contactPerson = null;
      }
      await Promise.resolve(onSubmit(payload));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px rgba(30,41,59,0.08)', padding: '36px 32px', border: '1.5px solid #e5e7eb' }}>
      {/* Headline removed to avoid duplicate with modal title */}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '18px 24px', marginBottom: 24 }}>
        <label style={{ fontWeight: 700, fontSize: 16, color: '#23272f', alignSelf: 'center' }}>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 16, background: '#f8f9fb', color: '#23272f' }} />
        <label style={{ fontWeight: 700, fontSize: 16, color: '#23272f', alignSelf: 'center' }}>Typ</label>
        <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 16, background: '#f8f9fb', color: '#23272f' }}>
          <option value="CLIENT">Kunde</option>
          <option value="POTENTIAL_CLIENT">Interessent</option>
          <option value="SUPPLIER">Lieferant</option>
        </select>
        <label style={{ fontWeight: 700, fontSize: 16, color: '#23272f', alignSelf: 'center' }}>Adresse</label>
        <input value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 16, background: '#f8f9fb', color: '#23272f' }} />
        <label style={{ fontWeight: 700, fontSize: 16, color: '#23272f', alignSelf: 'center' }}>Telefon</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 16, background: '#f8f9fb', color: '#23272f' }} />
        <label style={{ fontWeight: 700, fontSize: 16, color: '#23272f', alignSelf: 'center' }}>E-Mail</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 16, background: '#f8f9fb', color: '#23272f' }} />
        <label style={{ fontWeight: 700, fontSize: 16, color: '#23272f', alignSelf: 'center' }}>Notizen</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 16, background: '#f8f9fb', color: '#23272f', minHeight: 60 }} />
      </div>
      {type === 'SUPPLIER' && (
        <div style={{ gridColumn: '1 / -1', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: '14px 16px', display: 'grid', gridTemplateColumns: '120px 1fr', gap: '14px 24px' }}>
          <div style={{ gridColumn: '1 / -1', fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lieferanten-Details</div>
          <label style={{ fontWeight: 700, fontSize: 15, color: '#23272f', alignSelf: 'center' }}>Gewerk</label>
          <select value={vendorType} onChange={e => setVendorType(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 15, background: '#f8f9fb', color: '#23272f' }}>
            <option value="">Kein Gewerk</option>
            {VENDOR_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <label style={{ fontWeight: 700, fontSize: 15, color: '#23272f', alignSelf: 'center' }}>Ansprechperson</label>
          <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 15, background: '#f8f9fb', color: '#23272f' }} placeholder="Name der Ansprechperson" />
          <label style={{ fontWeight: 700, fontSize: 15, color: '#23272f', alignSelf: 'center' }}>Bewertung</label>
          <select value={rating} onChange={e => setRating(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #b3bac5', fontSize: 15, background: '#f8f9fb', color: '#23272f' }}>
            <option value="">Keine Bewertung</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stern{n > 1 ? 'e' : ''}</option>)}
          </select>
        </div>
      )}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 8 }}>
        <button type="button" onClick={onCancel} disabled={saving} style={{ background: '#f4f5f7', color: '#333', border: '1.5px solid #b3bac5', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: saving ? 'not-allowed' : 'pointer' }}>Abbrechen</button>
        <button type="submit" disabled={saving} style={{ background: '#0052cc', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #0052cc22', letterSpacing: '0.2px', opacity: saving ? 0.7 : 1 }}>{saving ? 'Speichern…' : 'Speichern'}</button>
      </div>
    </form>
  );
}
