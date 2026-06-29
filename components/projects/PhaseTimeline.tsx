"use client";
import { useState } from 'react';
import { api, fetchWithAuth } from '../../src/api/client';
import { useAuth, isExternRole } from '../../src/auth/AuthProvider';
import { useToast } from '../ui/Toast';
import Tooltip from '../ui/Tooltip';
import { PHASE_COLORS, PHASE_LABELS, PHASE_BG } from './phaseConfig';
import Link from 'next/link';
import { FiCheck, FiClock, FiSkipForward, FiChevronDown, FiChevronUp, FiTrash2, FiCheckSquare } from 'react-icons/fi';

type LinkedTask = {
  id: string;
  title: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  dueDate?: string | null;
  assignee?: { id: string; name: string } | null;
};

type Phase = {
  id: string;
  name: string;
  code?: string | null;
  parentPhaseId?: string | null;
  description?: string;
  order: number;
  status: string;
  notes?: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string | null;
  responsibleUserId?: string | null;
  responsible?: { id: string; name: string } | null;
  completedAt?: string;
  completedBy?: { id: string; name: string } | null;
  linkedTaskId?: string | null;
  linkedTask?: LinkedTask | null;
  budgetHours?: number | null;
  timeEntries?: Array<{ id: string; durationMinutes: number; description?: string | null; startedAt: string; isBillableExtra?: boolean; user?: { id: string; name: string } | null; task?: { isBillableExtra?: boolean } | null }>;
};

const TASK_STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  OPEN:        { label: 'Offen',        bg: '#eff6ff', color: '#1d4ed8' },
  IN_PROGRESS: { label: 'In Bearbeitung', bg: '#fef3c7', color: '#b45309' },
  DONE:        { label: 'Erledigt',     bg: '#dcfce7', color: '#15803d' },
};

type Props = {
  projectId: string;
  phases: Phase[];
  canEdit: boolean;
  onUpdate?: () => void;
  showFinancials?: boolean;
  onLogTime?: (phaseId: string) => void;
  users?: { id: string; name?: string; email?: string }[];
};

// Hours booked on a phase, excluding Mehrkosten (same rule as the backend Kontingent gate).
function phaseUsedHours(phase: Phase): number {
  return (phase.timeEntries || [])
    .filter(e => !(e.isBillableExtra || e.task?.isBillableExtra))
    .reduce((s, e) => s + (e.durationMinutes || 0), 0) / 60;
}

const PhaseIcon = ({ status }: { status: string }) => {
  if (status === 'COMPLETED') return <FiCheck size={14} color="#22c55e" />;
  if (status === 'IN_PROGRESS') return <FiClock size={14} color="#3b82f6" />;
  if (status === 'SKIPPED') return <FiSkipForward size={14} color="#94a3b8" />;
  return <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#e2e8f0', display: 'inline-block' }} />;
};

export default function PhaseTimeline({ projectId, phases, canEdit, onUpdate, showFinancials, onLogTime, users = [] }: Props) {
  const { user } = useAuth();
  const toast = useToast();
  const isExtern = isExternRole(user?.role);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [budgetDraft, setBudgetDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // ── Add phase / sub-phase / task (project is the source of truth) ──
  const [busy, setBusy] = useState(false);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [np, setNp] = useState({ code: '', name: '', budgetHours: '' });
  const [subFor, setSubFor] = useState<string | null>(null);
  const [ns, setNs] = useState({ code: '', name: '' });

  async function addPhase() {
    if (!np.name.trim()) return;
    setBusy(true); setError(null);
    try {
      await api.post(`/projects/${projectId}/phases`, {
        name: np.name.trim(),
        code: np.code.trim() || undefined,
        budgetHours: np.budgetHours !== '' ? Number(np.budgetHours) : undefined,
      });
      setNp({ code: '', name: '', budgetHours: '' }); setShowAddPhase(false); onUpdate?.();
    } catch (e: any) { setError(e.message || 'Fehler beim Hinzufügen'); } finally { setBusy(false); }
  }
  async function addSub(parentId: string) {
    if (!ns.name.trim()) return;
    setBusy(true); setError(null);
    try {
      await api.post(`/projects/${projectId}/phases`, { name: ns.name.trim(), code: ns.code.trim() || undefined, parentPhaseId: parentId });
      setNs({ code: '', name: '' }); setSubFor(null); onUpdate?.();
    } catch (e: any) { setError(e.message || 'Fehler beim Hinzufügen'); } finally { setBusy(false); }
  }
  const miniInput: React.CSSProperties = { fontSize: 12, padding: '6px 9px', border: '1px solid #e2e8f0', borderRadius: 7, outline: 'none' };
  const miniBtn: React.CSSProperties = { fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 7, border: 'none', background: '#1a1a1a', color: '#fff', cursor: 'pointer' };
  const miniGhost: React.CSSProperties = { fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' };

  // Main phases (SIA 1–6) are the budget/progress carriers; sub-phases are organization only.
  const mainPhases = phases.filter(p => !p.parentPhaseId);
  const childrenByParent = phases.reduce((acc: Record<string, Phase[]>, p) => {
    if (p.parentPhaseId) (acc[p.parentPhaseId] ||= []).push(p);
    return acc;
  }, {});

  const completedCount = mainPhases.filter(p => p.status === 'COMPLETED' || p.status === 'SKIPPED').length;
  const progress = mainPhases.length > 0 ? Math.round((completedCount / mainPhases.length) * 100) : 0;

  const currentPhase = mainPhases.find(p => p.status === 'IN_PROGRESS') || mainPhases.find(p => p.status === 'PENDING');

  async function handleStatusChange(phase: Phase, newStatus: string) {
    setLoadingId(phase.id);
    setError(null);
    try {
      await api.patch(`/projects/${projectId}/phases/${phase.id}`, {
        status: newStatus,
        notes: editNotes[phase.id] ?? phase.notes,
      });
      onUpdate?.();
    } catch (e: any) {
      setError(e.message || 'Fehler beim Aktualisieren');
    } finally {
      setLoadingId(null);
    }
  }

  async function savePhaseBudget(phaseId: string, value: number) {
    try {
      await api.patch(`/projects/${projectId}/phases/${phaseId}`, { budgetHours: value });
      toast.success(`Geplante Stunden gespeichert: ${value} Std.`);
      onUpdate?.();
    } catch (e: any) {
      setError(e.message || 'Fehler beim Speichern der geplanten Stunden');
      toast.error('Speichern fehlgeschlagen');
    }
  }

  async function savePhaseResponsible(phaseId: string, userId: string) {
    try {
      await api.patch(`/projects/${projectId}/phases/${phaseId}`, { responsibleUserId: userId || null });
      toast.success(userId ? 'Verantwortliche/r gespeichert.' : 'Verantwortliche/r entfernt.');
      onUpdate?.();
    } catch (e: any) {
      toast.error(e.message || 'Speichern fehlgeschlagen');
    }
  }

  async function handleDelete(phase: Phase) {
    const confirmed = window.confirm(
      `Phase "${phase.name}" wirklich löschen?\n\nDieser Schritt ist nicht umkehrbar.`,
    );
    if (!confirmed) return;

    let linkedTaskAction: 'delete' | 'keep' = 'keep';
    if ((phase as any).linkedTaskId) {
      const deleteTask = window.confirm(
        `Diese Phase ist mit einer Aufgabe verknüpft.\n\nOK = Aufgabe AUCH löschen\nAbbrechen = Aufgabe BEHALTEN`,
      );
      linkedTaskAction = deleteTask ? 'delete' : 'keep';
    }

    setLoadingId(phase.id);
    setError(null);
    try {
      await fetchWithAuth(`/projects/${projectId}/phases/${phase.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ linkedTaskAction }),
        headers: { 'Content-Type': 'application/json' },
      });
      onUpdate?.();
    } catch (e: any) {
      setError(e.message || 'Fehler beim Löschen');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Phasen-Fortschritt ({completedCount} von {mainPhases.length})</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>{progress}%</span>
        </div>
        <div style={{ height: 8, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: progress === 100 ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#3b82f6,#6366f1)',
            borderRadius: 99,
            transition: 'width 0.5s ease',
          }} />
        </div>
        {currentPhase && progress < 100 && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Aktuelle Phase:</span>
            <strong style={{ fontSize: 13, color: '#1e40af' }}>{currentPhase.name}</strong>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: PHASE_COLORS[currentPhase.status] || '#475569',
              background: PHASE_BG[currentPhase.status] || '#f1f5f9',
              border: `1px solid ${PHASE_COLORS[currentPhase.status] || '#cbd5e1'}33`,
              borderRadius: 10, padding: '2px 10px',
            }}>
              {PHASE_LABELS[currentPhase.status] || currentPhase.status}
            </span>
            {canEdit && currentPhase.status === 'PENDING' && (
              <button
                onClick={() => handleStatusChange(currentPhase as any, 'IN_PROGRESS')}
                style={{ fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', cursor: 'pointer' }}
              >
                ▶ Starten
              </button>
            )}
            {canEdit && currentPhase.status === 'IN_PROGRESS' && (
              <button
                onClick={() => handleStatusChange(currentPhase as any, 'COMPLETED')}
                style={{ fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', cursor: 'pointer' }}
              >
                ✓ Abschliessen
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Add phase (project is the source of truth for phases/Kontingent) */}
      {canEdit && (
        <div style={{ marginBottom: 14 }}>
          {!showAddPhase ? (
            <button onClick={() => setShowAddPhase(true)} style={miniBtn}>+ Phase hinzufügen</button>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
              <input value={np.code} onChange={e => setNp({ ...np, code: e.target.value })} placeholder="Code (z.B. 31)" style={{ ...miniInput, width: 110 }} />
              <input value={np.name} onChange={e => setNp({ ...np, name: e.target.value })} placeholder="Name (z.B. Vorprojekt)" style={{ ...miniInput, flex: '1 1 200px' }} autoFocus />
              <input value={np.budgetHours} onChange={e => setNp({ ...np, budgetHours: e.target.value })} type="number" min="0" step="0.5" placeholder="Stundenkontingent" style={{ ...miniInput, width: 150 }} title="Internes Stundenkontingent (nur Admin)" />
              <button onClick={addPhase} disabled={busy || !np.name.trim()} style={miniBtn}>{busy ? '…' : 'Speichern'}</button>
              <button onClick={() => { setShowAddPhase(false); setNp({ code: '', name: '', budgetHours: '' }); }} style={miniGhost}>Abbrechen</button>
            </div>
          )}
        </div>
      )}

      {/* Phase list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {mainPhases.map((phase, idx) => {
          const isExpanded = expandedId === phase.id;
          const isLoading = loadingId === phase.id;
          const isLast = idx === mainPhases.length - 1;
          const color = PHASE_COLORS[phase.status] || '#94a3b8';
          const subPhases = childrenByParent[phase.id] || [];

          return (
            <div key={phase.id} style={{ display: 'flex', gap: 0 }}>
              {/* Connector line column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: PHASE_BG[phase.status] || '#f8fafc',
                  border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 16, flexShrink: 0, zIndex: 1,
                  boxShadow: phase.status === 'IN_PROGRESS' ? `0 0 0 4px rgba(59,130,246,0.15)` : 'none',
                  transition: 'all 0.2s',
                }}>
                  <PhaseIcon status={phase.status} />
                </div>
                {!isLast && (
                  <div style={{
                    width: 2, flex: 1, minHeight: 16,
                    background: phase.status === 'COMPLETED' ? '#22c55e' : '#e2e8f0',
                    marginTop: 2, marginBottom: 2,
                  }} />
                )}
              </div>

              {/* Phase card */}
              <div style={{ flex: 1, paddingLeft: 12, paddingBottom: isLast ? 0 : 4, paddingTop: 12 }}>
                <div
                  style={{
                    background: isExpanded ? PHASE_BG[phase.status] : '#fff',
                    border: `1px solid ${isExpanded ? color : '#e2e8f0'}`,
                    borderRadius: 10,
                    padding: '12px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    marginBottom: isLast ? 0 : 4,
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : phase.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', minWidth: 20 }}>
                        {String(phase.order).padStart(2, '0')}
                      </span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{phase.name}</div>
                        {phase.description && !isExpanded && (
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{phase.description}</div>
                        )}
                        {(phase.responsible || phase.dueDate) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3, fontSize: 11, color: '#64748b', flexWrap: 'wrap' }}>
                            {phase.responsible && <span title="Verantwortlich">👤 {phase.responsible.name}</span>}
                            {phase.dueDate && <span title="Fälligkeitsdatum">📅 Fällig: {new Date(phase.dueDate).toLocaleDateString('de-CH')}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {phase.linkedTask && (() => {
                        const cfg = TASK_STATUS_LABELS[phase.linkedTask.status] || TASK_STATUS_LABELS.OPEN;
                        return (
                          <Link
                            href={`/tasks/${phase.linkedTask.id}`}
                            onClick={(e) => e.stopPropagation()}
                            title={`Verknüpfte Aufgabe: ${phase.linkedTask.title}${phase.linkedTask.assignee ? ` · ${phase.linkedTask.assignee.name}` : ''}`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 11, fontWeight: 600,
                              padding: '2px 8px', borderRadius: 6,
                              background: cfg.bg, color: cfg.color,
                              border: `1px solid ${cfg.color}33`,
                              textDecoration: 'none',
                            }}
                          >
                            <FiCheckSquare size={11} />
                            Aufgabe · {cfg.label}
                          </Link>
                        );
                      })()}
                      {/* Remaining hours visible WITHOUT expanding (the most-needed number, plain words) */}
                      {!isExtern && (phase.budgetHours || 0) > 0 && (() => {
                        const used = phaseUsedHours(phase);
                        const rem = (phase.budgetHours || 0) - used;
                        return (
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            color: rem <= 0 ? '#dc2626' : rem < (phase.budgetHours || 0) * 0.2 ? '#d97706' : '#16a34a',
                            background: rem <= 0 ? '#fef2f2' : rem < (phase.budgetHours || 0) * 0.2 ? '#fffbeb' : '#f0fdf4',
                            borderRadius: 20, padding: '2px 10px', whiteSpace: 'nowrap',
                          }} title="Verbleibende Stunden">
                            {rem > 0 ? `${rem.toFixed(1)} von ${(phase.budgetHours || 0).toFixed(0)} Std. übrig` : `${Math.abs(rem).toFixed(1)} Std. über`}
                          </span>
                        );
                      })()}
                      <span style={{
                        fontSize: 11, fontWeight: 600, color, background: PHASE_BG[phase.status],
                        border: `1px solid ${color}`, borderRadius: 20, padding: '2px 10px',
                      }}>
                        {PHASE_LABELS[phase.status] || phase.status}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, color: '#64748b' }}>
                        {isExpanded ? <>Schliessen <FiChevronUp size={13} /></> : <>Details <FiChevronDown size={13} /></>}
                      </span>
                    </div>
                  </div>

                  {/* Sub-phases (organization only — shown inline, no budget) */}
                  {subPhases.length > 0 && (
                    <div style={{ marginTop: 10, paddingLeft: 30, display: 'flex', flexDirection: 'column', gap: 4 }} onClick={e => e.stopPropagation()}>
                      {subPhases.map(sp => (
                        <div key={sp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
                          <span style={{ color: '#cbd5e1' }}>↳</span>
                          {sp.code && <span style={{ fontWeight: 700, color: '#94a3b8' }}>{sp.code}</span>}
                          <span style={{ textDecoration: sp.status === 'COMPLETED' ? 'line-through' : 'none' }}>{sp.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Per-phase add: sub-phase only. Aufgaben werden im Register „Aufgaben" hinzugefügt, nicht hier. */}
                  {canEdit && (
                    <div style={{ marginTop: 10, paddingLeft: 30 }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setSubFor(subFor === phase.id ? null : phase.id); }} style={miniGhost}>+ Sub-Phase</button>
                      </div>
                      {subFor === phase.id && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <input value={ns.code} onChange={e => setNs({ ...ns, code: e.target.value })} placeholder="Code (z.B. 31.1)" style={{ ...miniInput, width: 120 }} />
                          <input value={ns.name} onChange={e => setNs({ ...ns, name: e.target.value })} placeholder="Sub-Phase Name" style={{ ...miniInput, flex: '1 1 180px' }} autoFocus />
                          <button onClick={() => addSub(phase.id)} disabled={busy || !ns.name.trim()} style={miniBtn}>{busy ? '…' : 'Speichern'}</button>
                          <button onClick={() => { setSubFor(null); setNs({ code: '', name: '' }); }} style={miniGhost}>Abbrechen</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{ marginTop: 14, borderTop: '1px solid #f1f5f9', paddingTop: 14 }} onClick={e => e.stopPropagation()}>
                      {phase.description && (
                        <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>{phase.description}</div>
                      )}

                      {/* Dates row */}
                      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                        {phase.completedAt && (
                          <div style={{ fontSize: 12, color: '#22c55e' }}>
                            ✓ Abgeschlossen: {new Date(phase.completedAt).toLocaleDateString('de-CH')}
                            {phase.completedBy && ` von ${phase.completedBy.name}`}
                          </div>
                        )}
                        {phase.startDate && (
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            Start: {new Date(phase.startDate).toLocaleDateString('de-CH')}
                          </div>
                        )}
                        {phase.endDate && (
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            Ende: {new Date(phase.endDate).toLocaleDateString('de-CH')}
                          </div>
                        )}
                      </div>

                      {/* Phase hub: hours + recent entries + Zeit erfassen (one place per phase). Hidden for external clients. */}
                      {!isExtern && (() => {
                        const used = phaseUsedHours(phase);
                        const budget = phase.budgetHours || 0;
                        const remaining = budget > 0 ? budget - used : 0;
                        const ratio = budget > 0 ? used / budget : 0;
                        const pct = Math.min(ratio * 100, 100);
                        const barColor = ratio >= 1 ? '#dc2626' : ratio >= 0.8 ? '#d97706' : '#1a1a1a';
                        const entries = (phase.timeEntries || []).filter(e => !(e.isBillableExtra || e.task?.isBillableExtra));
                        return (
                          <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Stunden
                                <Tooltip text={'Kontingent = die für diese Phase geplanten Stunden. „Std. geplant" ist das Budget, „übrig" der Rest. Mehrkosten zählen nicht mit.'} />
                              </span>
                              <button
                                onClick={() => onLogTime?.(phase.id)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 7, padding: '5px 11px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                              >
                                <FiClock size={12} /> Zeit erfassen
                              </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: budget > 0 ? 6 : 0, fontSize: 12 }}>
                              <span style={{ color: ratio >= 1 ? '#dc2626' : ratio >= 0.8 ? '#d97706' : '#475569', fontWeight: 600 }}>{used.toFixed(1)}h</span>
                              <span style={{ color: '#94a3b8' }}>/</span>
                              {showFinancials && canEdit ? (() => {
                                const draft = budgetDraft[phase.id];
                                const dirty = draft !== undefined && draft !== '' && Number(draft) !== budget;
                                const commit = () => { const v = parseFloat(budgetDraft[phase.id]); if (!isNaN(v) && v !== budget) savePhaseBudget(phase.id, v); };
                                return (
                                  <>
                                    <input
                                      type="number" min={0} step={0.5}
                                      value={draft ?? (budget || '')}
                                      placeholder="geplante Std."
                                      title="Geplante Stunden für diese Phase"
                                      onClick={e => e.stopPropagation()}
                                      onChange={e => setBudgetDraft(d => ({ ...d, [phase.id]: e.target.value }))}
                                      onKeyDown={e => { if (e.key === 'Enter') commit(); }}
                                      onBlur={commit}
                                      style={{ width: 70, fontSize: 12, padding: '3px 6px', borderRadius: 6, border: dirty ? '1px solid #1a1a1a' : '1px solid #d1d5db', textAlign: 'right', fontWeight: 600 }}
                                    />
                                    {dirty && (
                                      <button onClick={e => { e.stopPropagation(); commit(); }} style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, border: 'none', background: '#1a1a1a', color: '#fff', cursor: 'pointer' }}>Speichern</button>
                                    )}
                                  </>
                                );
                              })() : (
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{budget > 0 ? `${budget.toFixed(1)}h` : '—'}</span>
                              )}
                              <span style={{ color: '#94a3b8' }}>Std. geplant</span>
                              {budget > 0 && (
                                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: remaining <= 0 ? '#dc2626' : '#16a34a', background: remaining <= 0 ? '#fef2f2' : '#f0fdf4', borderRadius: 8, padding: '2px 8px' }}>
                                  {remaining > 0 ? `${remaining.toFixed(1)} Std. übrig` : `${Math.abs(remaining).toFixed(1)} Std. über`}
                                </span>
                              )}
                            </div>
                            {budget > 0 && (
                              <div style={{ background: '#e2e8f0', borderRadius: 20, height: 6, overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: barColor, borderRadius: 20, width: `${pct}%`, transition: 'width 0.3s' }} />
                              </div>
                            )}
                            {/* Verantwortliche/r für diese Phase — direkt hier zuweisen */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 12 }}>
                              <span style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>👤 Verantwortlich:</span>
                              {canEdit ? (
                                <select
                                  value={phase.responsibleUserId || ''}
                                  onClick={e => e.stopPropagation()}
                                  onChange={e => { e.stopPropagation(); savePhaseResponsible(phase.id, e.target.value); }}
                                  style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', maxWidth: 220 }}
                                >
                                  <option value="">— niemand —</option>
                                  {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                                </select>
                              ) : (
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{phase.responsible?.name || '—'}</span>
                              )}
                            </div>
                            {entries.length > 0 && (
                              <div style={{ marginTop: 8, borderTop: '1px solid #e5e7eb', paddingTop: 8 }}>
                                {entries.slice(0, 3).map(e => (
                                  <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', padding: '2px 0', gap: 8 }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.user?.name || '—'} — {e.description || 'Keine Beschreibung'}</span>
                                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{(e.durationMinutes / 60).toFixed(1)}h · {new Date(e.startedAt).toLocaleDateString('de-CH')}</span>
                                  </div>
                                ))}
                                {entries.length > 3 && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>+ {entries.length - 3} weitere Einträge</div>}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Linked task block */}
                      {phase.linkedTask && (
                        <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                            Verknüpfte Aufgabe
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                            <Link href={`/tasks/${phase.linkedTask.id}`} style={{ fontSize: 13, color: '#1e40af', fontWeight: 600, textDecoration: 'none' }}>
                              {phase.linkedTask.title} ↗
                            </Link>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: '#64748b' }}>
                              {phase.linkedTask.assignee && <span>👤 {phase.linkedTask.assignee.name}</span>}
                              {phase.linkedTask.dueDate && <span>📅 {new Date(phase.linkedTask.dueDate).toLocaleDateString('de-CH')}</span>}
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                                background: TASK_STATUS_LABELS[phase.linkedTask.status]?.bg,
                                color: TASK_STATUS_LABELS[phase.linkedTask.status]?.color,
                              }}>
                                {TASK_STATUS_LABELS[phase.linkedTask.status]?.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {canEdit && (
                        <textarea
                          value={editNotes[phase.id] ?? (phase.notes || '')}
                          onChange={e => setEditNotes(n => ({ ...n, [phase.id]: e.target.value }))}
                          placeholder="Notizen zu dieser Phase..."
                          rows={2}
                          style={{
                            width: '100%', fontSize: 13, padding: '8px 10px',
                            border: '1px solid #e2e8f0', borderRadius: 7,
                            resize: 'vertical', fontFamily: 'inherit', color: '#374151',
                            background: '#f8fafc', boxSizing: 'border-box', marginBottom: 10,
                          }}
                        />
                      )}
                      {!canEdit && phase.notes && (
                        <div style={{ fontSize: 13, color: '#475569', background: '#f8fafc', borderRadius: 7, padding: '8px 10px', marginBottom: 10 }}>
                          {phase.notes}
                        </div>
                      )}

                      {/* Action buttons */}
                      {canEdit && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {phase.status !== 'IN_PROGRESS' && phase.status !== 'COMPLETED' && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleStatusChange(phase, 'IN_PROGRESS')}
                              style={{
                                fontSize: 12, fontWeight: 600, padding: '6px 14px',
                                borderRadius: 7, border: 'none', cursor: 'pointer',
                                background: '#eff6ff', color: '#1a1a1a',
                                opacity: isLoading ? 0.6 : 1,
                              }}
                            >
                              {isLoading ? '...' : '▶ Starten'}
                            </button>
                          )}
                          {phase.status !== 'COMPLETED' && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleStatusChange(phase, 'COMPLETED')}
                              style={{
                                fontSize: 12, fontWeight: 600, padding: '6px 14px',
                                borderRadius: 7, border: 'none', cursor: 'pointer',
                                background: '#f0fdf4', color: '#16a34a',
                                opacity: isLoading ? 0.6 : 1,
                              }}
                            >
                              {isLoading ? '...' : '✓ Abschliessen'}
                            </button>
                          )}
                          {phase.status !== 'PENDING' && phase.status !== 'SKIPPED' && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleStatusChange(phase, 'PENDING')}
                              style={{
                                fontSize: 12, fontWeight: 500, padding: '6px 14px',
                                borderRadius: 7, border: '1px solid #e2e8f0', cursor: 'pointer',
                                background: '#fff', color: '#64748b',
                                opacity: isLoading ? 0.6 : 1,
                              }}
                            >
                              {isLoading ? '...' : '↩ Zurücksetzen'}
                            </button>
                          )}
                          {phase.status !== 'SKIPPED' && (
                            <button
                              disabled={isLoading}
                              onClick={() => handleStatusChange(phase, 'SKIPPED')}
                              style={{
                                fontSize: 12, fontWeight: 500, padding: '6px 14px',
                                borderRadius: 7, border: '1px solid #e2e8f0', cursor: 'pointer',
                                background: '#fff', color: '#94a3b8',
                                opacity: isLoading ? 0.6 : 1,
                              }}
                            >
                              {isLoading ? '...' : '⟶ Überspringen'}
                            </button>
                          )}
                          <button
                            disabled={isLoading}
                            onClick={() => handleDelete(phase)}
                            title="Phase löschen"
                            style={{
                              fontSize: 12, fontWeight: 500, padding: '6px 12px',
                              borderRadius: 7, border: '1px solid #fecaca', cursor: 'pointer',
                              background: '#fff', color: '#dc2626',
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              opacity: isLoading ? 0.6 : 1, marginLeft: 'auto',
                            }}
                          >
                            <FiTrash2 size={12} /> {isLoading ? '...' : 'Löschen'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
