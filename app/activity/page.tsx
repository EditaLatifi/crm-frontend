
"use client";
import React, { useEffect, useState } from 'react';

interface Activity {
  id: string;
  actorUserId: string;
  actorName?: string;
  entityType: string;
  entityId: string;
  action: string;
  entityName?: string;
  details?: string;
  createdAt: string;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ActivityFeedPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    fetch(`${API_URL}/activity?limit=20`)
      .then(async res => {
        try {
          const data = await res.json();
          setActivities(Array.isArray(data) ? data : []);
        } catch {
          setActivities([]);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24, fontSize: 18, fontWeight: 700 }}>Aktivitäts-Feed</h1>
      <div style={{ background: '#fff', borderRadius: 8, padding: 32, minHeight: 320 }}>
        {loading ? (
          <div style={{ color: '#888', fontSize: 14 }}>Lädt...</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {activities.length === 0 ? (
              <li style={{ color: '#888', fontSize: 14 }}>Keine Aktivität gefunden.</li>
            ) : (
              activities.map(act => (
                <li key={act.id} style={{ marginBottom: 20, fontSize: 15, color: '#23272f' }}>
                  <span style={{ fontWeight: 700 }}>{formatTime(act.createdAt)}</span>
                  {act.action === 'COMMENT' ? (
                    <> - Kommentar von <b>{act.actorName || act.actorUserId}</b> hinzugefügt</>
                  ) : act.action === 'UPDATE' && act.entityType === 'Task' ? (
                    <> - Aufgabe <b>{act.entityName || act.entityId}</b> aktualisiert von <b>{act.actorName || act.actorUserId}</b></>
                  ) : act.action === 'COMPLETE' && act.entityType === 'Task' ? (
                    <> - Aufgabe <b>{act.entityName || act.entityId}</b> als erledigt markiert von <b>{act.actorName || act.actorUserId}</b></>
                  ) : act.action === 'UPDATE' && act.entityType === 'Deal' ? (
                    <> - Deal <b>{act.entityName || act.entityId}</b> aktualisiert von <b>{act.actorName || act.actorUserId}</b></>
                  ) : act.action === 'MOVE' && act.entityType === 'Deal' ? (
                    <> - Deal <b>{act.entityName || act.entityId}</b> verschoben nach <b>{act.details}</b> von <b>{act.actorName || act.actorUserId}</b></>
                  ) : act.action === 'CREATE' && act.entityType === 'TimeEntry' ? (
                    <> - Zeiteintrag <b>{act.details}</b> erfasst für <b>{act.entityName || act.entityId}</b> von <b>{act.actorName || act.actorUserId}</b></>
                  ) : (
                    <> - {act.action} <b>{act.entityName || act.entityId}</b> von <b>{act.actorName || act.actorUserId}</b></>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}