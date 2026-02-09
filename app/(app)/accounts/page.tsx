"use client";

import AccountsTable from '../../../components/tables/AccountsTable';
import Modal from '../../../components/ui/Modal';
import AccountForm from '../../../components/forms/AccountForm';
import React, { useState, useEffect, useRef } from 'react';
import './accounts-desktop.css';


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
  const tableRef = useRef<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [owners, setOwners] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdAt-desc');
  const [tagFilter, setTagFilter] = useState('');
  const [tableKey, setTableKey] = useState(0);

  // Fetch unique owners/types for filters (simulate API or get from /api/accounts)
  useEffect(() => {
    fetch('/accounts')
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setOwners(Array.from(new Set(arr.map((a: any) => a.ownerUserId).filter(Boolean))));
        setTypes(Array.from(new Set(arr.map((a: any) => a.type).filter(Boolean))));
      });
  }, []);

  // Fetch all users and use the first user's id for account creation
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    fetch('/users')
      .then(res => res.json())
      .then(users => {
        if (users && users.length > 0) {
          setUserId(users[0].id);
        }
      });
  }, []);

  const handleCreate = async (data: any) => {
    // Map UI type to backend enum
    const typeMap: Record<string, string> = {
      'Client': 'CLIENT',
      'Partner': 'PARTNER',
      'Potential Client': 'POTENTIAL_CLIENT',
    };
    try {
      const payload = {
        ...data,
        type: typeMap[data.type] || 'CLIENT',
        ownerUserId: userId || 'REPLACE_WITH_USER_ID',
        createdByUserId: userId || 'REPLACE_WITH_USER_ID',
      };
      const res = await fetch('/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create account');
      setTableKey(k => k + 1); // trigger table reload
    } catch (err) {
      alert('Error creating account: ' + (err as Error).message);
    } finally {
      setModalOpen(false);
    }
  };

  // 2. Add state to store accounts
  const [accounts, setAccounts] = useState<any[]>([]);

  // 3. Fetch accounts and update state
  useEffect(() => {
    fetch('/accounts')
      .then(res => res.json())
      .then(data => setAccounts(Array.isArray(data) ? data : []));
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
          <button className="accounts-new-btn" style={{ fontSize: 15, fontWeight: 600, borderRadius: 6, border: '1.5px solid #2563eb', background: '#2563eb', color: '#fff', padding: '8px 20px', cursor: 'pointer', boxShadow: 'none', transition: 'background 0.15s, border 0.15s, color 0.15s' }} onClick={() => setModalOpen(true)}>+ Neue Firma</button>
        </div>
      </div>
      {/* Filters and actions in a white card overlapping the header */}
      <div className="accounts-filters-card">
        <div className="accounts-filters-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="accounts-filter-select" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4, minWidth: 110, height: 32 }}>
            <option value="">Alli Status/Tags</option>
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
            <option value="">Alli Typen</option>
              <option value="">Alle Typen</option>
            {types.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="accounts-filter-select" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4, minWidth: 110, height: 32 }}>
            <option value="">Alli Verantwortlichi</option>
              <option value="">Alle Verantwortlichen</option>
            {owners.map(owner => <option key={owner} value={owner}>{owner}</option>)}
          </select>
          <div className="accounts-filter-date-row" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <label className="accounts-filter-date-label" style={{ fontSize: 13 }}>Erstellt:</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="accounts-filter-date" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4, height: 32 }} />
            <span className="accounts-filter-date-sep" style={{ fontSize: 13 }}>bis</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="accounts-filter-date" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4, height: 32 }} />
          </div>
          <button className="accounts-filter-clear" style={{ fontSize: 13, fontWeight: 500, borderRadius: 4, border: '1px solid #2563eb', background: '#fff', color: '#2563eb', padding: '6px 14px', cursor: 'pointer', marginLeft: 0, height: 32 }} onClick={() => { setSearch(""); setTypeFilter(""); setOwnerFilter(""); setDateFrom(""); setDateTo(""); }}>Filter lösche</button>
            <button className="accounts-filter-clear" style={{ fontSize: 13, fontWeight: 500, borderRadius: 4, border: '1px solid #2563eb', background: '#fff', color: '#2563eb', padding: '6px 14px', cursor: 'pointer', marginLeft: 0, height: 32 }} onClick={() => { setSearch(""); setTypeFilter(""); setOwnerFilter(""); setDateFrom(""); setDateTo(""); }}>Filter löschen</button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="accounts-filter-select" style={{ fontSize: 13, padding: '6px 10px', borderRadius: 4, minWidth: 110, height: 32 }}>
            <option value="createdAt-desc">Sortiere: Neuschte</option>
            <option value="createdAt-asc">Sortiere: Ältesti</option>
            <option value="name-asc">Sortiere: Name A-Z</option>
            <option value="name-desc">Sortiere: Name Z-A</option>
            <option value="type-asc">Sortiere: Typ A-Z</option>
            <option value="type-desc">Sortiere: Typ Z-A</option>
            <option value="ownerUserId-asc">Sortiere: Verantwortlich A-Z</option>
            <option value="ownerUserId-desc">Sortiere: Verantwortlich Z-A</option>
          </select>
        </div>
        <div className="accounts-filters-actions" style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {/* Export/Import CSV buttons disabled, since ref is removed. You can re-implement CSV export/import via callback/prop pattern if needed. */}
          <button className="accounts-export-btn" style={{ fontSize: 13, fontWeight: 500, borderRadius: 4, border: '1px solid #2563eb', background: '#2563eb', color: '#fff', padding: '6px 14px', cursor: 'pointer', height: 32, boxShadow: 'none' }} onClick={() => handleExportCSV(accounts)}>CSV exportiere</button>
            <button className="accounts-export-btn" style={{ fontSize: 13, fontWeight: 500, borderRadius: 4, border: '1px solid #2563eb', background: '#2563eb', color: '#fff', padding: '6px 14px', cursor: 'pointer', height: 32, boxShadow: 'none' }} onClick={() => handleExportCSV(accounts)}>CSV exportieren</button>
          <label className="accounts-import-label" style={{ fontSize: 13, fontWeight: 500, borderRadius: 4, border: '1px solid #36a2eb', background: '#fff', color: '#36a2eb', padding: '6px 14px', cursor: 'pointer', height: 32, display: 'flex', alignItems: 'center', boxShadow: 'none' }}>
            CSV importieren
            <input type="file" accept=".csv" disabled style={{ display: 'none' }} />
          </label>
        </div>
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Neue Firma">
        <AccountForm onSubmit={handleCreate} />
      </Modal>
    </div>
  );
}
