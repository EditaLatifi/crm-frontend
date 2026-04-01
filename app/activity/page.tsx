"use client";
import React, { useEffect, useState, useCallback } from 'react';
import './activity-mobile.css';
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

interface User { id: string; name: string; email: string; }

const ACTION_ICONS: Record<string, string> = {
  CREATE: '➕', UPDATE: '✏️', DELETE: '🗑️',
  change_stage: '🔄', timer_stop: '⏱️', COMMENT: '💬',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'erstellt', UPDATE: 'aktualisiert', DELETE: 'gelöscht',
  change_stage: 'Phase geändert', timer_stop: 'Zeit gestoppt', COMMENT: 'kommentiert',
};

const ENTITY_LABELS: Record<string, string> = {
  Contact: 'Kontakt', Account: 'Konto', Deal: 'Deal',
  Task: 'Aufgabe', TimeEntry: 'Zeiteintrag', Project: 'Projekt',
};

const SYSTEM_ACTIONS = ['timer_stop'];

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

function ChangeHistory({ changes }: { changes: Record<string, { from: any; to: any }> }) {
  const entries = Object.entries(changes);
  if (entries.length === 0) return null;
  return (
    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {entries.map(([field, { from, to }]) => (
        <div key={field} style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontWeight: 600, color: '#475569' }}>{field}:</span>
          <span style={{ color: '#94a3b8', textDecoration: 'line-through' }}>{from ?? '–'}</span>
          <span style={{ color: '#94a3b8' }}>→</span>
          <span style={{ color: '#16a34a', fontWeight: 600 }}>{to ?? '–'}</span>
        </div>
      ))}
    </div>
  );
}

const PAGE_SIZE = 25;

export default function ActivityFeedPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    api.get('/users').then((data: any) => setUsers(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const fetchActivities = useCallback((p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), pageSize: String(PAGE_SIZE) });
    if (userFilter) params.set('userId', userFilter);
    if (actionFilter) params.set('action', actionFilter);
    if (entityTypeFilter) params.set('entityType', entityTypeFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    api.get(`/activity?${params}`)
      .then((data: any) => {
        setActivities(Array.isArray(data?.data) ? data.data : []);
        setTotal(data?.total ?? 0);
        setLoading(false);
      })
      .catch(() => { setActivities([]); setLoading(false); });
  }, [userFilter, actionFilter, entityTypeFilter, dateFrom, dateTo]);

  useEffect(() => {
    setPage(1);
  }, [userFilter, actionFilter, entityTypeFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchActivities(page);
  }, [page, fetchActivities]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const selStyle: React.CSSProperties = {
    padding: '7px 10px', borderRadius: 8, border: '1.5px solid #d1d5db',
    fontSize: 13, color: '#374151', background: '#fff',
  };
  const inputStyle: React.CSSProperties = { ...selStyle, minWidth: 120 };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div className="activity-header" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>Aktivitäten</h1>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
          {total} Einträge gefunden
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20, padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1.5px solid #e5e7eb' }}>
        {/* User filter */}
        <select value={userFilter} onChange={e => setUserFilter(e.target.value)} style={selStyle}>
          <option value="">Alle Benutzer</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
        </select>

        {/* Action type filter */}
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={selStyle}>
          <option value="">Alle Aktionen</option>
          <option value="CREATE">Erstellt</option>
          <option value="UPDATE">Geändert</option>
          <option value="DELETE">Gelöscht</option>
          <option value="change_stage">Phase geändert</option>
          <option value="SYSTEM">Automatisch</option>
        </select>

        {/* Entity type filter */}
        <select value={entityTypeFilter} onChange={e => setEntityTypeFilter(e.target.value)} style={selStyle}>
          <option value="">Alle Objekte</option>
          {Object.entries(ENTITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        {/* Date range */}
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} title="Von" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} title="Bis" />

        {/* Reset */}
        {(userFilter || actionFilter || entityTypeFilter || dateFrom || dateTo) && (
          <button
            onClick={() => { setUserFilter(''); setActionFilter(''); setEntityTypeFilter(''); setDateFrom(''); setDateTo(''); }}
            style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Filter zurücksetzen
          </button>
        )}
      </div>

      {/* Log list */}
      <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <div style={{ width: 24, height: 24, border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : activities.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>Keine Aktivitäten gefunden</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Passen Sie die Filter an oder warten Sie auf neue Aktionen.</div>
          </div>
        ) : (
          <div>
            {activities.map((act, i) => {
              const actorName = act.actor?.name || act.actor?.email || 'System';
              const icon = ACTION_ICONS[act.action] || '📌';
              const actionLabel = ACTION_LABELS[act.action] || act.action;
              const entityLabel = ENTITY_LABELS[act.entityType] || act.entityType;
              const entityName = getEntityName(act);
              const isSystem = SYSTEM_ACTIONS.includes(act.action);
              const changes = act.payloadJson?.changes as Record<string, { from: any; to: any }> | undefined;

              return (
                <div key={act.id} style={{
                  display: 'flex', gap: 14, padding: '14px 20px',
                  borderBottom: i < activities.length - 1 ? '1px solid #f1f5f9' : 'none',
                  alignItems: 'flex-start',
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: isSystem ? '#f0f9ff' : '#f1f5f9',
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

                    {/* Change history */}
                    {changes && Object.keys(changes).length > 0 && <ChangeHistory changes={changes} />}

                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span>{formatRelative(act.createdAt)}</span>
                      <span style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 4, padding: '0 6px', fontSize: 10, fontWeight: 600, color: '#64748b' }}>
                        {entityLabel}
                      </span>
                      {isSystem && (
                        <span style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 4, padding: '0 6px', fontSize: 10, fontWeight: 600, color: '#0369a1' }}>
                          Automatisch
                        </span>
                      )}
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

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: '7px 16px', borderRadius: 8, border: '1.5px solid #d1d5db', background: page === 1 ? '#f8fafc' : '#fff', color: page === 1 ? '#cbd5e1' : '#374151', fontSize: 13, fontWeight: 600, cursor: page === 1 ? 'default' : 'pointer' }}
          >
            ← Zurück
          </button>
          <span style={{ fontSize: 13, color: '#64748b' }}>
            Seite <b style={{ color: '#1e293b' }}>{page}</b> von <b style={{ color: '#1e293b' }}>{totalPages}</b>
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: '7px 16px', borderRadius: 8, border: '1.5px solid #d1d5db', background: page === totalPages ? '#f8fafc' : '#fff', color: page === totalPages ? '#cbd5e1' : '#374151', fontSize: 13, fontWeight: 600, cursor: page === totalPages ? 'default' : 'pointer' }}
          >
            Weiter →
          </button>
        </div>
      )}
    </div>
  );
}
