"use client";
import { useEffect, useState } from "react";
import './reports-mobile.css';
import TimeLineChart from "../../components/charts/TimeLineChart";
import { api } from "../../src/api/client";

interface TimeEntry {
  id: string; userId?: string; user?: { id: string; name: string };
  accountId?: string; account?: { id: string; name: string };
  taskId?: string; task?: { id: string; title: string };
  durationMinutes: number; startedAt: string; endedAt: string; description?: string;
}

function fmt(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '20px 24px', flex: 1, minWidth: 160, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#1e293b' }}>{value}</div>
    </div>
  );
}

export default function ReportsPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'all'>('month');

  useEffect(() => {
    Promise.all([
      api.get('/time-entries').catch(() => []),
      api.get('/deals').catch(() => []),
      api.get('/deals/deal-stages').catch(() => []),
    ]).then(([timeData, dealData, stageData]) => {
      setEntries(Array.isArray(timeData) ? timeData : []);
      setDeals(Array.isArray(dealData) ? dealData : []);
      setStages(Array.isArray(stageData) ? stageData : []);
      setLoading(false);
    });
  }, []);

  // Filter entries by date range
  const filtered = entries.filter((e) => {
    const d = new Date(e.startedAt);
    const now = new Date();
    if (dateRange === 'week') { const s = new Date(now); s.setDate(now.getDate() - 7); return d >= s; }
    if (dateRange === 'month') { const s = new Date(now); s.setMonth(now.getMonth() - 1); return d >= s; }
    if (dateRange === 'quarter') { const s = new Date(now); s.setMonth(now.getMonth() - 3); return d >= s; }
    return true;
  });

  // Time chart (last 7 days)
  useEffect(() => {
    const now = new Date();
    const days: string[] = [];
    const vals: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString('de-CH', { weekday: 'short' });
      days.push(label);
      const total = filtered.filter((e) => new Date(e.startedAt).toDateString() === d.toDateString())
        .reduce((s, e) => s + (e.durationMinutes || 0), 0);
      vals.push(Math.round(total / 60 * 100) / 100);
    }
    setActivityData({ labels: days, values: vals });
  }, [filtered.length, dateRange]);

  // Top users
  const userTotals: Record<string, { name: string; total: number }> = {};
  filtered.forEach((e) => {
    const id = e.userId || e.user?.id || 'Unbekannt';
    const name = e.user?.name || id;
    if (!userTotals[id]) userTotals[id] = { name, total: 0 };
    userTotals[id].total += e.durationMinutes || 0;
  });
  const topUsers = Object.values(userTotals).sort((a, b) => b.total - a.total).slice(0, 5);

  // Top tasks
  const taskTotals: Record<string, { title: string; total: number }> = {};
  filtered.forEach((e) => {
    if (!e.taskId && !e.task) return;
    const id = e.taskId || e.task?.id || 'Unbekannt';
    const title = e.task?.title || id;
    if (!taskTotals[id]) taskTotals[id] = { title, total: 0 };
    taskTotals[id].total += e.durationMinutes || 0;
  });
  const topTasks = Object.values(taskTotals).sort((a, b) => b.total - a.total).slice(0, 5);

  // Deal analytics
  const stageMap = Object.fromEntries(stages.map((s: any) => [s.id, s]));
  const wonDeals = deals.filter((d) => stageMap[d.stageId]?.isWon);
  const lostDeals = deals.filter((d) => stageMap[d.stageId]?.isLost);
  const openDeals = deals.filter((d) => !stageMap[d.stageId]?.isWon && !stageMap[d.stageId]?.isLost);
  const pipelineValue = openDeals.reduce((s, d) => s + (d.amount || 0), 0);
  const revenueWon = wonDeals.reduce((s, d) => s + (d.amount || 0), 0);
  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;

  // Deals by stage for funnel
  const dealsByStage = stages.map((s: any) => ({
    name: s.name,
    count: deals.filter((d) => d.stageId === s.id).length,
    value: deals.filter((d) => d.stageId === s.id).reduce((sum, d) => sum + (d.amount || 0), 0),
    isWon: s.isWon, isLost: s.isLost,
  }));

  // Summary stats
  const totalMinutes = filtered.reduce((s, e) => s + (e.durationMinutes || 0), 0);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekMins = entries.filter((e) => new Date(e.startedAt) >= weekStart).reduce((s, e) => s + (e.durationMinutes || 0), 0);

  // CSV Export
  function exportCSV() {
    const header = ['Benutzer', 'Konto', 'Aufgabe', 'Start', 'Ende', 'Dauer (min)', 'Beschreibung'];
    const rows = filtered.map((e) => [
      e.user?.name || e.userId || '',
      e.account?.name || e.accountId || '',
      e.task?.title || e.taskId || '',
      e.startedAt, e.endedAt, e.durationMinutes, e.description || '',
    ]);
    const csv = [header, ...rows].map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'zeiterfassung.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const thS: React.CSSProperties = { padding: '12px 16px', fontWeight: 700, color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e5e7eb', textAlign: 'left', background: '#f8fafc' };
  const tdS: React.CSSProperties = { padding: '11px 16px', borderBottom: '1px solid #f1f5f9', color: '#1e293b', fontSize: 13 };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div className="reports-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0 }}>Berichte</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Date range selector */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
            {[['week', '7 Tage'], ['month', '30 Tage'], ['quarter', 'Quartal'], ['all', 'Alle']] .map(([k, label]) => (
              <button key={k} onClick={() => setDateRange(k as any)} style={{
                padding: '6px 12px', borderRadius: 6, border: 'none',
                background: dateRange === k ? '#fff' : 'transparent',
                color: dateRange === k ? '#2563eb' : '#64748b',
                fontWeight: dateRange === k ? 700 : 500, fontSize: 12, cursor: 'pointer',
                boxShadow: dateRange === k ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
              }}>{label}</button>
            ))}
          </div>
          <button onClick={exportCSV} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            CSV exportieren
          </button>
        </div>
      </div>

      {/* Time KPIs */}
      <div className="reports-kpi-row" style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard title="Gesamtzeit (gefiltert)" value={fmt(totalMinutes)} color="#2563eb" />
        <StatCard title="Diese Woche" value={fmt(weekMins)} color="#0891b2" />
        <StatCard title="Top Mitglied" value={topUsers[0]?.name || '-'} color="#7c3aed" />
        <StatCard title="Einträge" value={String(filtered.length)} color="#64748b" />
      </div>

      {/* Deal Revenue KPIs */}
      <div className="reports-kpi-row" style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard title="Pipeline-Wert" value={`${pipelineValue.toLocaleString('de-CH')} CHF`} color="#7c3aed" />
        <StatCard title="Gewonnener Umsatz" value={`${revenueWon.toLocaleString('de-CH')} CHF`} color="#16a34a" />
        <StatCard title="Gewinnrate" value={`${winRate}%`} color="#16a34a" />
        <StatCard title="Deals total" value={String(deals.length)} color="#64748b" />
      </div>

      {/* Charts row */}
      <div className="reports-charts-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Aktivitäts-Report (Letzte 7 Tage)</div>
          <TimeLineChart data={activityData} />
        </div>
        {/* Deal funnel */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '20px 24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Deal-Trichter nach Phase</div>
          {loading ? <div style={{ color: '#94a3b8' }}>Lade...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dealsByStage.filter((s) => s.count > 0).map((s, i) => {
                const maxCount = Math.max(...dealsByStage.map((x) => x.count), 1);
                const pct = Math.round((s.count / maxCount) * 100);
                const color = s.isWon ? '#16a34a' : s.isLost ? '#dc2626' : '#2563eb';
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</span>
                      <span>{s.count} Deals · {s.value.toLocaleString('de-CH')} CHF</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tables row */}
      <div className="reports-tables-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Top users */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
            Top 5 Mitglieder nach erfasster Zeit
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={thS}>#</th><th style={thS}>Name</th><th style={thS}>Gesamtzeit</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={3} style={{ ...tdS, textAlign: 'center', color: '#94a3b8' }}>Lade...</td></tr>
                : topUsers.length === 0 ? <tr><td colSpan={3} style={{ ...tdS, textAlign: 'center', color: '#94a3b8' }}>Keine Daten</td></tr>
                : topUsers.map((u, i) => (
                  <tr key={i}>
                    <td style={tdS}><span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 5, padding: '1px 7px', fontWeight: 700, fontSize: 12 }}>{i + 1}</span></td>
                    <td style={{ ...tdS, fontWeight: 600 }}>{u.name}</td>
                    <td style={tdS}>{fmt(u.total)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Top tasks */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
            Top 5 Aufgaben nach Zeit
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={thS}>#</th><th style={thS}>Aufgabe</th><th style={thS}>Gesamtzeit</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={3} style={{ ...tdS, textAlign: 'center', color: '#94a3b8' }}>Lade...</td></tr>
                : topTasks.length === 0 ? <tr><td colSpan={3} style={{ ...tdS, textAlign: 'center', color: '#94a3b8' }}>Keine Daten</td></tr>
                : topTasks.map((t, i) => (
                  <tr key={i}>
                    <td style={tdS}><span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 5, padding: '1px 7px', fontWeight: 700, fontSize: 12 }}>{i + 1}</span></td>
                    <td style={{ ...tdS, fontWeight: 600 }}>{t.title}</td>
                    <td style={tdS}>{fmt(t.total)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
