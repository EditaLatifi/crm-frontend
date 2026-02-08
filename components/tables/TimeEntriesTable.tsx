
"use client";
import { useEffect, useState } from 'react';

interface TimeEntry {
  id: string;
  user?: { id: string; name: string };
  userId?: string;
  accountId?: string;
  account?: { id: string; name: string };
  taskId?: string;
  task?: { id: string; title: string };
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  description?: string;
}

interface TimeEntriesTableProps {
  entries?: TimeEntry[];
  showUserColumn?: boolean;
}


export default function TimeEntriesTable({ entries, showUserColumn }: TimeEntriesTableProps) {
  const [localEntries, setLocalEntries] = useState<TimeEntry[]>(entries || []);

  useEffect(() => {
    setLocalEntries(entries || []);
  }, [entries]);

  return (
    <div style={{ overflowX: 'auto', marginTop: 16 }}>
      <table style={{
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        fontFamily: 'inherit',
        fontSize: 16,
        overflow: 'hidden',
      }}>
        <thead>
          <tr style={{ background: '#f6f8fa' }}>
            {showUserColumn && <th style={thStyle}>User</th>}
            <th style={thStyle}>Account</th>
            <th style={thStyle}>Task</th>
            <th style={thStyle}>Start</th>
            <th style={thStyle}>End</th>
            <th style={thStyle}>Duration (min)</th>
            <th style={thStyle}>Description</th>
          </tr>
        </thead>
        <tbody>
          {localEntries.length === 0 ? (
            <tr>
              <td colSpan={showUserColumn ? 7 : 6} style={{ textAlign: 'center', color: '#888', padding: 24 }}>
                No time entries found.
              </td>
            </tr>
          ) : (
            localEntries.map((e: TimeEntry, idx) => (
              <tr key={e.id || Math.random()} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb', transition: 'background 0.2s' }}>
                {showUserColumn && <td style={tdStyle} data-label="User">{(e.user && e.user.name) || e.userId || '—'}</td>}
                <td style={tdStyle} data-label="Account">{(e.account && e.account.name) || e.accountId || '—'}</td>
                <td style={tdStyle} data-label="Task">{(e.task && e.task.title) || e.taskId || '—'}</td>
                <td style={tdStyle} data-label="Start">{e.startedAt ? new Date(e.startedAt).toLocaleString() : '—'}</td>
                <td style={tdStyle} data-label="End">{e.endedAt ? new Date(e.endedAt).toLocaleString() : '—'}</td>
                <td style={tdStyle} data-label="Duration (min)">{typeof e.durationMinutes === 'number' ? e.durationMinutes : '—'}</td>
                <td style={tdStyle} data-label="Description">{e.description || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

}

const thStyle: React.CSSProperties = {
  padding: '14px 18px',
  fontWeight: 700,
  color: '#222',
  borderBottom: '2px solid #e5e7eb',
  textAlign: 'left',
  background: '#f6f8fa',
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

const tdStyle: React.CSSProperties = {
  padding: '12px 18px',
  borderBottom: '1px solid #f0f1f3',
  color: '#333',
  fontWeight: 400,
  verticalAlign: 'top',
  maxWidth: 220,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};
