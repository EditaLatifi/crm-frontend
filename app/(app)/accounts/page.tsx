"use client";

import AccountsTable from '../../../components/tables/AccountsTable';
import Modal from '../../../components/ui/Modal';
import AccountForm from '../../../components/forms/AccountForm';
import CsvImportModal from '../../../components/ui/CsvImportModal';
import React, { useState, useEffect, useRef } from 'react';
import { fetchWithAuth, api } from '../../../src/api/client';
import { useAuth } from '../../../src/auth/AuthProvider';
import { useToast } from '../../../components/ui/Toast';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './accounts-desktop.css';
import './accounts-mobile.css';

const KANBAN_COLUMNS = [
  { type: 'CLIENT',           label: 'Kunden',       color: '#1a1a1a', bg: '#F5F3EE' },
  { type: 'POTENTIAL_CLIENT', label: 'Interessenten', color: '#7c3aed', bg: '#F5F0FF' },
  { type: 'PARTNER',          label: 'Partner',       color: '#e8a838', bg: '#FFF8EC' },
  { type: 'SUPPLIER',         label: 'Lieferanten',   color: '#059669', bg: '#F0FDF4' },
];

function AccountsKanban({ accounts, onTypeChange }: { accounts: any[]; onTypeChange?: (id: string, newType: string) => void }) {
  const router = useRouter();

  const onDragEnd = (result: any) => {
    if (!result.destination || !onTypeChange) return;
    const newType = result.destination.droppableId;
    const accountId = result.draggableId;
    if (result.source.droppableId !== newType) {
      onTypeChange(accountId, newType);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${KANBAN_COLUMNS.length}, 1fr)`, gap: 16 }}>
        {KANBAN_COLUMNS.map(col => {
          const items = accounts.filter(a => a.type === col.type);
          return (
            <div key={col.type} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E4DE', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', background: col.bg, borderBottom: '1px solid #E8E4DE', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: col.color }}>{col.label}</span>
                <span style={{ background: col.color, color: '#fff', borderRadius: 10, padding: '2px 9px', fontSize: 12, fontWeight: 600 }}>{items.length}</span>
              </div>
              <Droppable droppableId={col.type}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80, background: snapshot.isDraggingOver ? `${col.color}08` : 'transparent', transition: 'background 0.2s' }}>
                    {items.length === 0 && !snapshot.isDraggingOver && (
                      <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>Keine Einträge</div>
                    )}
                    {items.map((a, idx) => (
                      <Draggable key={a.id} draggableId={a.id} index={idx}>
                        {(prov, snap) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                            onClick={() => { if (!snap.isDragging) router.push(`/accounts/${a.id}`); }}
                            style={{ ...prov.draggableProps.style, background: '#fff', borderRadius: 10, border: snap.isDragging ? '1.5px solid #1a1a1a' : '1px solid #E8E4DE', padding: '12px 14px', cursor: 'grab', boxShadow: snap.isDragging ? '0 4px 16px rgba(0,0,0,0.10)' : 'none', transition: 'box-shadow 0.15s' }}
                            onMouseEnter={e => { if (!snap.isDragging) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
                            onMouseLeave={e => { if (!snap.isDragging) e.currentTarget.style.boxShadow = 'none'; }}
                          >
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', marginBottom: 2 }}>{a.name}</div>
                            {a.email && <div style={{ fontSize: 11, color: '#64748b' }}>{a.email}</div>}
                            {a.phone && <div style={{ fontSize: 11, color: '#64748b' }}>{a.phone}</div>}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}


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
  const [view, setView] = useState<'table' | 'kanban'>('table');
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
      'Supplier': 'SUPPLIER',
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

  const [accounts, setAccounts] = useState<any[]>([]);
  const [csvOpen, setCsvOpen] = useState(false);

  const handleKanbanTypeChange = async (accountId: string, newType: string) => {
    try {
      await api.patch(`/accounts/${accountId}`, { type: newType });
      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, type: newType } : a));
      setTableKey(k => k + 1);
      toast.success('Typ geändert.');
    } catch {
      toast.error('Typ konnte nicht geändert werden.');
    }
  };

  // 3. Fetch accounts and update state
  useEffect(() => {
    api.get('/accounts')
      .then((data: any) => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [tableKey]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px 40px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="accounts-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Firmen</h1>
          <div style={{ fontSize: 13, color: '#999', fontWeight: 400, marginTop: 4 }}>Verwalte deine Geschäftsfirmen effizient und sicher.</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="view-toggle" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: 8, border: '1px solid #E8E4DE', overflow: 'hidden' }}>
            <button onClick={() => setView('table')} style={{ fontSize: 13, fontWeight: 600, padding: '8px 16px', border: 'none', background: view === 'table' ? '#1a1a1a' : '#fff', color: view === 'table' ? '#fff' : '#666', cursor: 'pointer' }}>Tabelle</button>
            <button onClick={() => setView('kanban')} style={{ fontSize: 13, fontWeight: 600, padding: '8px 16px', border: 'none', background: view === 'kanban' ? '#1a1a1a' : '#fff', color: view === 'kanban' ? '#fff' : '#666', cursor: 'pointer' }}>Kanban</button>
          </div>
          <button onClick={() => handleExportCSV(accounts)} style={{ fontSize: 13, fontWeight: 500, borderRadius: 8, border: '1px solid #E8E4DE', background: '#fff', color: '#666', padding: '8px 16px', cursor: 'pointer' }}>CSV exportieren</button>
          <button onClick={() => setCsvOpen(true)} style={{ fontSize: 13, fontWeight: 500, borderRadius: 8, border: '1px solid #E8E4DE', background: '#fff', color: '#666', padding: '8px 16px', cursor: 'pointer' }}>CSV importieren</button>
          <button
            style={{ fontSize: 13, fontWeight: 600, borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', padding: '9px 20px', cursor: 'pointer' }}
            onClick={() => setModalOpen(true)}
          >+ Neue Firma</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid #E8E4DE', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Search + sort */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <input type="text" placeholder="Suchen..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ fontSize: 13, padding: '8px 12px 8px 32px', borderRadius: 8, border: '1px solid #E8E4DE', outline: 'none', width: '100%', background: '#FAF9F6', color: '#1a1a1a', boxSizing: 'border-box' }} />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: 14 }}>&#128269;</span>
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ fontSize: 12, padding: '7px 10px', borderRadius: 8, border: '1px solid #E8E4DE', background: '#fff', color: '#666', marginLeft: 'auto' }}>
            <option value="createdAt-desc">Neueste zuerst</option>
            <option value="createdAt-asc">Älteste zuerst</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>
        </div>
        {/* Type + Owner chips */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#999', fontWeight: 600, marginRight: 4 }}>Typ:</span>
          {KANBAN_COLUMNS.map(col => {
            const active = typeFilter === col.type;
            return (
              <button key={col.type} onClick={() => setTypeFilter(active ? '' : col.type)}
                style={{ fontSize: 12, fontWeight: 500, padding: '5px 14px', borderRadius: 20, border: `1px solid ${active ? '#1a1a1a' : '#E8E4DE'}`, background: active ? '#1a1a1a' : '#fff', color: active ? '#fff' : '#666', cursor: 'pointer', transition: 'all 0.15s' }}>
                {col.label}
              </button>
            );
          })}
          {owners.length > 0 && (
            <>
              <span style={{ fontSize: 11, color: '#999', fontWeight: 600, marginLeft: 12, marginRight: 4 }}>Verantwortlich:</span>
              {owners.slice(0, 5).map(owner => {
                const active = ownerFilter === owner.id;
                return (
                  <button key={owner.id} onClick={() => setOwnerFilter(active ? '' : owner.id)}
                    style={{ fontSize: 12, fontWeight: 500, padding: '5px 14px', borderRadius: 20, border: `1px solid ${active ? '#1a1a1a' : '#E8E4DE'}`, background: active ? '#1a1a1a' : '#fff', color: active ? '#fff' : '#666', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {owner.name}
                  </button>
                );
              })}
            </>
          )}
        </div>
        {/* Date range + clear */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#999', fontWeight: 600 }}>Erstellt:</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ fontSize: 12, padding: '5px 8px', borderRadius: 8, border: '1px solid #E8E4DE', background: '#FAF9F6', color: '#1a1a1a' }} />
          <span style={{ fontSize: 11, color: '#999' }}>bis</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ fontSize: 12, padding: '5px 8px', borderRadius: 8, border: '1px solid #E8E4DE', background: '#FAF9F6', color: '#1a1a1a' }} />
          {(typeFilter || ownerFilter || dateFrom || dateTo || search || tagFilter) && (
            <button onClick={() => { setSearch(""); setTypeFilter(""); setOwnerFilter(""); setDateFrom(""); setDateTo(""); setTagFilter(""); }}
              style={{ fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 20, border: '1px solid #dc2626', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', marginLeft: 8 }}>
              Filter löschen
            </button>
          )}
        </div>
      </div>

      {/* Table / Kanban */}
      {view === 'kanban' ? (
        <AccountsKanban accounts={accounts} onTypeChange={handleKanbanTypeChange} />
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E4DE', overflow: 'hidden' }}>
          <AccountsTable
            key={tableKey}
            search={search}
            typeFilter={typeFilter}
            ownerFilter={ownerFilter}
            dateFrom={dateFrom}
            dateTo={dateTo}
            sortBy={sortBy}
            tagFilter={tagFilter}
            onSortChange={setSortBy}
          />
        </div>
      )}
      <CsvImportModal open={csvOpen} onClose={() => setCsvOpen(false)} entityType="accounts" onImported={() => setTableKey(k => k + 1)} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Neue Firma">
        <AccountForm onSubmit={handleCreate} />
      </Modal>
    </div>
  );
}
