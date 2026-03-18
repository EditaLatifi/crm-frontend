"use client";
import { useEffect, useState } from 'react';
import { api } from '../../src/api/client';
import { STATUS_COLORS, STATUS_LABELS, TYPE_LABELS, TYPE_ICONS } from './phaseConfig';
import '../../app/(app)/projects/projects.css';

export default function ProjectStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects/stats')
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="proj-stats-kpi">
      {[1,2,3,4].map(i => (
        <div key={i} style={{ height: 88, background: '#f1f5f9', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  );
  if (!stats) return null;

  const cards = [
    { label: 'Projekte total', value: stats.total, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Aktiv', value: stats.active, color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Pausiert', value: stats.onHold, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Abgeschlossen', value: stats.completed, color: '#6366f1', bg: '#f5f3ff' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI row */}
      <div className="proj-stats-kpi">
        {cards.map(c => (
          <div key={c.label} style={{
            background: c.bg, border: `1px solid ${c.color}33`,
            borderRadius: 12, padding: '18px 20px',
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Budget total */}
      {stats.totalBudget > 0 && (
        <div style={{
          background: 'linear-gradient(135deg,#0f172a,#1e293b)',
          borderRadius: 12, padding: '18px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Gesamtbudget (alle Projekte)
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginTop: 4 }}>
              {stats.totalBudget.toLocaleString('de-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 })}
            </div>
          </div>
          <div style={{ fontSize: 36 }}>💰</div>
        </div>
      )}

      {/* By type */}
      {stats.byType?.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Nach Projekttyp</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.byType.map((t: any) => (
              <div key={t.type} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{TYPE_ICONS[t.type] || '📁'}</span>
                <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{TYPE_LABELS[t.type] || t.type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                  <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 99 }}>
                    <div style={{
                      height: '100%', borderRadius: 99, background: '#3b82f6',
                      width: `${stats.total > 0 ? Math.round((t.count / stats.total) * 100) : 0}%`,
                    }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', minWidth: 20, textAlign: 'right' }}>{t.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
