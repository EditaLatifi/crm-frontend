"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../src/api/client';
import { ROLE_LABELS } from '../../../../src/lib/labels';
import { formatCurrency } from '../../../../src/lib/formatCurrency';
import { useAuth, canViewFinancials } from '../../../../src/auth/AuthProvider';
import PhaseTimeline from '../../../../components/projects/PhaseTimeline';
import BauforschrittPanel from '../../../../components/projects/BauforschrittPanel';
import ProjectForm from '../../../../components/projects/ProjectForm';
import Modal from '../../../../components/ui/Modal';
import PermitPanel from '../../../../components/permits/PermitPanel';
import BudgetPanel from '../../../../components/budget/BudgetPanel';
import DocumentPanel from '../../../../components/documents/DocumentPanel';
import VendorPanel from '../../../../components/vendors/VendorPanel';
import SharePanel from '../../../../components/vendors/SharePanel';
import MapsLink from '../../../../components/ui/MapsLink';
import {
  STATUS_COLORS, STATUS_BG, STATUS_LABELS,
  TYPE_LABELS, TYPE_ICONS,
} from '../../../../components/projects/phaseConfig';
import {
  FiEdit2, FiTrash2, FiUser, FiCalendar,
  FiMapPin, FiUsers, FiX, FiLayers, FiFileText, FiDollarSign,
  FiFolder, FiTruck, FiLink, FiCheckSquare, FiBriefcase,
} from 'react-icons/fi';
import Link from 'next/link';
import '../projects.css';

type Tab = 'overview' | 'baufortschritt' | 'tasks' | 'team' | 'documents' | 'time' | 'budget' | 'permits';

const TABS: { id: Tab; label: string; icon: any; roles?: string[] }[] = [
  { id: 'overview',       label: 'Phasen',          icon: FiLayers },
  { id: 'baufortschritt', label: 'Baufortschritt',  icon: FiTruck },
  { id: 'tasks',          label: 'Aufgaben',        icon: FiCheckSquare },
  { id: 'team',           label: 'Team',            icon: FiUsers },
  { id: 'documents',      label: 'Dokumente',       icon: FiFolder },
  { id: 'time',           label: 'Zeiterfassung',   icon: FiCalendar },
  { id: 'budget',         label: 'Budget',          icon: FiDollarSign, roles: ['ADMIN', 'PROJEKTLEITER'] },
  { id: 'permits',        label: 'Baubewilligung',  icon: FiFileText },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const id     = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const showFinancials = canViewFinancials(user?.role);

  const [project,         setProject]         = useState<any>(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);
  const [editOpen,        setEditOpen]        = useState(false);
  const [allUsers,        setAllUsers]        = useState<any[]>([]);
  const [addMemberUserId, setAddMemberUserId] = useState('');
  const [addMemberRole,   setAddMemberRole]   = useState('');
  const [memberLoading,   setMemberLoading]   = useState(false);
  const [activeTab,       setActiveTab]       = useState<Tab>('overview');
  const [projectTasks,    setProjectTasks]    = useState<any[]>([]);

  const isAdmin  = user?.role === 'ADMIN';
  const isOwner  = project?.ownerUserId === user?.id || project?.owner?.id === user?.id;
  const canEdit  = isAdmin || isOwner;

  const load = useCallback(async () => {
    try {
      const data = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (e: any) {
      setError(e.message || 'Projekt nicht gefunden');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    api.get('/tasks').then((res: any) => { const d = res?.data ?? (Array.isArray(res) ? res : []); setProjectTasks(d.filter((t: any) => t.projectId === id)); }).catch(() => {});
  }, [id]);
  useEffect(() => {
    if (canEdit) api.get('/users').then((d: any) => setAllUsers(Array.isArray(d) ? d : [])).catch(() => {});
  }, [canEdit]);

  const handleEditSubmit = async (data: any) => {
    await api.patch(`/projects/${id}`, data);
    setEditOpen(false);
    load();
  };

  const handleDelete = async () => {
    if (!confirm('Projekt wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    try {
      await api.delete(`/projects/${id}`);
      router.replace('/projects');
    } catch (e: any) { alert(e.message || 'Fehler beim Löschen'); }
  };

  const handleAddMember = async () => {
    if (!addMemberUserId) return;
    setMemberLoading(true);
    try {
      await api.post(`/projects/${id}/members`, { userId: addMemberUserId, role: addMemberRole || undefined });
      setAddMemberUserId(''); setAddMemberRole('');
      load();
    } catch (e: any) { alert(e.message || 'Fehler'); }
    finally { setMemberLoading(false); }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Mitglied entfernen?')) return;
    try { await api.delete(`/projects/${id}/members/${userId}`); load(); }
    catch (e: any) { alert(e.message || 'Fehler'); }
  };

  if (loading) return (
    <div className="proj-detail-page">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ height: 32, background: '#e2e8f0', borderRadius: 8, width: 200, marginBottom: 24 }} />
        <div style={{ height: 180, background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }} />
      </div>
    </div>
  );

  if (error || !project) return (
    <div className="proj-detail-page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{error || 'Projekt nicht gefunden'}</div>
      <button onClick={() => router.back()} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', cursor: 'pointer' }}>
        Zurück
      </button>
    </div>
  );

  const phases         = project.phases || [];
  const completedCount = phases.filter((p: any) => p.status === 'COMPLETED' || p.status === 'SKIPPED').length;
  const progress       = phases.length > 0 ? Math.round((completedCount / phases.length) * 100) : 0;
  const memberIds      = (project.members || []).map((m: any) => m.userId);
  const availableUsers = allUsers.filter((u: any) => !memberIds.includes(u.id));

  return (
    <div className="proj-detail-page">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 0 }}>
          <Link href={project.account?.id ? `/accounts/${project.account.id}` : '/accounts'} style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 600 }}>Firmen</Link>
          <span style={{ color: '#94a3b8', margin: '0 6px' }}>{' › '}</span>
          {project.account?.id ? (
            <Link href={`/accounts/${project.account.id}`} style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 600 }}>{project.account?.name || '—'}</Link>
          ) : (
            <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{project.account?.name || '—'}</span>
          )}
          {project.deal?.id && (
            <>
              <span style={{ color: '#94a3b8', margin: '0 6px' }}>{' › '}</span>
              <Link href={`/deals/${project.deal.id}`} style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 600 }}>{project.deal?.name || 'Deal'}</Link>
            </>
          )}
          <span style={{ color: '#94a3b8', margin: '0 6px' }}>{' › '}</span>
          <Link href="/projects" style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 600 }}>Projekte</Link>
          <span style={{ color: '#94a3b8', margin: '0 6px' }}>{' › '}</span>
          <span style={{ color: '#1e293b' }}>{project.name}</span>
        </div>

        {/* Back + Actions */}
        <div className="proj-detail-topbar">

          {canEdit && (
            <div className="proj-detail-topbar-actions">
              <button
                onClick={() => setEditOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                <FiEdit2 size={13} /> Bearbeiten
              </button>
              {isAdmin && (
                <button
                  onClick={handleDelete}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  <FiTrash2 size={13} /> Löschen
                </button>
              )}
            </div>
          )}
        </div>

        {/* Project header card */}
        <div className="proj-detail-header-card">
          <div style={{ height: 5, background: `${STATUS_COLORS[project.status] || '#1a1a1a'}` }} />
          <div className="proj-detail-header-inner">
            <div className="proj-detail-header-top">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 26 }}>{TYPE_ICONS[project.type] || '🏗️'}</span>
                  <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{project.name}</h1>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: STATUS_BG[project.status], color: STATUS_COLORS[project.status], border: `1px solid ${STATUS_COLORS[project.status]}44` }}>
                    {STATUS_LABELS[project.status]}
                  </span>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: '#f1f5f9', color: '#64748b', fontWeight: 500 }}>
                    {TYPE_LABELS[project.type] || project.type}
                  </span>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', fontWeight: 600 }}>
                    {completedCount} von {phases.length} {phases.length === 1 ? 'Phase' : 'Phasen'} abgeschlossen
                  </span>
                </div>
                {project.description && (
                  <p style={{ margin: 0, fontSize: 14, color: '#475569', maxWidth: 500 }}>{project.description}</p>
                )}
              </div>
              {showFinancials && (
                <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                  {project.budget && (
                    <div style={{ border: '1.5px solid #16a34a', borderRadius: 10, padding: '10px 16px', minWidth: 130 }}>
                      <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Kunden-Offerte</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{formatCurrency(project.budget, project.currency || 'CHF')}</div>
                    </div>
                  )}
                  {(() => {
                    const totalBudgetH = phases.reduce((s: number, ph: any) => s + (ph.budgetHours || 0), 0);
                    if (!totalBudgetH) return null;
                    const totalUsedMin = phases.reduce((s: number, ph: any) => s + ((ph.timeEntries || []).reduce((s2: number, te: any) => s2 + (te.durationMinutes || 0), 0)), 0);
                    const totalUsedH = totalUsedMin / 60;
                    const pct = Math.round((totalUsedH / totalBudgetH) * 100);
                    const barColor = pct >= 100 ? '#dc2626' : pct >= 80 ? '#d97706' : '#3b82f6';
                    return (
                      <div style={{ border: '1.5px solid #3b82f6', borderRadius: 10, padding: '10px 16px', minWidth: 150 }}>
                        <div style={{ fontSize: 10, color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Kontingent</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{totalUsedH.toFixed(1)}h / {totalBudgetH}h</div>
                        <div style={{ height: 4, background: '#e5e7eb', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: barColor, borderRadius: 4 }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="proj-detail-meta-row">
              {project.deal && (
                <Link href={`/deals/${project.deal.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <FiBriefcase size={13} color="#7c3aed" />
                  <span style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600 }}>Deal: {project.deal.name}</span>
                </Link>
              )}
              {project.account && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <FiUser size={13} color="#94a3b8" />
                  <span style={{ fontSize: 13, color: '#475569' }}>{project.account.name}</span>
                </div>
              )}
              {project.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <FiMapPin size={13} color="#94a3b8" />
                  <span style={{ fontSize: 13, color: '#475569' }}>{project.address}</span>
                  <MapsLink address={project.address} />
                </div>
              )}
              {project.startDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <FiCalendar size={13} color="#94a3b8" />
                  <span style={{ fontSize: 13, color: '#475569' }}>
                    {new Date(project.startDate).toLocaleDateString('de-CH')}
                    {project.expectedEndDate && ` → ${new Date(project.expectedEndDate).toLocaleDateString('de-CH')}`}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <FiUsers size={13} color="#94a3b8" />
                <span style={{ fontSize: 13, color: '#475569' }}>
                  Projektleiter: <strong>{project.owner?.name}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: 24 }}>
          <div className="proj-tabs-bar">
            {TABS.filter(t => {
              if (t.roles && !t.roles.includes(user?.role || '')) return false;
              return true;
            }).map(t => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 8, border: 'none',
                    background: active ? '#1a1a1a' : 'transparent',
                    color: active ? '#fff' : '#64748b',
                    fontSize: 13, fontWeight: active ? 700 : 500,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}>
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div>

          {/* PHASEN TAB (overview) */}
          {activeTab === 'overview' && (
            <div>
              {/* SIA Phase Timeline */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '16px 24px', marginBottom: 16 }}>
                <PhaseTimeline projectId={id} phases={phases} canEdit={canEdit} onUpdate={load} />
              </div>

              <div className="proj-detail-grid">
              {/* Phase details */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '24px 28px' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Phasenübersicht</h2>
                {['PENDING','IN_PROGRESS','COMPLETED','SKIPPED'].map(s => {
                  const count = phases.filter((p: any) => p.status === s).length;
                  if (count === 0) return null;
                  const colors: Record<string,string> = { PENDING:'#94a3b8', IN_PROGRESS:'#3b82f6', COMPLETED:'#22c55e', SKIPPED:'#e2e8f0' };
                  const labels: Record<string,string> = { PENDING:'Ausstehend', IN_PROGRESS:'In Bearbeitung', COMPLETED:'Abgeschlossen', SKIPPED:'Übersprungen' };
                  return (
                    <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[s] }} />
                        <span style={{ fontSize: 13, color: '#475569' }}>{labels[s]}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Team */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '18px 20px' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                    <FiUsers size={13} style={{ marginRight: 7, verticalAlign: 'middle' }} />Team
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(project.members || []).map((m: any) => (
                      <div key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {m.user?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{m.user?.name}</div>
                            {m.role && <div style={{ fontSize: 11, color: '#94a3b8' }}>{ROLE_LABELS[m.role] ?? m.role}</div>}
                            {m.userId === project.ownerUserId && <div style={{ fontSize: 10, color: '#3b82f6', fontWeight: 600 }}>Projektleiter</div>}
                          </div>
                        </div>
                        {canEdit && m.userId !== project.ownerUserId && (
                          <button onClick={() => handleRemoveMember(m.userId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 3 }}>
                            <FiX size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {canEdit && availableUsers.length > 0 && (
                    <div style={{ marginTop: 14, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mitglied hinzufügen</div>
                      <select value={addMemberUserId} onChange={e => setAddMemberUserId(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #e2e8f0', fontSize: 12, marginBottom: 6, background: '#f8fafc' }}>
                        <option value="">Person auswählen...</option>
                        {availableUsers.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                      <select value={addMemberRole} onChange={e => setAddMemberRole(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #e2e8f0', fontSize: 12, marginBottom: 8, background: '#f8fafc' }}>
                        <option value="">Rolle wählen…</option>
                        <option value="DEVELOPER">Developer</option>
                        <option value="DESIGNER">Designer</option>
                        <option value="ARCHITECT">Architekt</option>
                        <option value="PROJECT_MANAGER">Projektmanager</option>
                        <option value="CONSULTANT">Berater</option>
                        <option value="OBSERVER">Beobachter</option>
                      </select>
                      <button disabled={!addMemberUserId || memberLoading} onClick={handleAddMember}
                        style={{ width: '100%', padding: '7px 0', borderRadius: 7, border: 'none', background: addMemberUserId ? '#1a1a1a' : '#e2e8f0', color: addMemberUserId ? '#fff' : '#94a3b8', fontSize: 12, fontWeight: 600, cursor: addMemberUserId ? 'pointer' : 'default' }}>
                        {memberLoading ? 'Hinzufügen...' : '+ Hinzufügen'}
                      </button>
                    </div>
                  )}
                </div>

                {project.notes && (
                  <div style={{ background: '#fffbeb', borderRadius: 14, border: '1px solid #fde68a', padding: '16px 18px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>📝 Notizen</div>
                    <p style={{ margin: 0, fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>{project.notes}</p>
                  </div>
                )}

              </div>
            </div>
            </div>
          )}

          {/* BAUFORTSCHRITT TAB */}
          {activeTab === 'baufortschritt' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px 28px' }}>
              <BauforschrittPanel projectId={id} canEdit={canEdit} />
            </div>
          )}

          {/* TEAM TAB */}
          {activeTab === 'team' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px 28px' }}>
              <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                <FiUsers size={15} style={{ marginRight: 8, verticalAlign: 'middle' }} />Projektteam
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(project.members || []).map((m: any) => (
                  <div key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {m.user?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{m.user?.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {m.role && <span>{ROLE_LABELS[m.role] ?? m.role}</span>}
                          {m.userId === project.ownerUserId && <span style={{ color: '#3b82f6', fontWeight: 600, marginLeft: m.role ? 8 : 0 }}>Projektleiter</span>}
                        </div>
                      </div>
                    </div>
                    {canEdit && m.userId !== project.ownerUserId && (
                      <button onClick={() => handleRemoveMember(m.userId)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', color: '#dc2626', padding: '4px 8px', fontSize: 12 }}>
                        Entfernen
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {canEdit && availableUsers.length > 0 && (
                <div style={{ marginTop: 20, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Mitglied hinzufügen</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <select value={addMemberUserId} onChange={e => setAddMemberUserId(e.target.value)}
                      style={{ flex: 1, minWidth: 180, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#f8fafc' }}>
                      <option value="">Person auswählen...</option>
                      {availableUsers.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <select value={addMemberRole} onChange={e => setAddMemberRole(e.target.value)}
                      style={{ flex: 1, minWidth: 140, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#f8fafc' }}>
                      <option value="">Rolle wählen...</option>
                      <option value="ARCHITECT">Architekt</option>
                      <option value="PROJECT_MANAGER">Projektmanager</option>
                      <option value="DEVELOPER">Developer</option>
                      <option value="DESIGNER">Designer</option>
                      <option value="CONSULTANT">Berater</option>
                      <option value="OBSERVER">Beobachter</option>
                    </select>
                    <button disabled={!addMemberUserId || memberLoading} onClick={handleAddMember}
                      style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: addMemberUserId ? '#1a1a1a' : '#e2e8f0', color: addMemberUserId ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 600, cursor: addMemberUserId ? 'pointer' : 'default' }}>
                      {memberLoading ? 'Wird hinzugefügt...' : '+ Hinzufügen'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Aufgaben ({projectTasks.length})</h2>
                <Link href="/tasks" style={{ fontSize: 13, color: '#1a1a1a', textDecoration: 'none', fontWeight: 600 }}>Alle Aufgaben →</Link>
              </div>

              {projectTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 14 }}>
                  Keine Aufgaben mit diesem Projekt verknüpft.
                </div>
              ) : (
                <>
                  {/* Phase overview from project tasks */}
                  {(() => {
                    const byPhase: Record<string, { tasks: any[]; budget: number; used: number }> = {};
                    projectTasks.forEach((t: any) => {
                      const ph = t.phase || 'Ohne Phase';
                      if (!byPhase[ph]) byPhase[ph] = { tasks: [], budget: 0, used: 0 };
                      byPhase[ph].tasks.push(t);
                      byPhase[ph].budget += t.budgetHours || 0;
                      byPhase[ph].used += (t.timeEntries || []).reduce((s: number, e: any) => s + (e.durationMinutes || 0), 0) / 60;
                    });
                    const phases = Object.entries(byPhase).sort(([a], [b]) => a.localeCompare(b));
                    const totalBudget = phases.reduce((s, [, d]) => s + d.budget, 0);
                    const totalUsed = phases.reduce((s, [, d]) => s + d.used, 0);

                    return (
                      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e5e7eb', marginBottom: 20 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                          <thead>
                            <tr style={{ background: '#f8fafc' }}>
                              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Phase</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Tasks</th>
                              {showFinancials && <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Budget (h)</th>}
                              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Effektiv (h)</th>
                              {showFinancials && <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Verbleibend</th>}
                              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {phases.map(([ph, data]) => {
                              const allDone = data.tasks.every((t: any) => t.status === 'DONE');
                              const hasProgress = data.tasks.some((t: any) => t.status === 'IN_PROGRESS' || data.used > 0);
                              const status = allDone ? 'done' : hasProgress ? 'in_progress' : 'pending';
                              const over = data.budget > 0 && data.used > data.budget;
                              const statusCfg: Record<string, { label: string; color: string; bg: string }> = {
                                pending: { label: 'Ausstehend', color: '#64748b', bg: '#f1f5f9' },
                                in_progress: { label: 'In Bearbeitung', color: '#d97706', bg: '#fef3c7' },
                                done: { label: 'Abgeschlossen', color: '#16a34a', bg: '#dcfce7' },
                              };
                              const sc = statusCfg[status];
                              return (
                                <tr key={ph} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>
                                    {ph !== 'Ohne Phase' && <span style={{ color: '#7c3aed', marginRight: 6 }}>{ph}</span>}
                                    {ph === 'Ohne Phase' && <span style={{ color: '#94a3b8' }}>{ph}</span>}
                                  </td>
                                  <td style={{ padding: '10px 14px', color: '#64748b' }}>{data.tasks.length}</td>
                                  {showFinancials && <td style={{ padding: '10px 14px', color: '#1e293b', fontWeight: 600 }}>{data.budget > 0 ? data.budget.toFixed(1) : '—'}</td>}
                                  <td style={{ padding: '10px 14px', color: over ? '#dc2626' : '#1e293b', fontWeight: 600 }}>
                                    {data.used.toFixed(1)}
                                    {over && <span style={{ marginLeft: 4, fontSize: 9, color: '#dc2626', background: '#fee2e2', borderRadius: 3, padding: '0 4px', fontWeight: 700 }}>!</span>}
                                  </td>
                                  {showFinancials && <td style={{ padding: '10px 14px', fontWeight: 600, color: data.budget > 0 ? (data.budget - data.used > 0 ? '#16a34a' : '#dc2626') : '#94a3b8' }}>
                                    {data.budget > 0 ? `${(data.budget - data.used).toFixed(1)}h` : '—'}
                                  </td>}
                                  <td style={{ padding: '10px 14px' }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: sc.color, background: sc.bg, borderRadius: 10, padding: '2px 8px' }}>{sc.label}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                              <td style={{ padding: '10px 14px', borderTop: '2px solid #e5e7eb' }}>Gesamt</td>
                              <td style={{ padding: '10px 14px', borderTop: '2px solid #e5e7eb' }}>{projectTasks.length}</td>
                              {showFinancials && <td style={{ padding: '10px 14px', borderTop: '2px solid #e5e7eb' }}>{totalBudget > 0 ? totalBudget.toFixed(1) : '—'}</td>}
                              <td style={{ padding: '10px 14px', borderTop: '2px solid #e5e7eb', color: totalBudget > 0 && totalUsed > totalBudget ? '#dc2626' : '#1e293b' }}>{totalUsed.toFixed(1)}</td>
                              {showFinancials && <td style={{ padding: '10px 14px', borderTop: '2px solid #e5e7eb', fontWeight: 700, color: totalBudget > 0 ? (totalBudget - totalUsed > 0 ? '#16a34a' : '#dc2626') : '#94a3b8' }}>
                                {totalBudget > 0 ? `${(totalBudget - totalUsed).toFixed(1)}h` : '—'}
                              </td>}
                              <td style={{ padding: '10px 14px', borderTop: '2px solid #e5e7eb' }}></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    );
                  })()}

                  {/* Task list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {projectTasks.map((t: any) => {
                      const statusMap: Record<string, { label: string; color: string; bg: string }> = {
                        OPEN: { label: 'Offen', color: '#1d4ed8', bg: '#dbeafe' },
                        IN_PROGRESS: { label: 'In Arbeit', color: '#d97706', bg: '#fef3c7' },
                        DONE: { label: 'Erledigt', color: '#16a34a', bg: '#dcfce7' },
                      };
                      const sc = statusMap[t.status] || statusMap.OPEN;
                      const usedMin = (t.timeEntries || []).reduce((s: number, e: any) => s + (e.durationMinutes || 0), 0);
                      return (
                        <Link key={t.id} href={`/tasks/${t.id}`} style={{ textDecoration: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{t.title}</div>
                              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, display: 'flex', gap: 8 }}>
                                {t.phase && <span style={{ color: '#7c3aed', fontWeight: 600 }}>Phase {t.phase}</span>}
                                {t.assignee?.name && <span>{t.assignee.name}</span>}
                                {usedMin > 0 && <span>{(usedMin / 60).toFixed(1)}h erfasst</span>}
                              </div>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: sc.color, background: sc.bg, borderRadius: 10, padding: '2px 8px', whiteSpace: 'nowrap' }}>{sc.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* PERMITS TAB */}
          {activeTab === 'permits' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px 28px' }}>
              <PermitPanel projectId={id} canEdit={canEdit} />
            </div>
          )}

          {/* BUDGET TAB */}
          {activeTab === 'budget' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px 28px' }}>
              <BudgetPanel projectId={id} canEdit={canEdit} />
            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px 28px' }}>
              <DocumentPanel projectId={id} canEdit={canEdit} />
            </div>
          )}

          {/* ZEITERFASSUNG TAB */}
          {activeTab === 'time' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px 28px' }}>
              <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Zeiterfassung pro SIA-Phase</h2>
              {(() => {
                // Calculate used hours directly from phase timeEntries (loaded from backend)
                const totalBudget = phases.reduce((s: number, p: any) => s + (p.budgetHours || 0), 0);
                let totalUsed = 0;

                const handlePhaseBudgetSave = async (phaseId: string, value: number) => {
                  try {
                    await api.patch(`/projects/${id}/phases/${phaseId}`, { budgetHours: value });
                    load();
                  } catch {}
                };

                return (
                  <>
                    {phases.map((p: any) => {
                      // Sum hours from timeEntries directly linked to this phase
                      const phaseEntries = p.timeEntries || [];
                      const used = phaseEntries.reduce((s: number, e: any) => s + (e.durationMinutes || 0), 0) / 60;
                      totalUsed += used;
                      const budget = p.budgetHours || 0;
                      const remaining = budget > 0 ? budget - used : 0;
                      const ratio = budget > 0 ? used / budget : 0;
                      const pct = Math.min(ratio * 100, 100);
                      const barColor = ratio >= 1 ? '#dc2626' : ratio >= 0.8 ? '#d97706' : '#1a1a1a';
                      return (
                        <div key={p.id} style={{ marginBottom: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', flex: 1 }}>{p.name}</span>
                            {showFinancials ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: 12, color: ratio >= 1 ? '#dc2626' : ratio >= 0.8 ? '#d97706' : '#475569', fontWeight: 600 }}>{used.toFixed(1)}h /</span>
                                <input
                                  type="number" min={0} step={0.5}
                                  defaultValue={budget || ''}
                                  placeholder="Budget h"
                                  onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) handlePhaseBudgetSave(p.id, v); }}
                                  style={{ width: 64, fontSize: 12, padding: '3px 6px', borderRadius: 6, border: '1px solid #d1d5db', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}
                                />
                                <span style={{ fontSize: 12, color: '#94a3b8' }}>h</span>
                                {budget > 0 && (
                                  <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 6, color: remaining <= 0 ? '#dc2626' : '#16a34a', background: remaining <= 0 ? '#fef2f2' : '#f0fdf4', borderRadius: 8, padding: '2px 7px' }}>
                                    {remaining > 0 ? `${remaining.toFixed(1)}h übrig` : `${Math.abs(remaining).toFixed(1)}h über Budget`}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                                {used.toFixed(1)}h erfasst
                              </span>
                            )}
                          </div>
                          {budget > 0 && (
                            <div style={{ background: '#e2e8f0', borderRadius: 20, height: 6, overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: barColor, borderRadius: 20, width: `${pct}%`, transition: 'width 0.3s' }} />
                            </div>
                          )}
                          {/* Show recent time entries for this phase */}
                          {phaseEntries.length > 0 && (
                            <div style={{ marginTop: 8, borderTop: '1px solid #e5e7eb', paddingTop: 8 }}>
                              {phaseEntries.slice(0, 3).map((e: any) => (
                                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', padding: '2px 0' }}>
                                  <span>{e.user?.name || '—'} — {e.description || 'Keine Beschreibung'}</span>
                                  <span style={{ fontWeight: 600 }}>{(e.durationMinutes / 60).toFixed(1)}h · {new Date(e.startedAt).toLocaleDateString('de-CH')}</span>
                                </div>
                              ))}
                              {phaseEntries.length > 3 && (
                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>+ {phaseEntries.length - 3} weitere Einträge</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #e5e7eb', fontWeight: 700, fontSize: 14 }}>
                      <span>Gesamt</span>
                      <span style={{ color: totalBudget > 0 && totalUsed > totalBudget ? '#dc2626' : '#1e293b' }}>
                        {totalUsed.toFixed(1)}h {totalBudget > 0 ? `/ ${totalBudget.toFixed(1)}h` : ''}
                        {totalBudget > 0 && (
                          <span style={{ fontSize: 12, fontWeight: 600, marginLeft: 8, color: totalBudget - totalUsed <= 0 ? '#dc2626' : '#16a34a' }}>
                            ({totalBudget - totalUsed > 0 ? `${(totalBudget - totalUsed).toFixed(1)}h übrig` : `${(totalUsed - totalBudget).toFixed(1)}h über Budget`})
                          </span>
                        )}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Projekt bearbeiten" width={640}>
        <ProjectForm initialData={project} onSubmit={handleEditSubmit} onCancel={() => setEditOpen(false)} />
      </Modal>
    </div>
  );
}
