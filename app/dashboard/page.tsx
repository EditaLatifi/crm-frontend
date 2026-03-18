"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/auth/AuthProvider';
import { api } from '../../src/api/client';
import Link from 'next/link';
import TasksBarChart from '../../components/charts/TasksBarChart';
import DealsPieChart from '../../components/charts/DealsPieChart';
import TimeLineChart from '../../components/charts/TimeLineChart';
import DealForecastWidget from '../../components/deals/DealForecastWidget';
import {
  FiCheckSquare, FiBriefcase, FiTrendingUp, FiClock,
  FiAlertTriangle, FiArrowRight, FiFileText, FiDollarSign,
} from 'react-icons/fi';
import './dashboard-desktop.css';
import './dashboard-mobile.css';

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Offen', IN_PROGRESS: 'In Bearbeitung', DONE: 'Erledigt',
};
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  OPEN:        { bg: '#f1f5f9', text: '#64748b' },
  IN_PROGRESS: { bg: '#eff6ff', text: '#2563eb' },
  DONE:        { bg: '#f0fdf4', text: '#16a34a' },
};
const PRIORITY_LABELS: Record<string, string> = {
  HIGH: 'Wichtig', MEDIUM: 'Mittel', LOW: 'Niedrig',
};
const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  HIGH:   { bg: '#fef2f2', text: '#dc2626' },
  MEDIUM: { bg: '#fffbeb', text: '#d97706' },
  LOW:    { bg: '#f8fafc', text: '#64748b' },
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'erstellt', UPDATE: 'aktualisiert', DELETE: 'gelöscht',
  COMMENT: 'kommentiert', change_stage: 'Phase geändert', timer_stop: 'Zeit gestoppt',
};

function StatCard({
  label, value, sub, subAlert, color, icon: Icon,
}: {
  label: string; value: string | number; sub?: string; subAlert?: boolean;
  color: string; icon: React.ElementType;
}) {
  return (
    <div style={{
      flex: 1, minWidth: 180,
      background: '#fff',
      borderRadius: 14,
      padding: '20px 22px',
      boxShadow: '0 1px 4px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
      border: '1px solid #f1f5f9',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: color + '15',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: subAlert ? '#dc2626' : '#64748b', fontWeight: subAlert ? 600 : 400 }}>
          {subAlert && <FiAlertTriangle size={11} />}
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, linkHref, linkLabel, children }: {
  title: string; linkHref?: string; linkLabel?: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)',
      border: '1px solid #f1f5f9',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{title}</span>
        {linkHref && (
          <Link href={linkHref} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
            {linkLabel || 'Alle anzeigen'} <FiArrowRight size={12} />
          </Link>
        )}
      </div>
      <div style={{ padding: '4px 0' }}>{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [overduePermits, setOverduePermits] = useState<any[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<any[]>([]);
  const [tasksChart, setTasksChart] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  const [dealsChart, setDealsChart] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  const [timeChart, setTimeChart] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get('/tasks').catch(() => []),
      api.get('/deals').catch(() => []),
      api.get('/deals/deal-stages').catch(() => []),
      api.get('/activity').catch(() => []),
      api.get('/time-entries').catch(() => []),
      api.get('/permits').catch(() => []),
      api.get('/budget/alerts').catch(() => []),
    ]).then(([tasksData, dealsData, stagesData, actData, timeData, permitsData, budgetAlertsData]) => {
      const taskList = Array.isArray(tasksData) ? tasksData : [];
      const dealList = Array.isArray(dealsData) ? dealsData : [];
      const stageList = Array.isArray(stagesData) ? stagesData : [];
      const actList = Array.isArray(actData) ? actData : [];
      const timeList = Array.isArray(timeData) ? timeData : [];
      const permitList = Array.isArray(permitsData) ? permitsData : [];
      const budgetList = Array.isArray(budgetAlertsData) ? budgetAlertsData : [];

      const terminalStatuses = ['BEWILLIGT', 'ABGELEHNT', 'ZURUECKGEZOGEN'];
      setOverduePermits(permitList.filter((p: any) =>
        p.expectedDecisionAt && new Date(p.expectedDecisionAt) < new Date() && !terminalStatuses.includes(p.status)
      ).slice(0, 5));
      setBudgetAlerts(budgetList);

      setTasks(taskList);
      setDeals(dealList);
      setStages(stageList);
      setActivities(actList);
      setTimeEntries(timeList);

      // Tasks chart with German labels
      const statusMap: Record<string, number> = {};
      taskList.forEach((t: any) => {
        const label = STATUS_LABELS[t.status] || t.status;
        statusMap[label] = (statusMap[label] || 0) + 1;
      });
      setTasksChart({ labels: Object.keys(statusMap), values: Object.values(statusMap) });

      // Deals chart by stage name
      const stageNameMap = Object.fromEntries(stageList.map((s: any) => [s.id, s.name]));
      const stageCountMap: Record<string, number> = {};
      dealList.forEach((d: any) => {
        const name = stageNameMap[d.stageId] || 'Unbekannt';
        stageCountMap[name] = (stageCountMap[name] || 0) + 1;
      });
      setDealsChart({ labels: Object.keys(stageCountMap), values: Object.values(stageCountMap) });

      // Time chart (last 7 days)
      const now = new Date();
      const days: string[] = [];
      const vals: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric' });
        days.push(label);
        const dayMins = timeList
          .filter((e: any) => new Date(e.startedAt).toDateString() === d.toDateString())
          .reduce((s: number, e: any) => s + (e.durationMinutes || 0), 0);
        vals.push(Math.round(dayMins / 60 * 10) / 10);
      }
      setTimeChart({ labels: days, values: vals });
      setDataLoading(false);
    });
  }, [user]);

  // Derived metrics
  const activeTasks = tasks.filter((t) => t.status !== 'DONE');
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE');
  const openDeals = deals.filter((d) => { const s = stages.find((s: any) => s.id === d.stageId); return s && !s.isWon && !s.isLost; });
  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
  const wonDeals = deals.filter((d) => stages.find((s: any) => s.id === d.stageId)?.isWon);
  const revenueWon = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekMins = timeEntries
    .filter((e) => new Date(e.startedAt) >= weekStart)
    .reduce((s, e) => s + (e.durationMinutes || 0), 0);
  const weekHours = Math.round(weekMins / 60 * 10) / 10;

  const upcoming = tasks
    .filter((t) => t.dueDate && t.status !== 'DONE')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 6);

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return 'Guten Morgen';
    if (h < 18) return 'Guten Tag';
    return 'Guten Abend';
  })();

  if (loading || dataLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="dashboard-responsive" style={{ padding: '28px 32px 40px', maxWidth: 1400, margin: '0 auto' }}>

      {/* Header */}
      <div className="dash-header" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        borderRadius: 18, padding: '28px 32px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: '#fff',
      }}>
        <div>
          <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>
            {now.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: '#fff' }}>
            {greeting}, {user?.name || 'Admin'} 👋
          </h1>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            {activeTasks.length} offene Aufgaben · {openDeals.length} Deals in der Pipeline
          </div>
        </div>
        <div className="dash-header-badge" style={{ display: 'flex', gap: 12 }}>
          {overdueTasks.length > 0 && (
            <Link href="/tasks" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10, padding: '10px 16px',
              }}>
                <FiAlertTriangle size={16} color="#f87171" />
                <span style={{ color: '#f87171', fontSize: 13, fontWeight: 600 }}>
                  {overdueTasks.length} überfällig
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dash-kpi-row" style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard
          label="Aktive Aufgaben" value={activeTasks.length}
          sub={overdueTasks.length > 0 ? `${overdueTasks.length} überfällig` : 'Alle pünktlich'}
          subAlert={overdueTasks.length > 0}
          color="#2563eb" icon={FiCheckSquare}
        />
        <StatCard
          label="Deals in Pipeline" value={openDeals.length}
          sub={`${pipelineValue.toLocaleString('de-CH')} CHF`}
          color="#7c3aed" icon={FiBriefcase}
        />
        <StatCard
          label="Gewonnener Umsatz" value={`${revenueWon.toLocaleString('de-CH')} CHF`}
          sub={`${wonDeals.length} Deal${wonDeals.length !== 1 ? 's' : ''} gewonnen`}
          color="#16a34a" icon={FiTrendingUp}
        />
        <StatCard
          label="Zeit diese Woche" value={`${weekHours}h`}
          sub={`${timeEntries.length} Einträge gesamt`}
          color="#0891b2" icon={FiClock}
        />
      </div>

      {/* Charts row */}
      <div className="dash-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <SectionCard title="Aufgaben nach Status">
          <div className="dash-chart-inner" style={{ padding: '12px 16px 20px', minHeight: 200 }}>
            <TasksBarChart data={tasksChart} />
          </div>
        </SectionCard>
        <SectionCard title="Deals nach Phase">
          <div className="dash-chart-inner" style={{ padding: '12px 16px 20px', minHeight: 200 }}>
            <DealsPieChart data={dealsChart} />
          </div>
        </SectionCard>
        <SectionCard title="Erfasste Zeit (7 Tage)">
          <div className="dash-chart-inner" style={{ padding: '12px 16px 20px', minHeight: 200 }}>
            <TimeLineChart data={timeChart} />
          </div>
        </SectionCard>
      </div>

      {/* Project Alerts row */}
      {(overduePermits.length > 0 || budgetAlerts.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Overdue permits */}
          <SectionCard title={`Überfällige Baubewilligungen (${overduePermits.length})`} linkHref="/admin/permits" linkLabel="Alle anzeigen">
            {overduePermits.length === 0 ? (
              <div style={{ padding: '20px', color: '#94a3b8', fontSize: 13 }}>Keine überfälligen Bewilligungen</div>
            ) : (
              overduePermits.map((p: any, idx: number) => (
                <Link key={p.id} href={`/projects/${p.projectId}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px',
                    borderBottom: idx < overduePermits.length - 1 ? '1px solid #f8fafc' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fef2f2'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiFileText size={14} color="#dc2626" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: '#dc2626', marginTop: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <FiAlertTriangle size={10} />
                        Frist: {new Date(p.expectedDecisionAt).toLocaleDateString('de-CH')}
                        {p.project?.name && ` · ${p.project.name}`}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </SectionCard>

          {/* Budget alerts */}
          <SectionCard title={`Budget-Alarme (${budgetAlerts.length})`} linkHref="/projects" linkLabel="Alle Projekte">
            {budgetAlerts.length === 0 ? (
              <div style={{ padding: '20px', color: '#94a3b8', fontSize: 13 }}>Keine Budget-Überschreitungen</div>
            ) : (
              budgetAlerts.map((p: any, idx: number) => {
                const isOver = p.pct >= 100;
                return (
                  <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px',
                      borderBottom: idx < budgetAlerts.length - 1 ? '1px solid #f8fafc' : 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isOver ? '#fef2f2' : '#fffbeb'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: isOver ? '#fef2f2' : '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FiDollarSign size={14} color={isOver ? '#dc2626' : '#d97706'} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ marginTop: 4 }}>
                          <div style={{ height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 99, background: isOver ? '#ef4444' : '#f59e0b', width: `${Math.min(p.pct, 100)}%` }} />
                          </div>
                          <div style={{ fontSize: 11, color: isOver ? '#dc2626' : '#d97706', marginTop: 2, fontWeight: 600 }}>
                            {p.pct}% verbraucht · {p.totalActual.toLocaleString('de-CH')} CHF
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </SectionCard>

        </div>
      )}

      {/* Bottom row — 3 columns */}
      <div className="dash-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

        {/* Upcoming tasks */}
        <SectionCard title="Anstehende Aufgaben" linkHref="/tasks" linkLabel="Alle Aufgaben">
          {upcoming.length === 0 ? (
            <div style={{ padding: '24px 20px', color: '#94a3b8', fontSize: 13 }}>
              Keine anstehenden Aufgaben.
            </div>
          ) : (
            upcoming.map((t, idx) => {
              const isOverdue = new Date(t.dueDate) < new Date();
              const pColor = PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.LOW;
              const sColor = STATUS_COLORS[t.status] || STATUS_COLORS.OPEN;
              return (
                <Link key={t.id} href={`/tasks/${t.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 20px',
                    borderBottom: idx < upcoming.length - 1 ? '1px solid #f8fafc' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: 11, color: isOverdue ? '#dc2626' : '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                        {isOverdue && <FiAlertTriangle size={10} />}
                        {isOverdue ? 'Überfällig: ' : 'Fällig: '}
                        {new Date(t.dueDate).toLocaleDateString('de-CH')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 5, marginLeft: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: pColor.text, background: pColor.bg, borderRadius: 5, padding: '2px 8px' }}>
                        {PRIORITY_LABELS[t.priority] || t.priority}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: sColor.text, background: sColor.bg, borderRadius: 5, padding: '2px 8px' }}>
                        {STATUS_LABELS[t.status] || t.status}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </SectionCard>

        {/* Deal forecast */}
        <SectionCard title="Deal-Prognose (6 Monate)">
          <div style={{ padding: '8px 16px 16px' }}>
            <DealForecastWidget />
          </div>
        </SectionCard>

        {/* Activity feed */}
        <SectionCard title="Letzte Aktivitäten" linkHref="/activity" linkLabel="Alle anzeigen">
          {activities.length === 0 ? (
            <div style={{ padding: '24px 20px', color: '#94a3b8', fontSize: 13 }}>
              Noch keine Aktivitäten.
            </div>
          ) : (
            activities.slice(0, 8).map((act: any, idx, arr) => {
              const actionIcon = act.action === 'CREATE' ? '➕'
                : act.action === 'DELETE' ? '🗑'
                : act.action === 'change_stage' ? '🔄'
                : act.action === 'timer_stop' ? '⏱'
                : '✏️';
              const label = `${act.actorName || 'Benutzer'} hat ${act.entityType} ${ACTION_LABELS[act.action] || act.action}`;
              return (
                <div key={act.id} style={{
                  display: 'flex', gap: 12, padding: '11px 20px',
                  borderBottom: idx < arr.length - 1 ? '1px solid #f8fafc' : 'none',
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#f1f5f9', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 13, flexShrink: 0,
                  }}>
                    {actionIcon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#1e293b', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {new Date(act.createdAt).toLocaleString('de-CH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </SectionCard>
      </div>
    </div>
  );
}
