// Account type definition
"use client";

export interface Account {
  id: string;
  name: string;
  type: string;
  ownerUserId?: string;
  createdAt: string;
  updatedAt?: string;
  email?: string;
  notes?: string;
  address?: string;
  phone?: string;
  tags?: string[];
  status?: string;
}

import { FiEdit2, FiTrash2, FiActivity } from 'react-icons/fi';
import { api } from '../../src/api/client';

// Inline editable account card
function InlineEditableAccountCard({ acc, selected, onSelect, onEdit, getTags, handleEdit, handleDelete, onShowActivity }: any) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(acc.name);
  const [notes, setNotes] = useState(acc.notes || "");
  const router = require('next/navigation').useRouter ? require('next/navigation').useRouter() : null;
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if editing or clicking a button
    if (editing) return;
    // Don't navigate if the click target is a button or inside a button
    if ((e.target as HTMLElement).closest('button')) return;
    if (router) router.push(`/accounts/${acc.id}`);
  };
  return (
    <div
      style={{
        position: 'relative',
        marginBottom: 20,
        background: selected ? '#e9f2ff' : '#fff',
        border: selected ? '2px solid #0052cc' : '1.5px solid #e0e4ea',
        boxShadow: selected ? '0 4px 16px rgba(0,82,204,0.10)' : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.25s, border 0.2s, background 0.2s',
        borderRadius: 12,
        cursor: editing ? 'default' : 'pointer',
        transform: selected ? 'scale(1.01)' : 'scale(1)',
      }}
      onClick={handleCardClick}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,82,204,0.13)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
    >
      <input type="checkbox" checked={selected} onChange={e => onSelect(e.target.checked)} style={{ position: 'absolute', left: 10, top: 10, zIndex: 2, width: 18, height: 18 }} title="Select account" />
      {/* Action icons row at the top, not overlapping content */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '10px 16px 0 16px', background: 'transparent', zIndex: 2 }}>
        <button
          onClick={e => { e.stopPropagation(); e.preventDefault(); handleEdit(acc); }}
          style={{
            background: '#f4f5f7',
            border: 'none',
            borderRadius: 8,
            padding: 6,
            cursor: 'pointer',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0052cc',
            transition: 'background 0.18s, box-shadow 0.18s, transform 0.12s',
            boxShadow: '0 1px 4px rgba(0,82,204,0.07)'
          }}
          title="Edit"
          onMouseEnter={e => e.currentTarget.style.background = '#e9f2ff'}
          onMouseLeave={e => e.currentTarget.style.background = '#f4f5f7'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.93)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        ><FiEdit2 /></button>
        <button
          onClick={e => { e.stopPropagation(); e.preventDefault(); if (window.confirm('Are you sure you want to delete this account?')) handleDelete(acc.id); }}
          style={{
            background: '#fff0f0',
            border: 'none',
            borderRadius: 8,
            padding: 6,
            cursor: 'pointer',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d32f2f',
            transition: 'background 0.18s, box-shadow 0.18s, transform 0.12s',
            boxShadow: '0 1px 4px rgba(211,47,47,0.07)'
          }}
          title="Delete"
          onMouseEnter={e => e.currentTarget.style.background = '#ffeaea'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff0f0'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.93)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        ><FiTrash2 /></button>
        <button
          onClick={e => { e.stopPropagation(); e.preventDefault(); onShowActivity(acc.id); }}
          style={{
            background: '#e9f2ff',
            border: 'none',
            borderRadius: 8,
            padding: 6,
            cursor: 'pointer',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0052cc',
            transition: 'background 0.18s, box-shadow 0.18s, transform 0.12s',
            boxShadow: '0 1px 4px rgba(0,82,204,0.07)'
          }}
          title="Show activity log"
          onMouseEnter={e => e.currentTarget.style.background = '#d6eaff'}
          onMouseLeave={e => e.currentTarget.style.background = '#e9f2ff'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.93)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        ><FiActivity /></button>
      </div>
      {/* Card content below icons */}
      <div
        style={{
          background: 'transparent',
          borderRadius: 10,
          padding: 22,
          fontWeight: 600,
          fontSize: 17,
          color: '#222',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginLeft: 28,
          minHeight: 70,
          userSelect: editing ? 'text' : 'none',
        }}
        onDoubleClick={() => setEditing(true)}
      >
        <div style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: '#e9f2ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 18,
          color: '#0052cc',
          marginRight: 6
        }}>{name?.[0]?.toUpperCase() || '?'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {editing ? (
              <input value={name} onChange={e => setName(e.target.value)} style={{ fontSize: 17, fontWeight: 600, borderRadius: 6, border: '1.5px solid #b3bac5', padding: 4, width: 120 }} />
            ) : (
              <span>{name}</span>
            )}
            {getTags(acc).map((tag: string) => (
              <span key={tag} style={{
                background: tag === 'VIP' ? '#ffe082' : tag === 'Prospect' ? '#b2ebf2' : '#c8e6c9',
                color: tag === 'VIP' ? '#b28704' : tag === 'Prospect' ? '#006064' : '#256029',
                borderRadius: 12,
                padding: '2px 10px',
                fontSize: 12,
                fontWeight: 700,
                marginLeft: 2
              }}>{tag}</span>
            ))}
          </div>
          <div style={{ fontSize: 13, color: '#555', margin: '4px 0 8px 0' }}>Owner: {acc.ownerUserId}</div>
          <div style={{ fontSize: 12, color: '#888' }}>Created: {new Date(acc.createdAt).toLocaleDateString()}</div>
          <div style={{ marginTop: 6 }}>
            {editing ? (
              <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ fontSize: 13, borderRadius: 6, border: '1.5px solid #b3bac5', padding: 4, width: '100%' }} />
            ) : (
              <span style={{ fontSize: 13, color: '#666' }}>{notes}</span>
            )}
          </div>
        </div>
        {editing ? (
          <button onClick={() => { setEditing(false); onEdit({ name, notes }); }} style={{ marginLeft: 8, background: '#0052cc', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>Save</button>
        ) : null}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import ActivityLog from '../activity/ActivityLog';
// Inline quick add form component (global, at top)

import Link from 'next/link';
import Modal from '../ui/Modal';
import AccountEditForm from '../forms/AccountEditForm';


export default function AccountsTable({ search = "", typeFilter = "", ownerFilter = "", dateFrom = "", dateTo = "", sortBy = "createdAt-desc", tagFilter = "" }: { search?: string, typeFilter?: string, ownerFilter?: string, dateFrom?: string, dateTo?: string, sortBy?: string, tagFilter?: string }) {
  const [activityAccountId, setActivityAccountId] = useState<string|null>(null);
    // Export to CSV
    function handleExportCSV() {
      if (!filteredAccounts.length) return;
      const replacer = (key: string, value: any) => value === null ? '' : value;
      const header = Object.keys(filteredAccounts[0]);
      const csv = [
        header.join(','),
        ...filteredAccounts.map((row: any) =>
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
    }

    // Import from CSV
    function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(event) {
        const text = event.target?.result as string;
        if (!text) return;
        const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
        const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g, ''));
        const newAccounts = lines.map(line => {
          const values = line.split(',').map(v => v.replace(/^"|"$/g, ''));
          const obj: any = {};
          headers.forEach((h, i) => { obj[h] = values[i]; });
          // Generate id and createdAt if missing
          if (!obj.id) obj.id = Math.random().toString(36).slice(2);
          if (!obj.createdAt) obj.createdAt = new Date().toISOString();
          if (!obj.type) obj.type = 'Client';
          return obj;
        });
        setAccounts(accs => [...newAccounts, ...accs]);
      };
      reader.readAsText(file);
      // Reset input value so same file can be uploaded again if needed
      e.target.value = '';
    }
  const [accounts, setAccounts] = useState<Account[]>([]);
  // (removed duplicate declaration of accountsArray)
  // (removed duplicate declaration of accountsArray)
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [showBulkBar, setShowBulkBar] = useState(false);
  // Bulk actions handlers
    // Quick add handler
    const handleQuickAdd = (data: any) => {
      setAccounts((accs: Account[]) => [
        { ...data, id: Math.random().toString(36).slice(2), createdAt: new Date().toISOString(), ownerUserId: 'me', type: data.type || 'Client', name: data.name || '', email: data.email || '' },
        ...accs
      ]);
    };
  const handleSelect = (id: string, checked: boolean) => {
    setSelected(sel => checked ? [...sel, id] : sel.filter(sid => sid !== id));
  };
  const handleSelectAll = (ids: string[], checked: boolean) => {
    setSelected(checked ? ids : []);
  };
  const handleBulkDelete = () => {
    setAccounts((accs: Account[]) => accs.filter((a: Account) => !selected.includes(a.id)));
    setSelected([]);
    setShowBulkBar(false);
  };
  // Placeholder for assign/change type
  const handleBulkAssign = () => { setShowBulkBar(false); setSelected([]); };
  const handleBulkType = () => { setShowBulkBar(false); setSelected([]); };

  useEffect(() => {
    api.get('/api/accounts')
      .then(data => {
        console.log('Fetched accounts:', data);
        setAccounts(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        // Optionally, set an error state here
        console.error('Failed to fetch accounts:', err);
      });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginTop: 24 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ flex: 1, background: '#f4f5f7', borderRadius: 8, padding: 16, minWidth: 250 }}>
          <div style={{ height: 32, background: '#e0e4ea', borderRadius: 6, marginBottom: 16, width: '60%', margin: '0 auto 16px auto' }} />
          {[1,2].map(j => (
            <div key={j} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 20, marginBottom: 20, opacity: 0.5 }}>
              <div style={{ height: 18, background: '#e0e4ea', borderRadius: 4, marginBottom: 8, width: '70%' }} />
              <div style={{ height: 12, background: '#e0e4ea', borderRadius: 4, marginBottom: 6, width: '40%' }} />
              <div style={{ height: 10, background: '#e0e4ea', borderRadius: 4, width: '50%' }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // Filter accounts by search
  // Demo tags/statuses for each account (mock, or use a.tags if present)
  const getTags = (a: Account) => a.tags || a.status ? [a.status!] : (a.id && parseInt(a.id, 36) % 3 === 0 ? ['VIP'] : parseInt(a.id, 36) % 3 === 1 ? ['Prospect'] : ['Active']);
  const accountsArray: Account[] = Array.isArray(accounts) ? accounts : [];
  let filteredAccounts = accountsArray.filter((a: any) => {
    const q = search.toLowerCase();
    const matchesSearch = (
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.ownerUserId?.toLowerCase().includes(q)
    );
    const matchesType = !typeFilter || a.type === typeFilter;
    const matchesOwner = !ownerFilter || a.ownerUserId === ownerFilter;
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(a.createdAt) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(a.createdAt) <= new Date(dateTo);
    }
    const tags = getTags(a);
    const matchesTag = !tagFilter || tags.includes(tagFilter);
    return matchesSearch && matchesType && matchesOwner && matchesDate && matchesTag;
  });

  // Sorting logic
  const [sortField, sortDir] = sortBy.split('-');
  filteredAccounts = filteredAccounts.slice().sort((a: any, b: any) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (sortField === 'createdAt') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else {
      aVal = (aVal || '').toString().toLowerCase();
      bVal = (bVal || '').toString().toLowerCase();
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Collect all tags for filter dropdown
  const allTags = Array.from(new Set((Array.isArray(accounts) ? accounts : []).flatMap(getTags)));


  // Only show columns that have accounts (as before)
  // (removed duplicate declaration of accountsArray)
  const types = Array.from(new Set(filteredAccounts.map((a: Account) => a.type)));
  const grouped = types.map(type => ({
    type,
    accounts: filteredAccounts.filter((a: Account) => a.type === type)
  }));

  const handleEdit = (account: any) => {
    setEditAccount(account);
    setEditModalOpen(true);
  };
  const handleEditSubmit = async (data: any) => {
    if (!editAccount) return;
    try {
      // Map UI type to backend enum only if type is present and changed
      const typeMap: Record<string, string> = {
        'Client': 'CLIENT',
        'Partner': 'PARTNER',
        'Potential Client': 'POTENTIAL_CLIENT',
      };
      const payload: any = { ...data };
      if (typeof data.type !== 'undefined' && data.type !== editAccount.type) {
        payload.type = typeMap[data.type] || 'CLIENT';
      } else {
        // Don't send type if not changed
        delete payload.type;
      }
      await api.patch(`/api/accounts/${editAccount.id}`, payload);
      setAccounts(accs => accs.map((a: any) => a.id === editAccount.id ? { ...a, ...payload } : a));
    } catch (err) {
      alert('Error updating account');
    }
    setEditModalOpen(false);
    setEditAccount(null);
  };
  const handleDelete = async (accountId: string) => {
    try {
      await api.delete(`/api/accounts/${accountId}`);
      setAccounts(accs => accs.filter((a: any) => a.id !== accountId));
    } catch (err) {
      alert('Error deleting account');
    }
  };

  return (
    <>
      {/* Export/Import CSV buttons moved to filters section in page.tsx */}
      {selected.length > 0 && (
        <div className="accounts-bulk-bar" style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f4f5f7', borderBottom: '1.5px solid #b3bac5', padding: 12, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontWeight: 600 }}>{selected.length} selected</span>
          <div className="accounts-bulk-buttons">
            <button onClick={handleBulkDelete} style={{ background: '#fff0f0', color: '#d32f2f', border: '1.5px solid #d32f2f', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            <button onClick={handleBulkAssign} style={{ background: '#e9f2ff', color: '#0052cc', border: '1.5px solid #0052cc', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>Assign Owner</button>
            <button onClick={handleBulkType} style={{ background: '#f4f5f7', color: '#222', border: '1.5px solid #b3bac5', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>Change Type</button>
            <button onClick={() => setSelected([])} style={{ marginLeft: 8, background: '#fff', color: '#0052cc', border: '1.5px solid #b3bac5', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
          </div>
        </div>
      )}
      {/* Removed duplicate Export/Import CSV buttons below filters */}
      <div className="accounts-table-section">
        {grouped.map(col => {
          const allIds = col.accounts.map((acc: any) => acc.id);
          const allSelected = allIds.every(id => selected.includes(id)) && allIds.length > 0;
          return (
            <div key={col.type} className="accounts-table-col">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: 1,
                  color: '#0052cc',
                  textTransform: 'uppercase',
                  background: '#e9f2ff',
                  borderRadius: 6,
                  padding: '8px 0',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  flex: 1
                }}>{col.type}</div>
                <input type="checkbox" checked={allSelected} onChange={e => handleSelectAll(allIds, e.target.checked)} style={{ marginLeft: 8, width: 18, height: 18 }} title="Select all in column" />
              </div>
              {col.accounts.length === 0 && (
                <div style={{ color: '#bbb', textAlign: 'center', fontStyle: 'italic', margin: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.8, transition: 'opacity 0.2s' }}>
                  <span style={{ fontSize: 38, opacity: 0.5 }}>🗂️</span>
                  <span>No accounts</span>
                </div>
              )}
              {col.accounts.map((acc: any) => (
                <div key={acc.id} className="account-card">
                  <InlineEditableAccountCard
                    acc={acc}
                    selected={selected.includes(acc.id)}
                    onSelect={checked => handleSelect(acc.id, checked)}
                    onEdit={patch => setAccounts(accs => accs.map(a => a.id === acc.id ? { ...a, ...patch } : a))}
                    getTags={getTags}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    onShowActivity={setActivityAccountId}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Account">
        {editAccount && <AccountEditForm initialData={editAccount} onSubmit={handleEditSubmit} onCancel={() => setEditModalOpen(false)} />}
      </Modal>
      {activityAccountId && (
        <ActivityLog accountId={activityAccountId} onClose={() => setActivityAccountId(null)} />
      )}
    </>
  );
}
