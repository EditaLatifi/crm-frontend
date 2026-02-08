"use client";
import ContactsTable from '../../../components/tables/ContactsTable';
import '../../../app/(app)/contacts/contacts-desktop.css';
import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import ContactForm from '../../../components/forms/ContactForm';

import ProtectedRoute from '../../../src/routes/ProtectedRoute';

function AdminContactsPageContent() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="contacts-responsive">
      <div className="contacts-header-row">
        <div>
          <h1 className="contacts-title">Kontakte (Admin)</h1>
          <div className="contacts-header-subtitle">Verwalte dini Geschäftskontakte effizient und sicher.</div>
        </div>
        <button className="contacts-new-btn" onClick={() => setModalOpen(true)}>
          + Neuer Kontakt
        </button>
      </div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <input
          type="text"
          className="contacts-filter-input"
          placeholder="Kontakte sueche..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 340 }}
        />
      </div>
      <div className="contacts-table-card">
        <ContactsTable search={search} refresh={refresh} adminView />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Neuer Kontakt">
        <ContactForm onSubmit={handleCreate} />
        {saving && <div style={{ color: '#0052cc', marginTop: 12 }}>Speichere...</div>}
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </Modal>
    </div>
  );
}

export default function AdminContactsPage() {
  return (
    <ProtectedRoute role="ADMIN">
      <AdminContactsPageContent />
    </ProtectedRoute>
  );
}
