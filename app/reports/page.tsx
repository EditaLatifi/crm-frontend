
"use client";

import React, { useEffect, useState } from "react";
import TimeLineChart from "../../components/charts/TimeLineChart";

interface TimeEntry {
  id: string;
  user?: { id: string; name: string };
  userId?: string;
  accountId?: string;
  taskId?: string;
  durationMinutes: number;
  startedAt: string;
  endedAt: string;
  description?: string;
  account?: { id: string; name: string };
  task?: { id: string; title: string };
}

interface UserTotal {
  userId: string;
  name: string;
  totalMinutes: number;
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export default function ReportsPage() {
  const [topUsers, setTopUsers] = useState<UserTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [allEntries, setAllEntries] = useState<TimeEntry[]>([]);
  const [activityData, setActivityData] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });

  useEffect(() => {
    fetch("/api/time-entries")
      .then(res => res.json())
      .then((data: TimeEntry[]) => {
        setAllEntries(data);
        // Top users
        const totals: Record<string, UserTotal> = {};
        data.forEach(entry => {
          const userId = entry.userId || (entry.user && entry.user.id) || "Unknown";
          const name = (entry.user && entry.user.name) || userId;
          if (!totals[userId]) totals[userId] = { userId, name, totalMinutes: 0 };
          totals[userId].totalMinutes += entry.durationMinutes || 0;
        });
        setTopUsers(
          Object.values(totals)
            .sort((a, b) => b.totalMinutes - a.totalMinutes)
            .slice(0, 5)
        );

        // Activity by day (last 7 days)
        const now = new Date();
        const days: string[] = [];
        const values: number[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const label = d.toLocaleDateString(undefined, { weekday: 'short' });
          days.push(label);
          const total = data.filter(e => {
            const entryDate = new Date(e.startedAt);
            return entryDate.toDateString() === d.toDateString();
          }).reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
          values.push(Math.round(total / 60 * 100) / 100); // hours
        }
        setActivityData({ labels: days, values });

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // CSV Export
  function exportCSV() {
    const header = ["User", "Account", "Task", "Start", "End", "Duration (min)", "Description"];
    const rows = allEntries.map(e => [
      (e.user && e.user.name) || e.userId || '',
      (e.account && e.account.name) || e.accountId || '',
      (e.task && e.task.title) || e.taskId || '',
      e.startedAt,
      e.endedAt,
      e.durationMinutes,
      e.description || ''
    ]);
    const csv = [header, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'time-entries.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Dashboard card helpers
  const totalMinutes = allEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const thisWeek = (() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    return allEntries.filter(e => new Date(e.startedAt) >= weekStart);
  })();
  const weekMinutes = thisWeek.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
  const weekHours = Math.floor(weekMinutes / 60);
  const weekMins = weekMinutes % 60;

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: 24 }}>Reports</h1>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
        <DashboardCard title="Total Ziit" value={`${totalHours}h ${totalMins}m`} color="#4f8cff" />
        <DashboardCard title="Die Wuche" value={`${weekHours}h ${weekMins}m`} color="#00c48c" />
        <DashboardCard title="Top Mitglied" value={topUsers[0]?.name || '-'} color="#ffb547" />
        <button onClick={exportCSV} style={{ background: '#0052cc', color: '#fff', border: 'none', borderRadius: 8, padding: '18px 32px', fontWeight: 600, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginLeft: 'auto' }}>CSV exportiere</button>
      </div>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 32 }}>
        <div style={{ flex: 2, minWidth: 340, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Aktivitäts-Report (Letschti 7 Täg)</h2>
          <TimeLineChart data={activityData} />
        </div>
        <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Top 5 Mitglieder nach erfasster Ziit</h2>
          {loading ? (
            <div>Lade...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: "#f6f8fa" }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Total Time</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((user, idx) => (
                  <tr key={user.userId} style={{ background: idx % 2 === 0 ? "#fff" : "#f9fafb" }}>
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{user.name}</td>
                    <td style={tdStyle}>{formatDuration(user.totalMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Top Tasks by Time */}
      <div style={{ marginTop: 48, background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 18 }}>Top 5 Tasks nach Ziit</h2>
        <TopTasksTable entries={allEntries} />
      </div>
    </div>
  );
}

// Table for top 5 tasks by total time
function TopTasksTable({ entries }: { entries: TimeEntry[] }) {
  // Aggregate time by task
  const taskTotals: Record<string, { taskId: string; title: string; totalMinutes: number }> = {};
  entries.forEach(e => {
    const taskId = e.taskId || (e.task && e.task.id) || 'Unknown';
    const title = (e.task && e.task.title) || taskId;
    if (!taskTotals[taskId]) taskTotals[taskId] = { taskId, title, totalMinutes: 0 };
    taskTotals[taskId].totalMinutes += e.durationMinutes || 0;
  });
  const topTasks = Object.values(taskTotals)
    .filter(t => t.taskId !== 'Unknown')
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .slice(0, 5);
  if (topTasks.length === 0) return <div style={{ color: '#888' }}>Kei Task-Daten verfügbar.</div>;
  return (
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
      <thead>
        <tr style={{ background: '#f6f8fa' }}>
          <th style={thStyle}>#</th>
          <th style={thStyle}>Task</th>
          <th style={thStyle}>Total Ziit</th>
        </tr>
      </thead>
      <tbody>
        {topTasks.map((task, idx) => (
          <tr key={task.taskId} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
            <td style={tdStyle}>{idx + 1}</td>
            <td style={{ ...tdStyle, fontWeight: 600 }}>{task.title}</td>
            <td style={tdStyle}>{formatDuration(task.totalMinutes)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DashboardCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: 24, minWidth: 180, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderLeft: `6px solid ${color}` }}>
      <span style={{ color: color, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{title}</span>
      <span style={{ fontSize: 28, fontWeight: 700, color: '#222' }}>{value}</span>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px 18px",
  fontWeight: 700,
  color: "#222",
  borderBottom: "2px solid #e5e7eb",
  textAlign: "left",
  background: "#f6f8fa",
  position: "sticky",
  top: 0,
  zIndex: 1,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 18px",
  borderBottom: "1px solid #f0f1f3",
  color: "#333",
  fontWeight: 400,
  verticalAlign: "top",
  maxWidth: 220,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
