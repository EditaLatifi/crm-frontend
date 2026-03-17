"use client";
import React, { useState, useEffect } from "react";
import TimeEntriesTable from '../../../components/tables/TimeEntriesTable';
import { api } from '../../../src/api/client';
import { useAuth } from '../../../src/auth/AuthProvider';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

interface TimeEntry {
  id: string;
  user?: { id: string; name: string };
  userId?: string;
  accountId?: string;
  taskId?: string;
  task?: { id: string; title: string };
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  description?: string;
}

const PAGE_SIZE = 20;

function TimePageContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get('/time-entries')
      .then((data: any) => {
        const all: TimeEntry[] = Array.isArray(data) ? data : [];
        setEntries(isAdmin ? all : all.filter((e: TimeEntry) => e.userId === user?.id || e.user?.id === user?.id));
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [isAdmin, user?.id]);

  const totalMin = entries.reduce((s, e) => s + (e.durationMinutes || 0), 0);
  const totalH = Math.floor(totalMin / 60);
  const totalM = totalMin % 60;

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const pageEntries = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ padding: 32, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {isAdmin ? 'Zeiterfassung – Alle Benutzer' : 'Meine Zeiterfassung'}
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            {isAdmin ? 'Übersicht aller erfassten Zeiten' : 'Deine erfassten Arbeitsstunden'}
          </p>
        </div>
        {!loading && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gesamt</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb' }}>{totalH}h {totalM}m</div>
          </div>
        )}
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #f1f5f9' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Lade...</div>
        ) : (
          <>
            <TimeEntriesTable entries={pageEntries} showUserColumn={isAdmin} />
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : '#fff', color: page === 1 ? '#94a3b8' : '#1e293b', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: 13 }}
                >
                  ← Zurück
                </button>
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  Seite {page} / {totalPages} ({entries.length} Einträge)
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ padding: '5px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: page === totalPages ? '#f8fafc' : '#fff', color: page === totalPages ? '#94a3b8' : '#1e293b', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: 13 }}
                >
                  Weiter →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function TimePage() {
  return (
    <ProtectedRoute>
      <TimePageContent />
    </ProtectedRoute>
  );
}
