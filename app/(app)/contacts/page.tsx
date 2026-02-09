"use client";
import ContactsTable from '../../../components/tables/ContactsTable';
import './contacts-desktop.css';
import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import ContactForm from '../../../components/forms/ContactForm';
import { useAuth } from '../../../src/auth/AuthProvider';
import { useRouter } from 'next/navigation';

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role === 'ADMIN') {
      router.replace('/admin/contacts');
    }
  }, [role, loading, router]);

  const handleCreate = async (data: any) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add contact');
      setModalOpen(false);
      setRefresh(r => r + 1);
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="contacts-responsive">
      <div className="contacts-header-row">
        <div>
          <h1 className="contacts-title">Kontakte</h1>
          <div className="contacts-header-subtitle">Verwalte dini Geschäftskontakte effizient und sicher.</div>
        </div>
        <button className="contacts-new-btn" onClick={() => setModalOpen(true)}>+ Neue Kontakt</button>
      </div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <input
          type="text"
          placeholder="Kontakte sueche..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="contacts-filter-input"
          style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 16, width: 320 }}
        />
      </div>
      <div className="contacts-table-card">
        <ContactsTable search={search} refresh={refresh} />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Neue Kontakt">
        <ContactForm onSubmit={handleCreate} />
        {saving && <div style={{ color: '#0052cc', marginTop: 12 }}>Speichere...</div>}
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </Modal>
    </div>
  );
}
