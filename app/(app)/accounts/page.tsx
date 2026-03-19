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
    <div className="accounts-responsive" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 40px', fontFamily: 'Inter, system-ui, sans-serif', marginTop: 40 }}>
      {/* Header */}
      <div className="accounts-header" style={{
        background: 'linear-gradient(135deg, #f8f9fb 60%, #e9effd 100%)',
        borderRadius: 18, boxShadow: '0 4px 16px rgba(30,41,59,0.10)',
        padding: '28px 28px 22px', marginBottom: 18,
      }}>
        <div className="accounts-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>Firmen</h1>
          <div style={{ fontSize: 14, color: '#64748b', fontWeight: 400, marginTop: 5 }}>Verwalte deine Geschäftsfirmen effizient und sicher.</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => handleExportCSV(accounts)} style={{ fontSize: 13, fontWeight: 600, borderRadius: 8, border: '1.5px solid #d1d5db', background: '#f1f5f9', color: '#64748b', padding: '9px 18px', cursor: 'pointer' }}>CSV exportieren</button>
          <button onClick={() => setCsvOpen(true)} style={{ fontSize: 13, fontWeight: 600, borderRadius: 8, border: '1.5px solid #d1d5db', background: '#f1f5f9', color: '#64748b', padding: '9px 18px', cursor: 'pointer' }}>CSV importieren</button>
          <button
            style={{ fontSize: 14, fontWeight: 600, borderRadius: 8, border: '1.5px solid #2563eb', background: '#2563eb', color: '#fff', padding: '9px 20px', cursor: 'pointer', transition: 'background 0.15s' }}
            onClick={() => setModalOpen(true)}
            onMouseOver={e => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseOut={e => (e.currentTarget.style.background = '#2563eb')}
          >+ Neue Firma</button>
        </div>
        </div>
      </div>
      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '14px 20px', boxShadow: '0 1px 4px rgba(30,41,59,0.07)', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} style={{ fontSize: 13, padding: '7px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', height: 34 }}>
          <option value="">Alle Status/Tags</option>
          {DEMO_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
        </select>
        <input
          type="text"
          placeholder="Name, E-Mail, Verantwortliche suchen..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ fontSize: 13, padding: '7px 12px', borderRadius: 7, border: '1.5px solid #e2e8f0', outline: 'none', width: 260, background: '#f8fafc', color: '#1e293b' }}
        />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ fontSize: 13, padding: '7px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', height: 34 }}>
          <option value="">Alle Typen</option>
          {types.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} style={{ fontSize: 13, padding: '7px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', height: 34 }}>
          <option value="">Alle Verantwortlichen</option>
          {owners.map((owner: any) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>Erstellt:</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ fontSize: 13, padding: '7px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', height: 34 }} />
          <span style={{ fontSize: 13, color: '#64748b' }}>bis</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ fontSize: 13, padding: '7px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', height: 34 }} />
        </div>
        <button style={{ fontSize: 13, fontWeight: 500, borderRadius: 7, border: '1px solid #2563eb', background: '#fff', color: '#2563eb', padding: '7px 14px', cursor: 'pointer', height: 34 }} onClick={() => { setSearch(""); setTypeFilter(""); setOwnerFilter(""); setDateFrom(""); setDateTo(""); setTagFilter(""); }}>Filter löschen</button>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ fontSize: 13, padding: '7px 10px', borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', height: 34, marginLeft: 'auto' }}>
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

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
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
