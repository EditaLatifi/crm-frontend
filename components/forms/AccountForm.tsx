"use client";
import React, { useState } from 'react';

const field: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #E8E4DE', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', background: '#FAF9F6', color: '#1a1a1a' };
const errStyle: React.CSSProperties = { color: '#dc2626', fontSize: 12, marginTop: 3 };
const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 };

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

export default function AccountForm({ onSubmit, initialData }: { onSubmit: (data: any) => void; initialData?: any; }) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'CLIENT');
  const [addressStreet, setAddressStreet] = useState(initialData?.addressStreet || '');
  const [addressNumber, setAddressNumber] = useState(initialData?.addressNumber || '');
  const [addressZip, setAddressZip] = useState(initialData?.addressZip || '');
  const [addressCity, setAddressCity] = useState(initialData?.addressCity || '');
  const [addressCanton, setAddressCanton] = useState(initialData?.addressCanton || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [vendorType, setVendorType] = useState(initialData?.vendorType || '');
  const [rating, setRating] = useState(initialData?.rating || '');
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name ist erforderlich';
    else if (name.trim().length < 2) e.name = 'Name muss mindestens 2 Zeichen haben';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Ungültige E-Mail-Adresse';
    if (phone && !/^[+\d\s\-()]{6,20}$/.test(phone)) e.phone = 'Ungültige Telefonnummer';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      const payload: any = { name: name.trim(), type, addressStreet, addressNumber, addressZip, addressCity, addressCanton, phone, email, notes };
      if (type === 'SUPPLIER') {
        if (vendorType) payload.vendorType = vendorType;
        if (rating) payload.rating = parseInt(rating);
        if (contactPerson) payload.contactPerson = contactPerson;
      }
      await Promise.resolve(onSubmit(payload));
    } finally {
      setSaving(false);
    }
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
          <option value="POTENTIAL_CLIENT">Interessent</option>
          <option value="PARTNER">Partner</option>
          <option value="SUPPLIER">Lieferant</option>
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
        <div>
          <label style={label}>Strasse</label>
          <input value={addressStreet} onChange={e => setAddressStreet(e.target.value)} style={field} placeholder="Bahnhofstrasse" />
        </div>
        <div style={{ width: 90 }}>
          <label style={label}>Nr.</label>
          <input value={addressNumber} onChange={e => setAddressNumber(e.target.value)} style={field} placeholder="12a" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10 }}>
        <div>
          <label style={label}>PLZ</label>
          <input value={addressZip} onChange={e => setAddressZip(e.target.value)} style={field} placeholder="8001" maxLength={4} />
        </div>
        <div>
          <label style={label}>Ort</label>
          <input value={addressCity} onChange={e => setAddressCity(e.target.value)} style={field} placeholder="Zürich" />
        </div>
      </div>
      <div>
        <label style={label}>Kanton</label>
        <select value={addressCanton} onChange={e => setAddressCanton(e.target.value)} style={{ ...field }}>
          <option value="">Kein Kanton</option>
          {['AG','AI','AR','BE','BL','BS','FR','GE','GL','GR','JU','LU','NE','NW','OW','SG','SH','SO','SZ','TG','TI','UR','VD','VS','ZG','ZH'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
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
      {type === 'SUPPLIER' && (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lieferanten-Details</div>
          <div>
            <label style={label}>Gewerk / Typ</label>
            <select value={vendorType} onChange={e => setVendorType(e.target.value)} style={{ ...field }}>
              <option value="">Kein Gewerk</option>
              {VENDOR_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>Ansprechperson</label>
            <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} style={field} placeholder="Name der Ansprechperson" />
          </div>
          <div>
            <label style={label}>Bewertung (1–5)</label>
            <select value={rating} onChange={e => setRating(e.target.value)} style={{ ...field }}>
              <option value="">Keine Bewertung</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stern{n > 1 ? 'e' : ''}</option>)}
            </select>
          </div>
        </div>
      )}
      <button type="submit" disabled={saving} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, marginTop: 4, opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Speichern…' : 'Speichern'}
      </button>
    </form>
  );
}
