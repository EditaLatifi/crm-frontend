
import React, { useEffect, useState } from 'react';

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
  DEFAULT: '#64748b',
};

export default function ActivityLog({ accountId, onClose }: { accountId: string, onClose: () => void }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    fetch(`${API_URL}/activity?entityType=Account&entityId=${accountId}`)
      .then(async res => {
        try {
          const data = await res.json();
          setActivities(Array.isArray(data) ? data : []);
        } catch {
          setActivities([]);
        }
        setLoading(false);
      });
  }, [accountId]);

  return (
    <div style={{ width: '100%', maxWidth: 900, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: 'none', padding: 24, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#23272f', margin: 0 }}>Audit-Logs</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
      </div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 18 }}>Überwache Hauptänderige und Kommentare für die Firma.</div>
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
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#888' }}>Kei Aktivität gfunde.</td></tr>
              ) : (
                activities.map(act => (
                  <tr key={act.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }}>
                    <td style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={act.actorAvatarUrl || '/avatar.svg'} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', background: '#f3f4f6' }} />
                      <span style={{ fontWeight: 500 }}>{act.actorName || act.actorUserId}</span>
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: 600, color: ACTION_COLORS[act.action] || ACTION_COLORS.DEFAULT }}>{act.action}</td>
                    <td style={{ padding: '10px 8px', color: '#64748b' }}>{act.type || '-'}</td>
                    <td style={{ padding: '10px 8px', color: '#64748b' }}>{act.environment || '-'}</td>
                    <td style={{ padding: '10px 8px', color: '#23272f', fontFamily: 'monospace', fontSize: 12, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.payloadJson ? JSON.stringify(act.payloadJson) : '-'}</td>
                    <td style={{ padding: '10px 8px', color: '#64748b' }}>{new Date(act.createdAt).toLocaleDateString()}</td>
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
