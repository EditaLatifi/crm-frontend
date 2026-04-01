"use client";
import { useEffect, useState, useMemo } from "react";
import './reports-mobile.css';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, ArcElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { api } from "../../src/api/client";
import { formatCHF } from "../../src/lib/formatCurrency";

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, ArcElement,
  Title, Tooltip, Legend, Filler,
);

/* ─── Types ─── */
interface TimeEntry {
  id: string; userId?: string; user?: { id: string; name: string };
  accountId?: string; account?: { id: string; name: string };
  taskId?: string; task?: { id: string; title: string };
  projectId?: string; project?: { id: string; name: string };
  durationMinutes: number; startedAt: string; endedAt: string; description?: string;
}
interface TaskItem {
  id: string; title: string; status: string;
  assignedToUserId?: string; assignee?: { id: string; name: string };
  createdAt: string;
}
interface ProjectItem {
  id: string; name: string; budget?: number; currency?: string;
  phases?: { id: string; name: string; status: string; order: number }[];
}

/* ─── Helpers ─── */
const COLORS = ['#2563eb','#16a34a','#7c3aed','#ea580c','#0891b2','#db2777','#eab308','#64748b','#06b6d4','#f43f5e'];
function fmt(min: number) { const h = Math.floor(min / 60); const m = min % 60; return `${h}h ${m}m`; }

function filterByRange(dateStr: string, range: string) {
  const d = new Date(dateStr);
  const now = new Date();
  if (range === 'week')    { const s = new Date(now); s.setDate(now.getDate() - 7); return d >= s; }
  if (range === 'month')   { const s = new Date(now); s.setMonth(now.getMonth() - 1); return d >= s; }
  if (range === 'quarter') { const s = new Date(now); s.setMonth(now.getMonth() - 3); return d >= s; }
  return true;
}

const Y_AXIS_BASE = { beginAtZero: true, min: 0 } as const;

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '20px 24px' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '20px 24px', flex: 1, minWidth: 160, borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#1e293b' }}>{value}</div>
    </div>
  );
}

/* ─── Page ─── */
export default function ReportsPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'all'>('month');

  useEffect(() => {
    Promise.all([
      api.get('/time-entries').catch(() => []),
      api.get('/deals').catch(() => []),
      api.get('/deals/deal-stages').catch(() => []),
      api.get('/tasks').catch(() => []),
      api.get('/projects').catch(() => []),
    ]).then(([timeData, dealData, stageData, taskData, projData]) => {
      setEntries(Array.isArray(timeData) ? timeData : []);
      setDeals(Array.isArray(dealData) ? dealData : []);
      setStages(Array.isArray(stageData) ? stageData : []);
      setTasks(Array.isArray(taskData) ? taskData : []);
      setProjects(Array.isArray(projData) ? projData : []);
      setLoading(false);
    });
  }, []);

  /* ─ Filtered data ─ */
  const fe = useMemo(() => entries.filter(e => filterByRange(e.startedAt, dateRange)), [entries, dateRange]);
  const fd = useMemo(() => deals.filter(d => filterByRange(d.createdAt, dateRange)), [deals, dateRange]);
  const ft = useMemo(() => tasks.filter(t => filterByRange(t.createdAt, dateRange)), [tasks, dateRange]);

  /* ─ KPIs ─ */
  const totalMinutes = fe.reduce((s, e) => s + (e.durationMinutes || 0), 0);
  const stageMap = Object.fromEntries(stages.map((s: any) => [s.id, s]));
  const wonDeals = deals.filter(d => stageMap[d.stageId]?.isWon);
  const openDeals = deals.filter(d => !stageMap[d.stageId]?.isWon && !stageMap[d.stageId]?.isLost);
  const pipelineValue = openDeals.reduce((s, d) => s + (d.amount || 0), 0);
  const revenueWon = wonDeals.reduce((s, d) => s + (d.amount || 0), 0);
  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;

  /* ─ 1. Deal-Trichter (existing) ─ */
  const dealsByStage = useMemo(() => stages.map((s: any) => ({
    name: s.name,
    count: deals.filter(d => d.stageId === s.id).length,
    value: deals.filter(d => d.stageId === s.id).reduce((sum: number, d: any) => sum + (d.amount || 0), 0),
    isWon: s.isWon, isLost: s.isLost,
  })), [deals, stages]);

  /* ─ 2. Zeiterfassung pro Mitarbeiter (Bar) ─ */
  const userTimeChart = useMemo(() => {
    const map: Record<string, { name: string; hours: number }> = {};
    fe.forEach(e => {
      const id = e.userId || e.user?.id || '?';
      const name = e.user?.name || id;
      if (!map[id]) map[id] = { name, hours: 0 };
      map[id].hours += (e.durationMinutes || 0) / 60;
    });
    const sorted = Object.values(map).sort((a, b) => b.hours - a.hours).slice(0, 10);
    return {
      labels: sorted.map(u => u.name),
      datasets: [{
        label: 'Stunden',
        data: sorted.map(u => Math.round(u.hours * 10) / 10),
        backgroundColor: '#2563eb',
        borderRadius: 4,
      }],
    };
  }, [fe]);

  /* ─ 3. Zeiterfassung pro Konto/Projekt (Bar) ─ */
  const accountTimeChart = useMemo(() => {
    const map: Record<string, { name: string; hours: number }> = {};
    fe.forEach(e => {
      const name = e.project?.name || e.account?.name || 'Ohne Zuordnung';
      const key = e.projectId || e.accountId || '_none';
      if (!map[key]) map[key] = { name, hours: 0 };
      map[key].hours += (e.durationMinutes || 0) / 60;
    });
    const sorted = Object.values(map).sort((a, b) => b.hours - a.hours).slice(0, 10);
    return {
      labels: sorted.map(a => a.name.length > 25 ? a.name.slice(0, 22) + '…' : a.name),
      datasets: [{
        label: 'Stunden',
        data: sorted.map(a => Math.round(a.hours * 10) / 10),
        backgroundColor: '#7c3aed',
        borderRadius: 4,
      }],
    };
  }, [fe]);

  /* ─ 4. Zeiterfassung pro Leistungsphase / SIA-Phasen (Pie) ─ */
  const phaseTimeChart = useMemo(() => {
    const projMap: Record<string, ProjectItem> = {};
    projects.forEach(p => { projMap[p.id] = p; });

    const phaseHours: Record<string, number> = {};
    fe.forEach(e => {
      let phaseName = 'Ohne Projekt';
      if (e.projectId && projMap[e.projectId]) {
        const proj = projMap[e.projectId];
        const phases = (proj.phases || []).sort((a, b) => a.order - b.order);
        const active = phases.find(p => p.status === 'IN_PROGRESS') || [...phases].reverse().find(p => p.status === 'COMPLETED') || phases[0];
        phaseName = active?.name || 'Unbekannt';
      }
      phaseHours[phaseName] = (phaseHours[phaseName] || 0) + (e.durationMinutes || 0) / 60;
    });
    const labels = Object.keys(phaseHours);
    const values = Object.values(phaseHours).map(v => Math.round(v * 10) / 10);
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: COLORS.slice(0, labels.length),
        borderWidth: 1,
        borderColor: '#fff',
      }],
    };
  }, [fe, projects]);

  /* ─ 5. Offene vs. erledigte Tasks pro Mitarbeiter (Bar) ─ */
  const taskStatusChart = useMemo(() => {
    const map: Record<string, { name: string; open: number; done: number }> = {};
    ft.forEach(t => {
      const name = t.assignee?.name || 'Nicht zugewiesen';
      const key = t.assignedToUserId || '_none';
      if (!map[key]) map[key] = { name, open: 0, done: 0 };
      if (t.status === 'DONE') map[key].done += 1;
      else map[key].open += 1;
    });
    const sorted = Object.values(map).sort((a, b) => (b.open + b.done) - (a.open + a.done)).slice(0, 10);
    return {
      labels: sorted.map(u => u.name),
      datasets: [
        { label: 'Offen / In Arbeit', data: sorted.map(u => u.open), backgroundColor: '#eab308', borderRadius: 4 },
        { label: 'Erledigt', data: sorted.map(u => u.done), backgroundColor: '#16a34a', borderRadius: 4 },
      ],
    };
  }, [ft]);

  /* ─ 6. Budgetauslastung pro Projekt (Budget vs. Ist-Stunden) ─ */
  const budgetChart = useMemo(() => {
    const projHours: Record<string, number> = {};
    fe.forEach(e => {
      if (e.projectId) projHours[e.projectId] = (projHours[e.projectId] || 0) + (e.durationMinutes || 0) / 60;
    });
    const withBudget = projects.filter(p => p.budget && p.budget > 0).slice(0, 10);
    return {
      labels: withBudget.map(p => p.name.length > 20 ? p.name.slice(0, 17) + '…' : p.name),
      datasets: [
        { label: 'Budget (CHF)', data: withBudget.map(p => Math.round(p.budget || 0)), backgroundColor: '#2563eb', borderRadius: 4 },
        { label: 'Ist-Stunden (h)', data: withBudget.map(p => Math.round((projHours[p.id] || 0) * 10) / 10), backgroundColor: '#ea580c', borderRadius: 4 },
      ],
    };
  }, [fe, projects]);

  /* ─ 7. Deals nach Phase über Zeit (Line) ─ */
  const dealPipelineChart = useMemo(() => {
    if (fd.length === 0 || stages.length === 0) return null;

    // Determine time buckets based on dateRange
    const now = new Date();
    const buckets: { label: string; start: Date; end: Date }[] = [];
    if (dateRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(now.getDate() - i);
        const next = new Date(d); next.setDate(d.getDate() + 1);
        buckets.push({ label: d.toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric' }), start: new Date(d.setHours(0,0,0,0)), end: new Date(next.setHours(0,0,0,0)) });
      }
    } else {
      const months = dateRange === 'month' ? 4 : dateRange === 'quarter' ? 6 : 12;
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        buckets.push({ label: d.toLocaleDateString('de-CH', { month: 'short', year: '2-digit' }), start: d, end });
      }
    }

    const activeStages = stages.filter((s: any) => !s.isLost);
    const datasets = activeStages.map((stage: any, idx: number) => ({
      label: stage.name,
      data: buckets.map(b => fd.filter(d => d.stageId === stage.id && new Date(d.createdAt) >= b.start && new Date(d.createdAt) < b.end).length),
      borderColor: COLORS[idx % COLORS.length],
      backgroundColor: COLORS[idx % COLORS.length] + '22',
      tension: 0.3,
      fill: false,
    }));

    return {
      labels: buckets.map(b => b.label),
      datasets,
    };
  }, [fd, stages, dateRange]);

  /* ─ CSV Export ─ */
  function exportCSV() {
    const header = ['Benutzer', 'Konto', 'Projekt', 'Aufgabe', 'Start', 'Ende', 'Dauer (min)', 'Beschreibung'];
    const rows = fe.map(e => [
      e.user?.name || '', e.account?.name || '', e.project?.name || '',
      e.task?.title || '', e.startedAt, e.endedAt, e.durationMinutes, e.description || '',
    ]);
    const csv = [header, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `berichte_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  /* ─ Common chart options ─ */
  const barOpts = (horizontal = false): any => ({
    responsive: true, maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    plugins: { legend: { display: false } },
    scales: { x: { ...Y_AXIS_BASE }, y: { ...Y_AXIS_BASE } },
  });

  const groupedBarOpts: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 12, font: { size: 11 } } } },
    scales: { x: { ...Y_AXIS_BASE }, y: { ...Y_AXIS_BASE } },
  };

  const lineOpts: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 12, font: { size: 11 } } } },
    scales: { x: {}, y: { ...Y_AXIS_BASE } },
  };

  const pieOpts: any = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right' as const, labels: { boxWidth: 12, font: { size: 11 }, padding: 10 } } },
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div className="reports-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: 0 }}>Berichte</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
            {([['week', '7 Tage'], ['month', '30 Tage'], ['quarter', 'Quartal'], ['all', 'Alle']] as const).map(([k, label]) => (
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

      {/* KPI cards */}
      <div className="reports-kpi-row" style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <StatCard title="Gesamtzeit (gefiltert)" value={fmt(totalMinutes)} color="#2563eb" />
        <StatCard title="Einträge" value={String(fe.length)} color="#64748b" />
        <StatCard title="Pipeline-Wert" value={formatCHF(pipelineValue)} color="#7c3aed" />
        <StatCard title="Gewonnener Umsatz" value={formatCHF(revenueWon)} color="#16a34a" />
        <StatCard title="Gewinnrate" value={`${winRate}%`} color="#16a34a" />
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontSize: 15 }}>Lade Berichte…</div>
      ) : (
        <>
          {/* Row 1: Deal-Trichter + Deals über Zeit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <ChartCard title="Deal-Trichter nach Phase">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dealsByStage.filter(s => s.count > 0).map((s, i) => {
                  const maxCount = Math.max(...dealsByStage.map(x => x.count), 1);
                  const pct = Math.round((s.count / maxCount) * 100);
                  const color = s.isWon ? '#16a34a' : s.isLost ? '#dc2626' : '#2563eb';
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 3 }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</span>
                        <span>{s.count} Deals · {formatCHF(Math.round(s.value))}</span>
                      </div>
                      <div style={{ background: '#f1f5f9', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6 }} />
                      </div>
                    </div>
                  );
                })}
                {dealsByStage.filter(s => s.count > 0).length === 0 && (
                  <div style={{ color: '#94a3b8', fontSize: 13, padding: 20, textAlign: 'center' }}>Keine Deals vorhanden</div>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Deals nach Phase über Zeit">
              <div style={{ height: 280 }}>
                {dealPipelineChart ? (
                  <Line data={dealPipelineChart} options={lineOpts} />
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: 13, padding: 40, textAlign: 'center' }}>Keine Daten</div>
                )}
              </div>
            </ChartCard>
          </div>

          {/* Row 2: Zeit pro Mitarbeiter + Zeit pro Konto/Projekt */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <ChartCard title="Zeiterfassung pro Mitarbeiter">
              <div style={{ height: 280 }}>
                {userTimeChart.labels.length > 0 ? (
                  <Bar data={userTimeChart} options={barOpts()} />
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: 13, padding: 40, textAlign: 'center' }}>Keine Zeiteinträge</div>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Zeiterfassung pro Konto / Projekt">
              <div style={{ height: 280 }}>
                {accountTimeChart.labels.length > 0 ? (
                  <Bar data={accountTimeChart} options={barOpts()} />
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: 13, padding: 40, textAlign: 'center' }}>Keine Zeiteinträge</div>
                )}
              </div>
            </ChartCard>
          </div>

          {/* Row 3: Leistungsphase (Pie) + Offene vs erledigte Tasks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <ChartCard title="Zeiterfassung pro Leistungsphase (SIA)">
              <div style={{ height: 280 }}>
                {phaseTimeChart.labels.length > 0 ? (
                  <Pie data={phaseTimeChart} options={pieOpts} />
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: 13, padding: 40, textAlign: 'center' }}>Keine Projektdaten</div>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Offene vs. erledigte Tasks pro Mitarbeiter">
              <div style={{ height: 280 }}>
                {taskStatusChart.labels.length > 0 ? (
                  <Bar data={taskStatusChart} options={groupedBarOpts} />
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: 13, padding: 40, textAlign: 'center' }}>Keine Tasks</div>
                )}
              </div>
            </ChartCard>
          </div>

          {/* Row 4: Budgetauslastung (full width) */}
          <div style={{ marginBottom: 24 }}>
            <ChartCard title="Budgetauslastung pro Projekt (Budget vs. Ist-Stunden)">
              <div style={{ height: 300 }}>
                {budgetChart.labels.length > 0 ? (
                  <Bar data={budgetChart} options={groupedBarOpts} />
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: 13, padding: 40, textAlign: 'center' }}>Keine Projekte mit Budget vorhanden</div>
                )}
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
