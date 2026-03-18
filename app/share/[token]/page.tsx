"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PERMIT_STATUS_LABELS, PERMIT_STATUS_COLORS } from '../../../components/permits/permitConfig';
import { STATUS_LABELS, STATUS_COLORS, TYPE_LABELS, TYPE_ICONS } from '../../../components/projects/phaseConfig';
import { FiMapPin, FiCalendar, FiUsers, FiDownload } from 'react-icons/fi';

const PHASE_STATUS_COLORS: Record<string,string> = { PENDING: '#94a3b8', IN_PROGRESS: '#3b82f6', COMPLETED: '#22c55e', SKIPPED: '#e2e8f0' };
const PHASE_STATUS_LABELS: Record<string,string> = { PENDING: 'Ausstehend', IN_PROGRESS: 'In Bearbeitung', COMPLETED: 'Abgeschlossen', SKIPPED: 'Übersprungen' };
const PHASE_ICONS: Record<string,string> = { PENDING: '⏳', IN_PROGRESS: '🔄', COMPLETED: '✅', SKIPPED: '⏭️' };

function fmt(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function SharePage() {
  const params = useParams();
  const token = params?.token as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then(async r => {
        try {
          const d = await r.json();
          if (!r.ok || d.message) setError(d.message || 'Link ungültig oder abgelaufen');
          else setData(d);
        } catch {
          setError('Server nicht erreichbar. Bitte kurz warten und Seite neu laden.');
        }
      })
      .catch(() => setError('Server nicht erreichbar. Bitte kurz warten und Seite neu laden.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏗️</div>
        <div>Laden...</div>
      </div>
    </div>
  );

  if (error || !data) return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 380, padding: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Zugriff nicht möglich</div>
        <div style={{ color: '#64748b', fontSize: 14 }}>{error || 'Dieser Link ist ungültig oder abgelaufen.'}</div>
      </div>
    </div>
  );

  const { project, label, expiresAt } = data;
  const phases = project.phases || [];
  const completed = phases.filter((p: any) => p.status === 'COMPLETED' || p.status === 'SKIPPED').length;
  const progress = phases.length > 0 ? Math.round((completed / phases.length) * 100) : 0;
  const currentPhase = phases.find((p: any) => p.status === 'IN_PROGRESS');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f0f9ff 0%,#f5f3ff 100%)', padding: '0 0 60px' }}>

      {/* Print styles */}
      <style>{`
        @media print {
          .share-topbar { display: none !important; }
          .share-print-btn { display: none !important; }
          body { background: #fff !important; }
          @page { margin: 20mm; }
        }
      `}</style>

      {/* Top bar */}
      <div className="share-topbar" style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏛️</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>ip3 Projektportal</div>
            {label && <div style={{ color: '#94a3b8', fontSize: 11 }}>{label}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ color: '#94a3b8', fontSize: 11 }}>
            {expiresAt ? `Gültig bis ${new Date(expiresAt).toLocaleDateString('de-CH')}` : 'Unbegrenzt gültig'}
          </div>
          <button
            className="share-print-btn"
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            <FiDownload size={13} /> PDF exportieren
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>

        {/* Project header */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ height: 6, background: `linear-gradient(90deg,${STATUS_COLORS[project.status] || '#3b82f6'},#6366f1)` }} />
          <div style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 30 }}>{TYPE_ICONS[project.type] || '🏗️'}</span>
                  <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{project.name}</h1>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: (STATUS_COLORS[project.status] || '#94a3b8') + '18', color: STATUS_COLORS[project.status] || '#64748b' }}>
                    {STATUS_LABELS[project.status]}
                  </span>
                  <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#f1f5f9', color: '#64748b' }}>
                    {TYPE_LABELS[project.type] || project.type}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: progress === 100 ? '#22c55e' : '#2563eb' }}>{progress}%</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Fortschritt</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ height: 12, background: '#f1f5f9', borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, background: progress === 100 ? '#22c55e' : 'linear-gradient(90deg,#2563eb,#6366f1)', width: `${progress}%`, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: '#94a3b8' }}>
                <span>{completed} von {phases.length} Phasen abgeschlossen</span>
                {currentPhase && <span style={{ color: '#3b82f6', fontWeight: 600 }}>Aktuell: {currentPhase.name}</span>}
              </div>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {project.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                  <FiMapPin size={13} /> {project.address}
                </div>
              )}
              {project.startDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                  <FiCalendar size={13} />
                  {fmt(project.startDate)}
                  {project.expectedEndDate && ` → ${fmt(project.expectedEndDate)}`}
                </div>
              )}
              {project.owner && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                  <FiUsers size={13} /> {project.owner.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phase timeline */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '28px 32px', marginBottom: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Projektphasen</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {phases.map((phase: any, i: number) => {
              const color = PHASE_STATUS_COLORS[phase.status];
              const isLast = i === phases.length - 1;
              return (
                <div key={phase.id} style={{ display: 'flex', gap: 16, paddingBottom: isLast ? 0 : 20, position: 'relative' }}>
                  {/* Line */}
                  {!isLast && (
                    <div style={{ position: 'absolute', left: 17, top: 36, bottom: 0, width: 2, background: phase.status === 'COMPLETED' ? '#22c55e' : '#e2e8f0' }} />
                  )}
                  {/* Dot */}
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: phase.status === 'COMPLETED' ? '#22c55e' : phase.status === 'IN_PROGRESS' ? '#eff6ff' : '#f8fafc', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, zIndex: 1 }}>
                    {phase.status === 'COMPLETED' ? '✓' : phase.order}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, paddingTop: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{phase.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: color + '18', color }}>
                        {PHASE_STATUS_LABELS[phase.status]}
                      </span>
                    </div>
                    {phase.description && <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>{phase.description}</div>}
                    {(phase.startDate || phase.endDate) && (
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                        {fmt(phase.startDate)}{phase.endDate ? ` → ${fmt(phase.endDate)}` : ''}
                      </div>
                    )}
                    {phase.completedAt && (
                      <div style={{ fontSize: 12, color: '#22c55e', marginTop: 2 }}>
                        Abgeschlossen: {fmt(phase.completedAt)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Permits */}
        {project.permits?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '28px 32px', marginBottom: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Baubewilligungen</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {project.permits.map((p: any) => {
                const color = PERMIT_STATUS_COLORS[p.status] || '#94a3b8';
                const isOverdue = p.expectedDecisionAt && new Date(p.expectedDecisionAt) < new Date() && !['BEWILLIGT','ABGELEHNT','ZURUECKGEZOGEN'].includes(p.status);
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{p.title}</div>
                      {p.authority && <div style={{ fontSize: 12, color: '#64748b' }}>{p.authority}</div>}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: color + '18', color }}>{PERMIT_STATUS_LABELS[p.status]}</span>
                    {isOverdue && <span style={{ fontSize: 11, background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Überfällig</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 32 }}>
          Powered by ip3 CRM · Letzte Aktualisierung: {new Date().toLocaleDateString('de-CH')}
        </div>
      </div>
    </div>
  );
}
