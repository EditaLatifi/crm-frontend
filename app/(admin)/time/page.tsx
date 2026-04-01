"use client";
import React, { useState, useEffect, useCallback } from "react";
import './time-mobile.css';
import { api } from '../../../src/api/client';
import { useAuth } from '../../../src/auth/AuthProvider';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';
import Link from 'next/link';

interface TimeEntry {
  id: string;
  user?: { id: string; name: string };
  userId?: string;
  accountId?: string;
  account?: { id: string; name: string };
  taskId?: string;
  task?: { id: string; title: string };
  projectId?: string;
  project?: { id: string; name: string };
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  description?: string;
}

interface FilterUser { id: string; name: string; }
interface FilterAccount { id: string; name: string; }
interface FilterProject { id: string; name: string; }

const PAGE_SIZE = 25;

const inputStyle: React.CSSProperties = {
  padding: '7px 10px', borderRadius: 6, border: '1.5px solid #d1d5db',
  fontSize: 13, background: '#fff', color: '#1e293b', height: 34,
};

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function exportCSV(entries: TimeEntry[], showUser: boolean) {
  const cols = [
    ...(showUser ? ['Benutzer'] : []),
    'Konto', 'Projekt', 'Task', 'Start', 'Ende', 'Dauer (min)', 'Beschrieb',
  ];
  const rows = entries.map(e => [
    ...(showUser ? [e.user?.name ?? e.userId ?? ''] : []),
    e.account?.name ?? e.accountId ?? '',
    e.project?.name ?? '',
    e.task?.title ?? e.taskId ?? '',
    e.startedAt ? new Date(e.startedAt).toLocaleString('de-CH') : '',
    e.endedAt ? new Date(e.endedAt).toLocaleString('de-CH') : '',
    String(e.durationMinutes ?? 0),
    e.description ?? '',
  ]);
  const csv = [cols, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zeiterfassung_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function TimePageContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filter state
  const [filterUser, setFilterUser] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterProject, setFilterProject] = useState('');

  // Dropdown options
  const [users, setUsers] = useState<FilterUser[]>([]);
  const [accounts, setAccounts] = useState<FilterAccount[]>([]);
  const [projects, setProjects] = useState<FilterProject[]>([]);

  // Load filter options on mount
  useEffect(() => {
    if (isAdmin) {
      api.get('/users').then((d: any) => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
    }
    api.get('/accounts').then((d: any) => setAccounts(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/projects').then((d: any) => setProjects(Array.isArray(d) ? d : [])).catch(() => {});
  }, [isAdmin]);

  // Load time entries
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterUser) params.set('userId', filterUser);
    if (filterFrom) params.set('from', filterFrom);
    if (filterTo) params.set('to', filterTo);
    if (filterAccount) params.set('accountId', filterAccount);
    if (filterProject) params.set('projectId', filterProject);
    const qs = params.toString();
    api.get(`/time-entries${qs ? '?' + qs : ''}`)
      .then((d: any) => setEntries(Array.isArray(d) ? d : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [filterUser, filterFrom, filterTo, filterAccount, filterProject]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [filterUser, filterFrom, filterTo, filterAccount, filterProject]);

  const totalMin = entries.reduce((s, e) => s + (e.durationMinutes || 0), 0);
  const totalH = Math.floor(totalMin / 60);
  const totalM = totalMin % 60;

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const pageEntries = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = filterUser || filterFrom || filterTo || filterAccount || filterProject;

  return (
    <div style={{ padding: 32, fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="time-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {isAdmin ? 'Zeiterfassung – Alle Benutzer' : 'Meine Zeiterfassung'}
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            {isAdmin ? 'Übersicht aller erfassten Zeiten' : 'Deine erfassten Arbeitsstunden'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!loading && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {hasFilters ? 'Gefiltert' : 'Gesamt'}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb' }}>{totalH}h {totalM}m</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{entries.length} Einträge</div>
            </div>
          )}
          <button
            onClick={() => exportCSV(entries, isAdmin)}
            disabled={loading || entries.length === 0}
            style={{
              padding: '9px 18px', borderRadius: 8, border: '1.5px solid #2563eb',
              background: '#fff', color: '#2563eb', fontWeight: 600, fontSize: 13,
              cursor: loading || entries.length === 0 ? 'not-allowed' : 'pointer',
              opacity: loading || entries.length === 0 ? 0.5 : 1,
            }}
          >
            CSV Export
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
        padding: '16px 20px', marginBottom: 16,
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end',
      }}>
        {isAdmin && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Benutzer</div>
            <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={inputStyle}>
              <option value="">Alle Benutzer</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Von</div>
          <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Bis</div>
          <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Konto</div>
          <select value={filterAccount} onChange={e => setFilterAccount(e.target.value)} style={inputStyle}>
            <option value="">Alle Konten</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Projekt</div>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)} style={inputStyle}>
            <option value="">Alle Projekte</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        {hasFilters && (
          <button
            onClick={() => { setFilterUser(''); setFilterFrom(''); setFilterTo(''); setFilterAccount(''); setFilterProject(''); }}
            style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 12, cursor: 'pointer', height: 34 }}
          >
            Filter zurücksetzen
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #f1f5f9' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Lade...</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {isAdmin && <th style={thStyle}>Benutzer</th>}
                    <th style={thStyle}>Konto</th>
                    <th style={thStyle}>Projekt</th>
                    <th style={thStyle}>Task</th>
                    <th style={thStyle}>Start</th>
                    <th style={thStyle}>Ende</th>
                    <th style={thStyle}>Dauer</th>
                    <th style={thStyle}>Beschrieb</th>
                  </tr>
                </thead>
                <tbody>
                  {pageEntries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isAdmin ? 8 : 7}
                        style={{ textAlign: 'center', color: '#94a3b8', padding: 32, fontSize: 14 }}
                      >
                        {hasFilters ? 'Keine Einträge für diese Filter.' : 'Keine Zeiteinträge gefunden.'}
                      </td>
                    </tr>
                  ) : pageEntries.map((e, idx) => (
                    <tr key={e.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      {isAdmin && (
                        <td style={tdStyle}>{e.user?.name ?? e.userId ?? '—'}</td>
                      )}
                      <td style={tdStyle}>{e.account?.name ?? e.accountId ?? '—'}</td>
                      <td style={tdStyle}>
                        {e.project
                          ? <Link href={`/projects/${e.project.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>{e.project.name}</Link>
                          : <span style={{ color: '#94a3b8' }}>—</span>
                        }
                      </td>
                      <td style={tdStyle}>
                        {e.task
                          ? <Link href={`/tasks/${e.task.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{e.task.title}</Link>
                          : <span style={{ color: '#94a3b8' }}>—</span>
                        }
                      </td>
                      <td style={tdStyle}>{e.startedAt ? new Date(e.startedAt).toLocaleString('de-CH') : '—'}</td>
                      <td style={tdStyle}>{e.endedAt ? new Date(e.endedAt).toLocaleString('de-CH') : '—'}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#2563eb', whiteSpace: 'nowrap' }}>
                        {typeof e.durationMinutes === 'number' ? formatDuration(e.durationMinutes) : '—'}
                      </td>
                      <td style={{ ...tdStyle, color: '#64748b' }}>{e.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  {entries.length} Einträge · Seite {page} / {totalPages}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : '#fff', color: page === 1 ? '#94a3b8' : '#1e293b', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13 }}
                  >
                    ← Zurück
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: page === totalPages ? '#f8fafc' : '#fff', color: page === totalPages ? '#94a3b8' : '#1e293b', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 13 }}
                  >
                    Weiter →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '11px 16px', fontWeight: 700, color: '#374151',
  borderBottom: '2px solid #e5e7eb', textAlign: 'left',
  background: '#f8fafc', whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 16px', borderBottom: '1px solid #f1f5f9',
  color: '#1e293b', maxWidth: 200, overflow: 'hidden',
  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
};

export default function TimePage() {
  return (
    <ProtectedRoute>
      <TimePageContent />
    </ProtectedRoute>
  );
}
