"use client";
import { useState } from 'react';
import { api } from '../../src/api/client';
import { PHASE_COLORS, PHASE_LABELS, PHASE_BG } from './phaseConfig';
import { FiCheck, FiClock, FiSkipForward, FiChevronDown, FiChevronUp } from 'react-icons/fi';

type Phase = {
  id: string;
  name: string;
  description?: string;
  order: number;
  status: string;
  notes?: string;
  startDate?: string;
  endDate?: string;
  completedAt?: string;
  completedBy?: { id: string; name: string } | null;
};

type Props = {
  projectId: string;
  phases: Phase[];
  canEdit: boolean;
  onUpdate?: () => void;
};

const PhaseIcon = ({ status }: { status: string }) => {
  if (status === 'COMPLETED') return <FiCheck size={14} color="#22c55e" />;
  if (status === 'IN_PROGRESS') return <FiClock size={14} color="#3b82f6" />;
  if (status === 'SKIPPED') return <FiSkipForward size={14} color="#94a3b8" />;
  return <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#e2e8f0', display: 'inline-block' }} />;
};

export default function PhaseTimeline({ projectId, phases, canEdit, onUpdate }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const completedCount = phases.filter(p => p.status === 'COMPLETED' || p.status === 'SKIPPED').length;
  const progress = phases.length > 0 ? Math.round((completedCount / phases.length) * 100) : 0;

  const currentPhase = phases.find(p => p.status === 'IN_PROGRESS') || phases.find(p => p.status === 'PENDING');

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

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Gesamtfortschritt</span>
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
          <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
            Aktuelle Phase: <strong style={{ color: '#1e40af' }}>{currentPhase.name}</strong>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Phase list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {phases.map((phase, idx) => {
          const isExpanded = expandedId === phase.id;
          const isLoading = loadingId === phase.id;
          const isLast = idx === phases.length - 1;
          const color = PHASE_COLORS[phase.status] || '#94a3b8';

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
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color, background: PHASE_BG[phase.status],
                        border: `1px solid ${color}`, borderRadius: 20, padding: '2px 10px',
                      }}>
                        {PHASE_LABELS[phase.status] || phase.status}
                      </span>
                      {isExpanded ? <FiChevronUp size={14} color="#94a3b8" /> : <FiChevronDown size={14} color="#94a3b8" />}
                    </div>
                  </div>

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
                                background: '#eff6ff', color: '#2563eb',
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
