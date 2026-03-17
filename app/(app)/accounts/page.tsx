"use client";

import AccountsTable from '../../../components/tables/AccountsTable';
import Modal from '../../../components/ui/Modal';
import AccountForm from '../../../components/forms/AccountForm';
import CsvImportModal from '../../../components/ui/CsvImportModal';
import React, { useState, useEffect, useRef } from 'react';
import { fetchWithAuth, api } from '../../../src/api/client';
import { useAuth } from '../../../src/auth/AuthProvider';
import { useToast } from '../../../components/ui/Toast';
import './accounts-desktop.css';
import './accounts-mobile.css';


// Demo tags for filter dropdown (should be fetched from API in real app)
const DEMO_TAGS = ['VIP', 'Prospect', 'Active'];


// 1. Add export handler to AccountsPage
const handleExportCSV = (accounts: any[]) => {
  if (!accounts || !accounts.length) return;
  const replacer = (key: string, value: any) => value === null ? '' : value;
  const header = Object.keys(accounts[0]);
  const csv = [
    header.join(','),
    ...accounts.map((row: any) =>
      header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(',')
    )
  ].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'accounts.csv';
  a.click();
  window.URL.revokeObjectURL(url);
};


export default function AccountsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const tableRef = useRef<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [owners, setOwners] = useState<{id: string; name: string}[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdAt-desc');
  const [tagFilter, setTagFilter] = useState('');
  const [tableKey, setTableKey] = useState(0);

  // Fetch unique owners (with names) and types for filters
  useEffect(() => {
    Promise.all([api.get('/accounts'), api.get('/users')])
      .then(([accData, usersData]: any) => {
        const arr = Array.isArray(accData) ? accData : [];
        const users: any[] = Array.isArray(usersData) ? usersData : [];
        const ownerIds = Array.from(new Set(arr.map((a: any) => a.ownerUserId).filter(Boolean))) as string[];
        setOwners(ownerIds.map((id: string) => {
          const u = users.find((u: any) => u.id === id);
          return { id, name: u?.name || u?.email || id };
        }));
        setTypes(Array.from(new Set(arr.map((a: any) => a.type).filter(Boolean))) as string[]);
      })
      .catch(() => {});
  }, []);

  const handleCreate = async (data: any) => {
    // Map UI type to backend enum
    const typeMap: Record<string, string> = {
      'Client': 'CLIENT',
      'Partner': 'PARTNER',
      'Potential Client': 'POTENTIAL_CLIENT',
    };
    try {
      if (!user || !user.id) throw new Error('No logged-in user found');
      const payload = {
        ...data,
        type: typeMap[data.type] || 'CLIENT',
        ownerUserId: user.id,
        createdByUserId: user.id,
      };
      const res = await fetchWithAuth('/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res) throw new Error('Failed to create account');
      setTableKey(k => k + 1);
      toast.success('Konto erfolgreich erstellt.');
    } catch (err) {
      toast.error('Konto konnte nicht erstellt werden: ' + (err as Error).message);
    } finally {
      setModalOpen(false);
    }
  };

  // 2. Add state to store accounts
  const [accounts, setAccounts] = useState<any[]>([]);
  const [csvOpen, setCsvOpen] = useState(false);

  // 3. Fetch accounts and update state
  useEffect(() => {
    api.get('/accounts')
      .then((data: any) => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [tableKey]);

  return (
    <div className="accounts-responsive">
      {/* Blue header only behind title/subtitle */}
      <div className="page-section-blue accounts-header" style={{ background: 'linear-gradient(135deg, #f8f9fb 60%, #e9effd 100%)', borderRadius: 18, boxShadow: '0 4px 16px rgba(30,41,59,0.10)', padding: '32px 24px 24px 24px', marginBottom: 18 }}>
        <div className="accounts-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <h1 className="accounts-title" style={{ fontSize: 32, fontWeight: 700, color: '#1e293b', marginBottom: 0, letterSpacing: '-0.5px', textAlign: 'left' }}>Firmen</h1>
              <div style={{ fontSize: 15, color: '#23272f', fontWeight: 500, marginTop: 6, letterSpacing: '0.2px' }}>Verwalte deine Geschäftsfirmen effizient und sicher.</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => handleExportCSV(accounts)} style={{ fontSize: 13, fontWeight: 600, borderRadius: 6, border: '1.5px solid #d1d5db', background: '#f1f5f9', color: '#64748b', padding: '8px 18px', cursor: 'pointer' }}>CSV exportieren</button>
            <button onClick={() => setCsvOpen(true)} style={{ fontSize: 13, fontWeight: 600, borderRadius: 6, border: '1.5px solid #d1d5db', background: '#f1f5f9', color: '#64748b', padding: '8px 18px', cursor: 'pointer' }}>CSV importieren</button>
            <button className="accounts-new-btn" style={{ fontSize: 15, fontWeight: 600, borderRadius: 6, border: '1.5px solid #2563eb', background: '#2563eb', color: '#fff', padding: '8px 20px', cursor: 'pointer', boxShadow: 'none', transition: 'background 0.15s, border 0.15s, color 0.15s' }} onClick={() => setModalOpen(true)}>+ Neue Firma</button>
          </div>
        </div>
      </div>
      {/* Filters and actions in a white card overlapping the header */}
      <div className="accounts-filters-card">
        <div className="accounts-filters-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="accounts-filter-select" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4, minWidth: 110, height: 32 }}>
            <option value="">Alle Status/Tags</option>
            {DEMO_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
            <input
            type="text"
            placeholder="Name, E-Mail, Verantwortliche suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="accounts-filter-input"
            style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4, minWidth: 120, height: 32 }}
          />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="accounts-filter-select" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4, minWidth: 110, height: 32 }}>
            <option value="">Alle Typen</option>
            {types.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="accounts-filter-select" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4, minWidth: 110, height: 32 }}>
            <option value="">Alle Verantwortlichen</option>
            {owners.map((owner: any) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
          </select>
          <div className="accounts-filter-date-row" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <label className="accounts-filter-date-label" style={{ fontSize: 13 }}>Erstellt:</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="accounts-filter-date" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4, height: 32 }} />
            <span className="accounts-filter-date-sep" style={{ fontSize: 13 }}>bis</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="accounts-filter-date" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4, height: 32 }} />
          </div>
          <button className="accounts-filter-clear" style={{ fontSize: 13, fontWeight: 500, borderRadius: 4, border: '1px solid #2563eb', background: '#fff', color: '#2563eb', padding: '6px 14px', cursor: 'pointer', marginLeft: 0, height: 32 }} onClick={() => { setSearch(""); setTypeFilter(""); setOwnerFilter(""); setDateFrom(""); setDateTo(""); }}>Filter löschen</button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="accounts-filter-select" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4, minWidth: 110, height: 32 }}>
            <option value="createdAt-desc">Neueste zuerst</option>
            <option value="createdAt-asc">Älteste zuerst</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="type-asc">Typ A-Z</option>
            <option value="type-desc">Typ Z-A</option>
            <option value="ownerUserId-asc">Verantwortlich A-Z</option>
            <option value="ownerUserId-desc">Verantwortlich Z-A</option>
          </select>
        </div>
        {/* Export/Import CSV buttons moved to AccountsTable */}
      </div>
      <div className="page-section-white accounts-table-section">
        <AccountsTable
          key={tableKey}
          search={search}
          typeFilter={typeFilter}
          ownerFilter={ownerFilter}
          dateFrom={dateFrom}
          dateTo={dateTo}
          sortBy={sortBy}
          tagFilter={tagFilter}
        />
      </div>
      <CsvImportModal open={csvOpen} onClose={() => setCsvOpen(false)} entityType="accounts" onImported={() => setTableKey(k => k + 1)} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Neue Firma">
        <AccountForm onSubmit={handleCreate} />
      </Modal>
    </div>
  );
}
