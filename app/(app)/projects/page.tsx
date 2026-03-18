"use client";
import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../src/api/client';
import { useAuth } from '../../../src/auth/AuthProvider';
import ProjectCard from '../../../components/projects/ProjectCard';
import { STATUS_LABELS, TYPE_LABELS } from '../../../components/projects/phaseConfig';
import { FiSearch, FiPlus } from 'react-icons/fi';
import Link from 'next/link';
import './projects.css';

const STATUSES = ['', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
const TYPES = ['', 'ARCHITECTURE', 'INTERIOR_DESIGN', 'CONSTRUCTION_MANAGEMENT', 'VISUALIZATION', 'REAL_ESTATE', 'DIGITIZATION'];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter]     = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/projects')
      .then((d: any) => setProjects(Array.isArray(d) ? d : []))
      .catch((e: any) => setError(e.message || 'Fehler beim Laden'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = projects.filter(p => {
    if (search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.address?.toLowerCase().includes(search.toLowerCase()) &&
      !p.account?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (typeFilter  && p.type   !== typeFilter)   return false;
    return true;
  });

  const active    = projects.filter(p => p.status === 'ACTIVE').length;
  const completed = projects.filter(p => p.status === 'COMPLETED').length;

  return (
    <div className="proj-page">

      {/* Header */}
      <div className="proj-page-header">
        <div>
          <h1 className="proj-page-title">Projekte</h1>
          <p className="proj-page-subtitle">
            {active} aktiv · {completed} abgeschlossen · {projects.length} total
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link href="/admin/projects" style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 9, border: 'none',
              background: 'linear-gradient(135deg,#2563eb,#6366f1)', color: '#fff',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)', whiteSpace: 'nowrap',
            }}>
              <FiPlus size={15} />
              Neues Projekt
            </button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="proj-filters">
        <div className="proj-filter-search">
          <FiSearch size={14} className="proj-filter-icon" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Suche nach Name, Adresse, Kunde..."
          />
        </div>
        <select className="proj-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Alle Status</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
        </select>
        <select className="proj-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">Alle Typen</option>
          {TYPES.filter(Boolean).map(t => <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>)}
        </select>
        {(search || statusFilter || typeFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); setTypeFilter(''); }}
            style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', whiteSpace: 'nowrap' }}
          >
            Zurücksetzen
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 10, padding: 16, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="proj-cards-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ height: 220, background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px dashed #e2e8f0',
          padding: '60px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏗️</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            {projects.length === 0 ? 'Noch keine Projekte' : 'Keine Projekte gefunden'}
          </div>
          <div style={{ fontSize: 14, color: '#64748b', maxWidth: 360, margin: '0 auto' }}>
            {projects.length === 0
              ? 'Projekte werden vom Admin erstellt und dir zugewiesen.'
              : 'Passe deine Filterkriterien an.'}
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
            {filtered.length} Projekt{filtered.length !== 1 ? 'e' : ''} gefunden
          </div>
          <div className="proj-cards-grid">
            {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
