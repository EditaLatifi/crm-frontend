"use client";
import ContactsTable from '../../../components/tables/ContactsTable';
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
      const res = await fetch('/api/contacts', {
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
    <div style={{ padding: 32, background: '#f8f9fb', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#222' }}>Contacts</h1>
        <button onClick={() => setModalOpen(true)} style={{ background: '#0052cc', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,82,204,0.08)' }}>+ New Contact</button>
      </div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 16, width: 320 }}
        />
      </div>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <ContactsTable search={search} refresh={refresh} />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Contact">
        <ContactForm onSubmit={handleCreate} />
        {saving && <div style={{ color: '#0052cc', marginTop: 12 }}>Saving...</div>}
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </Modal>
    </div>
  );
}
