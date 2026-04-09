"use client";
import { useEffect, useState } from 'react';
import { api } from '../../src/api/client';
import { TYPE_LABELS, TYPE_ICONS } from './phaseConfig';
import { formatCHF } from '../../src/lib/formatCurrency';
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
        <div key={i} style={{ height: 80, background: '#FAF9F6', borderRadius: 10, border: '1px solid #E8E4DE' }} />
      ))}
    </div>
  );
  if (!stats) return null;

  const cards = [
    { label: 'Projekte total', value: stats.total, color: '#1a1a1a' },
    { label: 'Aktiv', value: stats.active, color: '#16a34a' },
    { label: 'Pausiert', value: stats.onHold, color: '#e8a838' },
    { label: 'Abgeschlossen', value: stats.completed, color: '#7c3aed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI row */}
      <div className="proj-stats-kpi">
        {cards.map(c => (
          <div key={c.label} style={{
            background: '#FAF9F6', border: '1px solid #E8E4DE',
            borderRadius: 10, padding: '16px 18px',
          }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Budget total */}
      {stats.totalBudget > 0 && (
        <div style={{
          background: '#1a1a1a',
          borderRadius: 10, padding: '16px 22px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Gesamtbudget (alle Projekte)
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 4 }}>
              {formatCHF(stats.totalBudget)}
            </div>
          </div>
        </div>
      )}

      {/* By type */}
      {stats.byType?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 10 }}>Nach Projekttyp</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.byType.map((t: any) => (
              <div key={t.type} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15, width: 24, textAlign: 'center' }}>{TYPE_ICONS[t.type] || '📁'}</span>
                <span style={{ fontSize: 13, color: '#333', flex: 1 }}>{TYPE_LABELS[t.type] || t.type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                  <div style={{ flex: 1, height: 5, background: '#E8E4DE', borderRadius: 99 }}>
                    <div style={{
                      height: '100%', borderRadius: 99, background: '#1a1a1a',
                      width: `${stats.total > 0 ? Math.round((t.count / stats.total) * 100) : 0}%`,
                    }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', minWidth: 20, textAlign: 'right' }}>{t.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
