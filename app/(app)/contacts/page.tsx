"use client";
import ContactsTable from '../../../components/tables/ContactsTable';
import './contacts-desktop.css';
import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import ContactForm from '../../../components/forms/ContactForm';
import CsvImportModal from '../../../components/ui/CsvImportModal';
import { useAuth } from '../../../src/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { api } from '../../../src/api/client';
import { useToast } from '../../../components/ui/Toast';

export default function ContactsPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [saving, setSaving] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role === 'ADMIN') {
      router.replace('/admin/contacts');
    }
  }, [role, loading, router]);

  const handleCreate = async (data: any) => {
    setSaving(true);
    try {
      await api.post('/contacts', data);
      setModalOpen(false);
      setRefresh(r => r + 1);
      toast.success('Kontakt erfolgreich erstellt.');
    } catch (e: any) {
      toast.error(e.message || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 40px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
            Kontakte
          </h1>
          <div style={{ fontSize: 13, color: '#999', fontWeight: 400, marginTop: 4 }}>
            Verwalte deine Geschäftskontakte effizient und sicher.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setCsvOpen(true)}
            style={{
              fontSize: 13, fontWeight: 500, borderRadius: 8,
              border: '1px solid #E8E4DE', background: '#fff',
              color: '#666', padding: '9px 18px', cursor: 'pointer',
            }}
          >
            CSV importieren
          </button>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              fontSize: 13, fontWeight: 600, borderRadius: 8,
              border: 'none', background: '#1a1a1a',
              color: '#fff', padding: '9px 20px', cursor: 'pointer',
            }}
          >
            + Neuer Kontakt
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '14px 20px',
        border: '1px solid #E8E4DE', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <input
          type="text"
          placeholder="Name, E-Mail, Telefon suchen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            fontSize: 13, padding: '8px 12px', borderRadius: 8,
            border: '1px solid #E8E4DE', outline: 'none',
            width: 300, background: '#FAF9F6', color: '#1a1a1a',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
          >
            Filter löschen
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <ContactsTable search={search} refresh={refresh} />
      </div>

      <CsvImportModal open={csvOpen} onClose={() => setCsvOpen(false)} entityType="contacts" onImported={() => setRefresh(r => r + 1)} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Neuer Kontakt">
        <ContactForm onSubmit={handleCreate} />
        {saving && <div style={{ color: '#2563eb', marginTop: 12, fontSize: 13 }}>Speichern...</div>}
      </Modal>
    </div>
  );
}
