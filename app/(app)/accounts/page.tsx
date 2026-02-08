"use client";

import AccountsTable from '../../../components/tables/AccountsTable';
import Modal from '../../../components/ui/Modal';
import AccountForm from '../../../components/forms/AccountForm';
import React, { useState, useEffect, useRef } from 'react';
import './accounts-desktop.css';


// Demo tags for filter dropdown (should be fetched from API in real app)
const DEMO_TAGS = ['VIP', 'Prospect', 'Active'];




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
    fetch('/api/accounts')
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
    fetch('/api/users')
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
      const res = await fetch('/api/accounts', {
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

  return (
    <div className="accounts-responsive">
      {/* Blue header only behind title/subtitle */}
      <div className="page-section-blue accounts-header">
        <div className="accounts-header-row">
          <div>
            <h1 className="accounts-title">Accounts</h1>
          </div>
          <button className="accounts-new-btn" onClick={() => setModalOpen(true)}>+ New Account</button>
        </div>
      </div>
      {/* Filters and actions in a white card overlapping the header */}
      <div className="accounts-filters-card">
        <div className="accounts-filters-row">
          <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="accounts-filter-select">
            <option value="">All Status/Tags</option>
            {DEMO_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
          <input
            type="text"
            placeholder="Search name, email, owner..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="accounts-filter-input"
          />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="accounts-filter-select">
            <option value="">All Types</option>
            {types.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="accounts-filter-select">
            <option value="">All Owners</option>
            {owners.map(owner => <option key={owner} value={owner}>{owner}</option>)}
          </select>
          <div className="accounts-filter-date-row">
            <label className="accounts-filter-date-label">Created:</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="accounts-filter-date" />
            <span className="accounts-filter-date-sep">to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="accounts-filter-date" />
          </div>
          <button className="accounts-filter-clear" onClick={() => { setSearch(""); setTypeFilter(""); setOwnerFilter(""); setDateFrom(""); setDateTo(""); }}>Clear Filters</button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="accounts-filter-select">
            <option value="createdAt-desc">Sort: Newest</option>
            <option value="createdAt-asc">Sort: Oldest</option>
            <option value="name-asc">Sort: Name A-Z</option>
            <option value="name-desc">Sort: Name Z-A</option>
            <option value="type-asc">Sort: Type A-Z</option>
            <option value="type-desc">Sort: Type Z-A</option>
            <option value="ownerUserId-asc">Sort: Owner A-Z</option>
            <option value="ownerUserId-desc">Sort: Owner Z-A</option>
          </select>
        </div>
        <div className="accounts-filters-actions">
          <button className="accounts-export-btn" onClick={() => tableRef.current?.handleExportCSV?.()}>Export CSV</button>
          <label className="accounts-import-label">
            Import CSV
            <input type="file" accept=".csv" onChange={e => tableRef.current?.handleImportCSV?.(e)} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
      <div className="page-section-white accounts-table-section">
        <AccountsTable key={tableKey} search={search} typeFilter={typeFilter} ownerFilter={ownerFilter} dateFrom={dateFrom} dateTo={dateTo} sortBy={sortBy} tagFilter={tagFilter} />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Account">
        <AccountForm onSubmit={handleCreate} />
      </Modal>
    </div>
  );
}
