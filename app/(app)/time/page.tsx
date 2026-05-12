"use client";
import React, { useState, useEffect } from "react";
import { api } from '../../../src/api/client';
import { useAuth } from '../../../src/auth/AuthProvider';
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
  projectPhase?: { id: string; name: string; order?: number; budgetHours?: number; timeEntries?: { durationMinutes: number }[] };
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

function formatDateDE(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getWeekBounds(): [Date, Date] {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return [mon, sun];
}

function computeKPIs(entries: TimeEntry[]) {
  const now = new Date();
  const [weekStart, weekEnd] = getWeekBounds();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  let weekMin = 0;
  let monthMin = 0;
  const projectIds = new Set<string>();

  for (const e of entries) {
    const d = new Date(e.startedAt);
    const dur = e.durationMinutes || 0;
    if (d >= weekStart && d <= weekEnd) weekMin += dur;
    if (d >= monthStart && d <= monthEnd) monthMin += dur;
    if (e.projectId || e.project?.id) projectIds.add((e.projectId || e.project?.id)!);
  }

  return {
    weekHours: (weekMin / 60).toFixed(1),
    monthHours: (monthMin / 60).toFixed(1),
    projectCount: projectIds.size,
  };
}

function exportCSV(entries: TimeEntry[], showUser: boolean) {
  const cols = [
    ...(showUser ? ['Benutzer'] : []),
    'Konto', 'Projekt', 'Phase', 'Task', 'Datum', 'Dauer (min)', 'Beschrieb',
  ];
  const rows = entries.map(e => [
    ...(showUser ? [e.user?.name ?? e.userId ?? ''] : []),
    e.account?.name ?? e.accountId ?? '',
    e.project?.name ?? '',
    e.projectPhase?.name ?? '',
    e.task?.title ?? e.taskId ?? '',
    e.startedAt ? formatDateDE(e.startedAt) : '',
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

export default function TimePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isManager = isAdmin || user?.role === 'PROJEKTLEITER';

  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [filterUser, setFilterUser] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterProject, setFilterProject] = useState('');

  const [users, setUsers] = useState<FilterUser[]>([]);
  const [accounts, setAccounts] = useState<FilterAccount[]>([]);
  const [projects, setProjects] = useState<FilterProject[]>([]);

  useEffect(() => {
    if (isManager) {
      api.get('/users').then((d: any) => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
    }
    api.get('/accounts').then((d: any) => setAccounts(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/projects').then((res: any) => setProjects(res?.data ?? (Array.isArray(res) ? res : []))).catch(() => {});
  }, [isManager]);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {isManager ? 'Zeiterfassung' : 'Meine Zeiterfassung'}
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            {isManager ? 'Übersicht aller erfassten Zeiten' : 'Deine erfassten Arbeitsstunden'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!loading && (
            <div style={{ background: '#fff', border: '1px solid #E8E4DE', borderRadius: 10, padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {hasFilters ? 'Gefiltert' : 'Gesamt'}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>{totalH}h {totalM}m</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{entries.length} Einträge</div>
            </div>
          )}
          <button
            onClick={() => exportCSV(entries, isManager)}
            disabled={loading || entries.length === 0}
            style={{
              padding: '9px 18px', borderRadius: 8, border: '1.5px solid #1a1a1a',
              background: '#fff', color: '#1a1a1a', fontWeight: 600, fontSize: 13,
              cursor: loading || entries.length === 0 ? 'not-allowed' : 'pointer',
              opacity: loading || entries.length === 0 ? 0.5 : 1,
            }}
          >
            CSV Export
          </button>
        </div>
      </div>

      {/* KPI cards */}
      {!loading && entries.length > 0 && (() => {
        const kpi = computeKPIs(entries);
        const cardStyle: React.CSSProperties = {
          flex: '1 1 0', background: '#fff', border: '1px solid #E8E4DE',
          borderRadius: 10, padding: '18px 22px', minWidth: 160,
        };
        const numStyle: React.CSSProperties = {
          fontSize: 26, fontWeight: 700, color: '#0f172a', lineHeight: 1.2,
        };
        const labelStyle: React.CSSProperties = {
          fontSize: 12, color: '#94a3b8', fontWeight: 500, marginTop: 4,
        };
        return (
          <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={cardStyle}>
              <div style={numStyle}>{kpi.weekHours}h</div>
              <div style={labelStyle}>Diese Woche</div>
            </div>
            <div style={cardStyle}>
              <div style={numStyle}>{kpi.monthHours}h</div>
              <div style={labelStyle}>Dieser Monat</div>
            </div>
            <div style={cardStyle}>
              <div style={numStyle}>{kpi.projectCount}</div>
              <div style={labelStyle}>Projekte bebucht</div>
            </div>
          </div>
        );
      })()}

      {/* Filter bar */}
      <div style={{
        background: '#fff', borderRadius: 10, border: '1px solid #E8E4DE',
        padding: '16px 20px', marginBottom: 16,
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end',
      }}>
        {isManager && (
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
            style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #E8E4DE', background: '#FAF9F6', color: '#64748b', fontSize: 12, cursor: 'pointer', height: 34 }}
          >
            Filter zurücksetzen
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E8E4DE' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Lade...</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#FAF9F6' }}>
                    {isManager && <th style={thStyle}>Benutzer</th>}
                    <th style={thStyle}>Konto</th>
                    <th style={thStyle}>Projekt</th>
                    <th style={thStyle}>Phase</th>
                    <th style={thStyle}>Task</th>
                    <th style={thStyle}>Datum</th>
                    <th style={thStyle}>Dauer</th>
                    <th style={thStyle}>Kontingent</th>
                    <th style={thStyle}>Beschrieb</th>
                  </tr>
                </thead>
                <tbody>
                  {pageEntries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isManager ? 9 : 8}
                        style={{ textAlign: 'center', color: '#94a3b8', padding: 32, fontSize: 14 }}
                      >
                        {hasFilters ? 'Keine Einträge für diese Filter.' : 'Keine Zeiteinträge gefunden.'}
                      </td>
                    </tr>
                  ) : pageEntries.map((e, idx) => (
                    <tr key={e.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      {isManager && (
                        <td style={tdStyle}>{e.user?.name ?? e.userId ?? '—'}</td>
                      )}
                      <td style={tdStyle}>{e.account?.name ?? e.accountId ?? '—'}</td>
                      <td style={tdStyle}>
                        {e.project
                          ? <Link href={`/projects/${e.project.id}`} style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 500 }}>{e.project.name}</Link>
                          : <span style={{ color: '#94a3b8' }}>—</span>
                        }
                      </td>
                      <td style={tdStyle}>
                        {e.projectPhase?.name
                          ? <span style={{ color: '#1e293b' }}>{e.projectPhase.name}</span>
                          : <span style={{ color: '#94a3b8' }}>—</span>
                        }
                      </td>
                      <td style={tdStyle}>
                        {e.task
                          ? <Link href={`/tasks/${e.task.id}`} style={{ color: '#1a1a1a', textDecoration: 'none' }}>{e.task.title}</Link>
                          : <span style={{ color: '#94a3b8' }}>—</span>
                        }
                      </td>
                      <td style={tdStyle}>{e.startedAt ? formatDateDE(e.startedAt) : '—'}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                        {typeof e.durationMinutes === 'number' ? formatDuration(e.durationMinutes) : '—'}
                      </td>
                      <td style={tdStyle}>
                        {(() => {
                          const ph = e.projectPhase;
                          if (!ph?.budgetHours || !ph.timeEntries) return <span style={{ color: '#94a3b8' }}>—</span>;
                          const usedMin = ph.timeEntries.reduce((s, t) => s + t.durationMinutes, 0);
                          const usedH = usedMin / 60;
                          const pct = Math.round((usedH / ph.budgetHours) * 100);
                          const barColor = pct >= 100 ? '#dc2626' : pct >= 80 ? '#d97706' : '#16a34a';
                          return (
                            <div style={{ minWidth: 90 }}>
                              <div style={{ fontSize: 11, color: '#475569', marginBottom: 3 }}>{usedH.toFixed(1)}h / {ph.budgetHours}h</div>
                              <div style={{ height: 4, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: barColor, borderRadius: 4 }} />
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td style={{ ...tdStyle, color: '#64748b' }}>{e.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #E8E4DE' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  {entries.length} Einträge · Seite {page} / {totalPages}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid #E8E4DE', background: page === 1 ? '#FAF9F6' : '#fff', color: page === 1 ? '#94a3b8' : '#1e293b', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13 }}
                  >
                    ← Zurück
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid #E8E4DE', background: page === totalPages ? '#FAF9F6' : '#fff', color: page === totalPages ? '#94a3b8' : '#1e293b', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 13 }}
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
  background: '#FAF9F6', whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 16px', borderBottom: '1px solid #E8E4DE',
  color: '#1e293b', maxWidth: 200, overflow: 'hidden',
  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
};
