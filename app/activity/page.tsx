
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
    fetch('/api/activity?limit=20')
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
          <div style={{ color: '#888', fontSize: 14 }}>Lade...</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {activities.length === 0 ? (
              <li style={{ color: '#888', fontSize: 14 }}>Kei Aktivität gfunde.</li>
            ) : (
              activities.map(act => (
                <li key={act.id} style={{ marginBottom: 20, fontSize: 15, color: '#23272f' }}>
                  <span style={{ fontWeight: 700 }}>{formatTime(act.createdAt)}</span>
                  {act.action === 'COMMENT' ? (
                    <> - Kommentar vo <b>{act.actorName || act.actorUserId}</b> hinzugefügt</>
                  ) : act.action === 'UPDATE' && act.entityType === 'Task' ? (
                    <> - Task <b>{act.entityName || act.entityId}</b> aktualisiert vo <b>{act.actorName || act.actorUserId}</b></>
                  ) : act.action === 'COMPLETE' && act.entityType === 'Task' ? (
                    <> - Task <b>{act.entityName || act.entityId}</b> als erledigt markiert vo <b>{act.actorName || act.actorUserId}</b></>
                  ) : act.action === 'UPDATE' && act.entityType === 'Deal' ? (
                    <> - Deal <b>{act.entityName || act.entityId}</b> aktualisiert vo <b>{act.actorName || act.actorUserId}</b></>
                  ) : act.action === 'MOVE' && act.entityType === 'Deal' ? (
                    <> - Deal <b>{act.entityName || act.entityId}</b> verschobe uf <b>{act.details}</b> vo <b>{act.actorName || act.actorUserId}</b></>
                  ) : act.action === 'CREATE' && act.entityType === 'TimeEntry' ? (
                    <> - Ziit-Eitrag <b>{act.details}</b> erfasst uf <b>{act.entityName || act.entityId}</b> vo <b>{act.actorName || act.actorUserId}</b></>
                  ) : (
                    <> - {act.action} <b>{act.entityName || act.entityId}</b> vo <b>{act.actorName || act.actorUserId}</b></>
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