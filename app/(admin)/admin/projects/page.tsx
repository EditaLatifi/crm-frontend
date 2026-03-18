"use client";
import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../../src/api/client';
import ProtectedRoute from '../../../../src/routes/ProtectedRoute';
import ProjectCard from '../../../../components/projects/ProjectCard';
import ProjectStats from '../../../../components/projects/ProjectStats';
import ProjectForm from '../../../../components/projects/ProjectForm';
import Modal from '../../../../components/ui/Modal';
import { STATUS_LABELS, STATUS_COLORS, TYPE_LABELS } from '../../../../components/projects/phaseConfig';
import { FiPlus, FiSearch, FiBarChart2, FiGrid, FiList, FiRefreshCw } from 'react-icons/fi';
import '../../../(app)/projects/projects.css';

type View = 'grid' | 'list';

function AdminProjectsContent() {
  const [projects,     setProjects]     = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [createOpen,   setCreateOpen]   = useState(false);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter,   setTypeFilter]   = useState('');
  const [view,         setView]         = useState<View>('grid');
  const [showStats,    setShowStats]    = useState(true);
  const [statsKey,     setStatsKey]     = useState(0);
  const [error,        setError]        = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/projects')
      .then((d: any) => setProjects(Array.isArray(d) ? d : []))
      .catch((e: any) => setError(e.message || 'Fehler beim Laden'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: any) => {
    await api.post('/projects', data);
    setCreateOpen(false);
    load();
    setStatsKey(k => k + 1);
  };

  const filtered = projects.filter(p => {
    if (search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.address?.toLowerCase().includes(search.toLowerCase()) &&
      !p.account?.name?.toLowerCase().includes(search.toLowerCase()) &&
      !p.owner?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (typeFilter   && p.type   !== typeFilter)   return false;
    return true;
  });

  return (
    <div className="proj-admin-page">

      {/* Header */}
      <div className="proj-admin-header">
        <div>
          <h1 className="proj-page-title">Projektverwaltung</h1>
          <p className="proj-page-subtitle">
            {projects.length} Projekte · {projects.filter(p => p.status === 'ACTIVE').length} aktiv
          </p>
        </div>
        <div className="proj-admin-header-actions">
          <button
            onClick={() => setShowStats(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: showStats ? '#eff6ff' : '#fff',
              color: showStats ? '#2563eb' : '#64748b',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            <FiBarChart2 size={14} /> Statistiken
          </button>
          <button
            onClick={load}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer' }}
          >
            <FiRefreshCw size={13} />
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 9, border: 'none',
              background: 'linear-gradient(135deg,#2563eb,#6366f1)', color: '#fff',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)', whiteSpace: 'nowrap',
            }}
          >
            <FiPlus size={15} /> Neues Projekt
          </button>
        </div>
      </div>

      {/* Stats */}
      {showStats && (
        <div className="proj-admin-stats-card">
          <h2 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Übersicht</h2>
          <ProjectStats key={statsKey} />
        </div>
      )}

      {/* Filters */}
      <div className="proj-admin-filters">
        <div className="proj-filter-search" style={{ flex: 1, minWidth: 0 }}>
          <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Suche nach Name, Adresse, Kunde, Verantwortlicher..."
            style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', background: '#f8fafc', boxSizing: 'border-box' }}
          />
        </div>
        <select className="proj-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Alle Status</option>
          {['ACTIVE','ON_HOLD','COMPLETED','CANCELLED'].map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select className="proj-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">Alle Typen</option>
          {['ARCHITECTURE','INTERIOR_DESIGN','CONSTRUCTION_MANAGEMENT','VISUALIZATION','REAL_ESTATE','DIGITIZATION'].map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
        {/* View toggle */}
        <div className="proj-view-toggle" style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2, flexShrink: 0 }}>
          {(['grid','list'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: view === v ? '#fff' : 'transparent', color: view === v ? '#2563eb' : '#64748b', cursor: 'pointer', fontSize: 13, boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
              {v === 'grid' ? <FiGrid size={14} /> : <FiList size={14} />}
            </button>
          ))}
        </div>
        {(search || statusFilter || typeFilter) && (
          <button onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); }}
            style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Zurücksetzen
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 10, padding: 16, marginBottom: 20 }}>{error}</div>
      )}

      {/* Projects */}
      {loading ? (
        <div className="proj-cards-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ height: 220, background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px dashed #e2e8f0', padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏗️</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            {projects.length === 0 ? 'Noch keine Projekte' : 'Keine Projekte gefunden'}
          </div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
            {projects.length === 0 ? 'Erstelle dein erstes Projekt.' : 'Passe deine Filter an.'}
          </div>
          {projects.length === 0 && (
            <button onClick={() => setCreateOpen(true)}
              style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#2563eb,#6366f1)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              + Erstes Projekt erstellen
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
            {filtered.length} Projekt{filtered.length !== 1 ? 'e' : ''}
          </div>

          {view === 'grid' ? (
            <div className="proj-cards-grid">
              {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          ) : (
            <div className="proj-admin-table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                    {['Projektname','Typ','Status','Kunde','Verantwortlich','Fortschritt','Budget'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#64748b', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => {
                    const phases = p.phases || [];
                    const done   = phases.filter((ph: any) => ph.status === 'COMPLETED' || ph.status === 'SKIPPED').length;
                    const prog   = phases.length > 0 ? Math.round((done / phases.length) * 100) : 0;
                    return (
                      <tr key={p.id} onClick={() => window.location.href = `/projects/${p.id}`}
                        style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
                        <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>{p.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569', whiteSpace: 'nowrap' }}>{TYPE_LABELS[p.type] || p.type}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: STATUS_COLORS[p.status] + '20', color: STATUS_COLORS[p.status], whiteSpace: 'nowrap' }}>
                            {STATUS_LABELS[p.status]}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569', whiteSpace: 'nowrap' }}>{p.account?.name || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#475569', whiteSpace: 'nowrap' }}>{p.owner?.name}</td>
                        <td style={{ padding: '12px 16px', minWidth: 100 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 5, background: '#f1f5f9', borderRadius: 99 }}>
                              <div style={{ height: '100%', borderRadius: 99, background: prog === 100 ? '#22c55e' : '#3b82f6', width: `${prog}%` }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{prog}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {p.budget ? p.budget.toLocaleString('de-CH', { style: 'currency', currency: p.currency || 'CHF', minimumFractionDigits: 0 }) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="🏗️  Neues Projekt erstellen" width={640}>
        <ProjectForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>
    </div>
  );
}

export default function AdminProjectsPage() {
  return (
    <ProtectedRoute role="ADMIN">
      <AdminProjectsContent />
    </ProtectedRoute>
  );
}
