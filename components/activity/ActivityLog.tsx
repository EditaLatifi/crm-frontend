
import React, { useEffect, useState } from 'react';
import { api } from '../../src/api/client';

interface Activity {
  id: string;
  actorUserId: string;
  actorName?: string;
  actorAvatarUrl?: string;
  entityType: string;
  entityId: string;
  action: string;
  type?: string;
  environment?: string;
  payloadJson?: any;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: '#22c55e',
  UPDATE: '#2563eb',
  DELETE: '#ef4444',
  COMMENT: '#a855f7',
  PHASE_UPDATE: '#7c3aed',
  TIME_LOGGED: '#0891b2',
  ASSIGNED: '#d97706',
  STATUS_CHANGED: '#2563eb',
  DEFAULT: '#64748b',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Erstellt',
  UPDATE: 'Aktualisiert',
  DELETE: 'Gelöscht',
  COMMENT: 'Kommentiert',
  PHASE_UPDATE: 'Phasenänderung',
  change_stage: 'Phase geändert',
  DEAL_CREATED: 'Deal erstellt',
  DEAL_UPDATED: 'Deal aktualisiert',
  DEAL_DELETED: 'Deal gelöscht',
  STAGE_CHANGE: 'Phase geändert',
  TIME_LOGGED: 'Zeit erfasst',
  timer_stop: 'Zeit gestoppt',
  ASSIGNED: 'Zugewiesen',
  STATUS_CHANGED: 'Status geändert',
  TITLE_CHANGED: 'Titel geändert',
  DESCRIPTION_CHANGED: 'Beschreibung geändert',
  CHECKLIST_UPDATED: 'Checkliste aktualisiert',
  PRIORITY_CHANGED: 'Priorität geändert',
  MEMBER_ADDED: 'Mitglied hinzugefügt',
  MEMBER_REMOVED: 'Mitglied entfernt',
};

function formatPayload(payload: any): string {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  const parts: string[] = [];
  if (payload.name) parts.push(payload.name);
  if (payload.changes) {
    const c = payload.changes;
    Object.keys(c).forEach(key => {
      parts.push(`${key}: ${c[key]?.from ?? '—'} → ${c[key]?.to ?? '—'}`);
    });
  }
  if (payload.phaseName) parts.push(`Phase: ${payload.phaseName}`);
  if (payload.newStatus) {
    const STATUS_DE: Record<string, string> = { PENDING: 'Ausstehend', IN_PROGRESS: 'In Bearbeitung', COMPLETED: 'Abgeschlossen', SKIPPED: 'Übersprungen' };
    parts.push(STATUS_DE[payload.newStatus] || payload.newStatus);
  }
  if (payload.from && payload.to && !payload.changes) parts.push(`${payload.from} → ${payload.to}`);
  return parts.join(' | ') || JSON.stringify(payload);
}

export default function ActivityLog({ accountId, onClose }: { accountId: string, onClose: () => void }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/activity?entityType=Account&entityId=${accountId}`)
      .then((data: any) => { setActivities(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setActivities([]); setLoading(false); });
  }, [accountId]);

  return (
    <div style={{ width: '100%', maxWidth: 900, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: 'none', padding: 24, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#23272f', margin: 0 }}>Audit-Logs</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
      </div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 18 }}>Überwacht wichtige Änderungen und Kommentare für das Unternehmen.</div>
      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>Lade...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13, background: '#fff' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#23272f', fontWeight: 600 }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', borderTopLeftRadius: 8 }}>Benutzer</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Aktion</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Typ</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Umgebung</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Details</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', borderTopRightRadius: 8 }}>Datum</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#888' }}>Keine Aktivität gefunden.</td></tr>
              ) : (
                activities.map(act => (
                  <tr key={act.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}>
                    <td style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8a838', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {((act as any).actor?.name || act.actorName || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{(act as any).actor?.name || act.actorName || 'Benutzer'}</span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ACTION_COLORS[act.action] || ACTION_COLORS.DEFAULT, background: `${ACTION_COLORS[act.action] || ACTION_COLORS.DEFAULT}14`, borderRadius: 20, padding: '2px 9px' }}>
                        {ACTION_LABELS[act.action] ?? act.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: '#64748b' }}>{act.entityType || '-'}</td>
                    <td style={{ padding: '10px 8px', color: '#64748b' }}>{act.environment || '-'}</td>
                    <td style={{ padding: '10px 8px', color: '#23272f', fontSize: 12, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.payloadJson ? formatPayload(act.payloadJson) : '—'}</td>
                    <td style={{ padding: '10px 8px', color: '#64748b' }}>{new Date(act.createdAt).toLocaleString('de-CH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
