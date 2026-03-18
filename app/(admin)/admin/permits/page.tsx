"use client";
import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../../src/api/client';
import ProtectedRoute from '../../../../src/routes/ProtectedRoute';
import { PERMIT_STATUS_LABELS, PERMIT_STATUS_COLORS } from '../../../../components/permits/permitConfig';
import { FiSearch, FiFilter } from 'react-icons/fi';
import '../../../(app)/projects/projects.css';

const STATUSES = ['VORBEREITUNG','EINGEREICHT','IN_PRUEFUNG','NACHFORDERUNG','BEWILLIGT','ABGELEHNT','ZURUECKGEZOGEN'];

function fmt(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function AdminPermitsContent() {
  const [permits, setPermits] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(() => {
    Promise.all([api.get('/permits'), api.get('/permits/stats')])
      .then(([p, s]) => { setPermits(Array.isArray(p) ? p : []); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = permits.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) &&
        !p.project?.name?.toLowerCase().includes(search.toLowerCase()) &&
        !p.authority?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="proj-admin-page">
      <div className="proj-admin-header">
        <div>
          <h1 className="proj-page-title">Baubewilligungen</h1>
          <p className="proj-page-subtitle">Übersicht aller Bewilligungsverfahren</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="proj-admin-stats-card" style={{ marginBottom: 24 }}>
          <div className="proj-stats-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' }}>
            <div style={{ background: '#eff6ff', borderRadius: 12, padding: '14px 16px', border: '1px solid #bfdbfe22' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#2563eb' }}>{stats.total}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Total</div>
            </div>
            <div style={{ background: '#fef2f2', borderRadius: 12, padding: '14px 16px', border: '1px solid #fecaca22' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626' }}>{stats.overdue}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Überfällig</div>
            </div>
            {stats.byStatus?.map((s: any) => {
              const color = PERMIT_STATUS_COLORS[s.status] || '#94a3b8';
              return (
                <div key={s.status} style={{ background: color + '10', borderRadius: 12, padding: '14px 16px', border: `1px solid ${color}22` }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color }}>{s.count}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{PERMIT_STATUS_LABELS[s.status]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="proj-admin-filters">
        <div className="proj-filter-search" style={{ flex: 1, minWidth: 0 }}>
          <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche nach Titel, Projekt, Behörde..."
            style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
        </div>
        <select className="proj-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Alle Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{PERMIT_STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ height: 200, background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }} />
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px dashed #e2e8f0', padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Keine Baubewilligungen gefunden</div>
        </div>
      ) : (
        <div className="proj-admin-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                {['Titel','Projekt','Behörde','Status','Eingereicht','Entscheid erwartet','Ref. Nr.'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#64748b', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => {
                const color = PERMIT_STATUS_COLORS[p.status] || '#94a3b8';
                const isOverdue = p.expectedDecisionAt && new Date(p.expectedDecisionAt) < new Date() && !['BEWILLIGT','ABGELEHNT','ZURUECKGEZOGEN'].includes(p.status);
                return (
                  <tr key={p.id} onClick={() => window.location.href = `/projects/${p.projectId}`}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>{p.title}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#3b82f6', whiteSpace: 'nowrap' }}>{p.project?.name || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569', whiteSpace: 'nowrap' }}>{p.authority || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: color + '18', color, whiteSpace: 'nowrap' }}>
                        {PERMIT_STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569', whiteSpace: 'nowrap' }}>{fmt(p.submittedAt)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: isOverdue ? '#dc2626' : '#475569', fontWeight: isOverdue ? 700 : 400, whiteSpace: 'nowrap' }}>{fmt(p.expectedDecisionAt)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{p.referenceNumber || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminPermitsPage() {
  return (
    <ProtectedRoute role="ADMIN">
      <AdminPermitsContent />
    </ProtectedRoute>
  );
}
