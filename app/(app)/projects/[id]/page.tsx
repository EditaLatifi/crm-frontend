"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../src/api/client';
import { useAuth } from '../../../../src/auth/AuthProvider';
import PhaseTimeline from '../../../../components/projects/PhaseTimeline';
import ProjectForm from '../../../../components/projects/ProjectForm';
import Modal from '../../../../components/ui/Modal';
import PermitPanel from '../../../../components/permits/PermitPanel';
import BudgetPanel from '../../../../components/budget/BudgetPanel';
import DocumentPanel from '../../../../components/documents/DocumentPanel';
import VendorPanel from '../../../../components/vendors/VendorPanel';
import SharePanel from '../../../../components/vendors/SharePanel';
import {
  STATUS_COLORS, STATUS_BG, STATUS_LABELS,
  TYPE_LABELS, TYPE_ICONS,
} from '../../../../components/projects/phaseConfig';
import {
  FiArrowLeft, FiEdit2, FiTrash2, FiUser, FiCalendar,
  FiMapPin, FiUsers, FiX, FiLayers, FiFileText, FiDollarSign,
  FiFolder, FiTruck, FiLink,
} from 'react-icons/fi';
import '../projects.css';

type Tab = 'overview' | 'permits' | 'budget' | 'documents' | 'vendors' | 'share';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'overview',   label: 'Übersicht',       icon: FiLayers },
  { id: 'permits',    label: 'Baubewilligung',   icon: FiFileText },
  { id: 'budget',     label: 'Budget',           icon: FiDollarSign },
  { id: 'documents',  label: 'Dokumente',        icon: FiFolder },
  { id: 'vendors',    label: 'Lieferanten',      icon: FiTruck },
  { id: 'share',      label: 'Share',            icon: FiLink },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const id     = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [project,         setProject]         = useState<any>(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState<string | null>(null);
  const [editOpen,        setEditOpen]        = useState(false);
  const [allUsers,        setAllUsers]        = useState<any[]>([]);
  const [addMemberUserId, setAddMemberUserId] = useState('');
  const [addMemberRole,   setAddMemberRole]   = useState('');
  const [memberLoading,   setMemberLoading]   = useState(false);
  const [activeTab,       setActiveTab]       = useState<Tab>('overview');

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
      <button onClick={() => router.back()} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
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

        {/* Back + Actions */}
        <div className="proj-detail-topbar">
          <button
            onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', fontSize: 14, cursor: 'pointer', padding: '4px 0' }}
          >
            <FiArrowLeft size={15} /> Zurück
          </button>

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
          <div style={{ height: 5, background: `linear-gradient(90deg,${STATUS_COLORS[project.status] || '#3b82f6'},#6366f1)` }} />
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
                    {progress}% abgeschlossen
                  </span>
                </div>
                {project.description && (
                  <p style={{ margin: 0, fontSize: 14, color: '#475569', maxWidth: 500 }}>{project.description}</p>
                )}
              </div>
              {project.budget && (
                <div style={{ flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Budget</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                    {project.budget.toLocaleString('de-CH', { style: 'currency', currency: project.currency || 'CHF', minimumFractionDigits: 0 })}
                  </div>
                </div>
              )}
            </div>

            <div className="proj-detail-meta-row">
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
            {TABS.map(t => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 8, border: 'none',
                    background: active ? '#2563eb' : 'transparent',
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

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="proj-detail-grid">
              {/* Phase timeline */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '24px 28px' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>SIA-Phasen</h2>
                <PhaseTimeline projectId={id} phases={phases} canEdit={canEdit} onUpdate={load} />
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
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {m.user?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{m.user?.name}</div>
                            {m.role && <div style={{ fontSize: 11, color: '#94a3b8' }}>{m.role}</div>}
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
                      <input value={addMemberRole} onChange={e => setAddMemberRole(e.target.value)} placeholder="Rolle (optional)"
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #e2e8f0', fontSize: 12, marginBottom: 8, background: '#f8fafc', boxSizing: 'border-box' }} />
                      <button disabled={!addMemberUserId || memberLoading} onClick={handleAddMember}
                        style={{ width: '100%', padding: '7px 0', borderRadius: 7, border: 'none', background: addMemberUserId ? '#2563eb' : '#e2e8f0', color: addMemberUserId ? '#fff' : '#94a3b8', fontSize: 12, fontWeight: 600, cursor: addMemberUserId ? 'pointer' : 'default' }}>
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

                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '18px 20px' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Phasenübersicht</h3>
                  {['PENDING','IN_PROGRESS','COMPLETED','SKIPPED'].map(s => {
                    const count = phases.filter((p: any) => p.status === s).length;
                    if (count === 0) return null;
                    const colors: Record<string,string> = { PENDING:'#94a3b8', IN_PROGRESS:'#3b82f6', COMPLETED:'#22c55e', SKIPPED:'#e2e8f0' };
                    const labels: Record<string,string> = { PENDING:'Ausstehend', IN_PROGRESS:'In Bearbeitung', COMPLETED:'Abgeschlossen', SKIPPED:'Übersprungen' };
                    return (
                      <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[s] }} />
                          <span style={{ fontSize: 12, color: '#475569' }}>{labels[s]}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
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

          {/* VENDORS TAB */}
          {activeTab === 'vendors' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px 28px' }}>
              <VendorPanel projectId={id} canEdit={canEdit} />
            </div>
          )}

          {/* SHARE TAB */}
          {activeTab === 'share' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px 28px' }}>
              <SharePanel projectId={id} canEdit={canEdit} />
            </div>
          )}

        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="✏️  Projekt bearbeiten" width={640}>
        <ProjectForm initialData={project} onSubmit={handleEditSubmit} onCancel={() => setEditOpen(false)} />
      </Modal>
    </div>
  );
}
