"use client";
import React, { useState } from 'react';

export default function AccountForm({ onSubmit, initialData }: {
  onSubmit: (data: any) => void;
  initialData?: any;
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'Client');
  const [address, setAddress] = useState(initialData?.address || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ name, type, address, phone, email, notes }); }}>
      <div style={{ marginBottom: 12 }}>
        <label>Name</label><br />
        <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Type</label><br />
        <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
          <option value="Client">Client</option>
          <option value="Partner">Partner</option>
          <option value="Potential Client">Potential Client</option>
        </select>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Address</label><br />
        <input value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Phone</label><br />
        <input value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Email</label><br />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Notes</label><br />
        <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <button type="submit" style={{ background: '#0052cc', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>
        Save
      </button>
    </form>
  );
}
