"use client";
import ContactsTable from '../../../components/tables/ContactsTable';
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
    <div className="accounts-responsive" style={{ background: '#f8f9fb', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="accounts-header">
        <div className="accounts-header-row">
          <div>
            <h1 className="accounts-title">Contacts (Admin)</h1>
          </div>
          <button className="accounts-new-btn" onClick={() => setModalOpen(true)}>
            + New Contact
          </button>
        </div>
      </div>
      <div className="accounts-filters-card" style={{ marginTop: -36, marginBottom: 18 }}>
        <div className="accounts-filters-row">
          <input
            type="text"
            className="accounts-filter-input"
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 340 }}
          />
        </div>
      </div>
      <div className="accounts-table-section contacts-table-section">
        <ContactsTable search={search} refresh={refresh} adminView />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Contact">
        <ContactForm onSubmit={handleCreate} />
        {saving && <div style={{ color: '#0052cc', marginTop: 12 }}>Saving...</div>}
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
