"use client";
import TasksTable from '../../../components/tables/TasksTable';
import React, { useState, useEffect } from 'react';
import { api } from '../../../src/api/client';
import { useAuth } from '../../../src/auth/AuthProvider';
import { getAllPhaseCodes } from '../../../src/lib/siaPhases';

export default function TasksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'OPEN',
    priority: 'LOW',
    dueDate: '',
    assignedToUserId: '',
    accountId: '',
    contactId: '',
    dealId: '',
    projectId: '',
    phase: '',
    specification: '',
    assigneeIds: [] as string[],
    budgetHours: '',
  });
  const phaseOptions = getAllPhaseCodes();
  const [users, setUsers] = useState<{ id: string; name?: string; email?: string }[]>([]);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [deals, setDeals] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (showForm) {
      api.get('/users').then(data => setUsers(Array.isArray(data) ? data : [])).catch(() => {});
      api.get('/accounts').then(data => setAccounts(Array.isArray(data) ? data : [])).catch(() => {});
      api.get('/contacts').then(data => setContacts(Array.isArray(data) ? data : [])).catch(() => {});
      api.get('/deals').then(data => setDeals(Array.isArray(data) ? data : [])).catch(() => {});
      api.get('/projects').then(data => setProjects(Array.isArray(data) ? data : [])).catch(() => {});
    }
  }, [showForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/tasks', form);
      setForm({ title: '', description: '', status: 'OPEN', priority: 'LOW', dueDate: '', assignedToUserId: '', accountId: '', contactId: '', dealId: '', projectId: '', phase: '', specification: '', assigneeIds: [], budgetHours: '' });
      setShowForm(false);
      setRefreshKey(k => k + 1);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1.5px solid #e2e8f0', fontSize: 13, color: '#1e293b',
    background: '#f8fafc', boxSizing: 'border-box', outline: 'none',
  };
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 40px', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f8f9fb 60%, #e9effd 100%)',
        borderRadius: 18, boxShadow: '0 4px 16px rgba(30,41,59,0.10)',
        padding: '28px 28px 22px', marginBottom: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>Aufgaben</h1>
          <div style={{ fontSize: 14, color: '#64748b', fontWeight: 400, marginTop: 5 }}>Verwalte und priorisiere deine Aufgaben im Kanban-Board.</div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ fontSize: 14, fontWeight: 600, borderRadius: 8, border: '1.5px solid #2563eb', background: '#2563eb', color: '#fff', padding: '9px 20px', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseOver={e => (e.currentTarget.style.background = '#1d4ed8')}
          onMouseOut={e => (e.currentTarget.style.background = '#2563eb')}
        >
          + Neue Aufgabe
        </button>
      </div>

      {/* Kanban board */}
      <TasksTable key={refreshKey} />

      {/* Create modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Neue Aufgabe</div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Titel *</label>
                  <input required style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Aufgabentitel" />
                </div>
                <div>
                  <label style={labelStyle}>Beschreibung</label>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Beschreibung (optional)" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      <option value="OPEN">Offen</option>
                      <option value="IN_PROGRESS">In Bearbeitung</option>
                      <option value="DONE">Erledigt</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Priorität</label>
                    <select style={inputStyle} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                      <option value="LOW">Niedrig</option>
                      <option value="MEDIUM">Mittel</option>
                      <option value="HIGH">Wichtig</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Fälligkeitsdatum</label>
                  <input type="date" style={inputStyle} value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Zugewiesen an</label>
                  <select style={inputStyle} value={form.assignedToUserId} onChange={e => setForm(f => ({ ...f, assignedToUserId: e.target.value }))}>
                    <option value="">Keine Zuweisung</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Firma</label>
                    <select style={inputStyle} value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}>
                      <option value="">Keine Firma</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Kontakt</label>
                    <select style={inputStyle} value={form.contactId} onChange={e => setForm(f => ({ ...f, contactId: e.target.value }))}>
                      <option value="">Kein Kontakt</option>
                      {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Deal</label>
                    <select style={inputStyle} value={form.dealId} onChange={e => setForm(f => ({ ...f, dealId: e.target.value }))}>
                      <option value="">Kein Deal</option>
                      {deals.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Projekt</label>
                    <select style={inputStyle} value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                      <option value="">Kein Projekt</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Leistungsphase (SIA) *</label>
                  <select style={inputStyle} value={form.phase} onChange={e => setForm(f => ({ ...f, phase: e.target.value }))}>
                    <option value="">— Phase wählen —</option>
                    {phaseOptions.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
                  </select>
                </div>
                {isAdmin && (
                  <div>
                    <label style={labelStyle}>Stundenkontingent (h)</label>
                    <input type="number" min="0" step="0.5" style={inputStyle} value={form.budgetHours} onChange={e => setForm(f => ({ ...f, budgetHours: e.target.value }))} placeholder="z.B. 40" />
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Weitere Mitarbeiter</label>
                  <select multiple style={{ ...inputStyle, minHeight: 80 }} value={form.assigneeIds}
                    onChange={e => setForm(f => ({ ...f, assigneeIds: Array.from(e.target.selectedOptions, o => o.value) }))}>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                  </select>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Ctrl/Cmd + Klick für Mehrfachauswahl</div>
                </div>
                <div>
                  <label style={labelStyle}>Spezifikation</label>
                  <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={form.specification} onChange={e => setForm(f => ({ ...f, specification: e.target.value }))} placeholder="Freitext-Spezifikation (optional)" />
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
                <button type="submit" disabled={saving} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Erstelle...' : 'Aufgabe erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
