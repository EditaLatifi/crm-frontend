"use client";
import React, { useEffect, useState } from 'react';
import { api } from '../../src/api/client';

interface Activity {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  payloadJson: any;
  createdAt: string;
  actor?: { id: string; name: string; email: string };
}

const ACTION_ICONS: Record<string, string> = {
  CREATE: '➕',
  UPDATE: '✏️',
  DELETE: '🗑️',
  change_stage: '🔄',
  timer_stop: '⏱️',
  COMMENT: '💬',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'erstellt',
  UPDATE: 'aktualisiert',
  DELETE: 'gelöscht',
  change_stage: 'Phase geändert',
  timer_stop: 'Zeit gestoppt',
  COMMENT: 'kommentiert',
};

const ENTITY_LABELS: Record<string, string> = {
  Contact: 'Kontakt',
  Account: 'Konto',
  Deal: 'Deal',
  Task: 'Aufgabe',
  TimeEntry: 'Zeiteintrag',
};

function getEntityName(act: Activity): string {
  const p = act.payloadJson;
  if (!p) return act.entityId.slice(0, 8) + '…';
  return p.name || p.title || p.subject || act.entityId.slice(0, 8) + '…';
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Gerade eben';
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
  return new Date(dateStr).toLocaleDateString('de-CH', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ActivityFeedPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/activity?limit=100')
      .then((data: any) => {
        setActivities(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => { setActivities([]); setLoading(false); });
  }, []);

  const filtered = filter
    ? activities.filter(a => a.entityType === filter || a.action === filter)
    : activities;

  const entityTypes = [...new Set(activities.map(a => a.entityType))];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>Aktivitäten</h1>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
            Alle Aktionen im System — {activities.length} Einträge
          </div>
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #d1d5db', fontSize: 13, color: '#374151' }}
        >
          <option value=''>Alle Typen</option>
          {entityTypes.map(t => (
            <option key={t} value={t}>{ENTITY_LABELS[t] || t}</option>
          ))}
        </select>
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <div style={{ width: 24, height: 24, border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>Keine Aktivitäten gefunden</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              Aktivitäten werden erfasst, sobald Kontakte, Konten oder Deals erstellt/bearbeitet werden.
            </div>
          </div>
        ) : (
          <div>
            {filtered.map((act, i) => {
              const actorName = act.actor?.name || act.actor?.email || 'System';
              const icon = ACTION_ICONS[act.action] || '📌';
              const actionLabel = ACTION_LABELS[act.action] || act.action;
              const entityLabel = ENTITY_LABELS[act.entityType] || act.entityType;
              const entityName = getEntityName(act);

              return (
                <div key={act.id} style={{
                  display: 'flex', gap: 14, padding: '14px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                  alignItems: 'flex-start',
                }}>
                  {/* Icon circle */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0, marginTop: 1,
                  }}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.5 }}>
                      <b>{actorName}</b>
                      {' hat '}
                      <span style={{ color: '#64748b' }}>{entityLabel}</span>
                      {' '}
                      <b style={{ color: '#1e293b' }}>{entityName}</b>
                      {' '}
                      <span style={{ color: '#64748b' }}>{actionLabel}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, display: 'flex', gap: 10 }}>
                      <span>{formatRelative(act.createdAt)}</span>
                      <span style={{
                        background: '#f8fafc', border: '1px solid #e5e7eb',
                        borderRadius: 4, padding: '0 6px', fontSize: 10, fontWeight: 600, color: '#64748b',
                      }}>
                        {entityLabel}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div style={{ fontSize: 11, color: '#cbd5e1', flexShrink: 0, marginTop: 3 }}>
                    {new Date(act.createdAt).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
