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
import { formatCHF } from '../../src/lib/formatCurrency';

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
  COMMENT: 'kommentiert', change_stage: 'Phasenänderung', PHASE_UPDATE: 'Phasenänderung',
  DEAL_CREATED: 'Deal erstellt', DEAL_UPDATED: 'Deal aktualisiert',
  timer_stop: 'Zeit gestoppt',
};

const ENTITY_LABELS: Record<string, string> = {
  Contact: 'Kontakt', Account: 'Konto', Deal: 'Deal',
  Task: 'Aufgabe', TimeEntry: 'Zeiteintrag', Project: 'Projekt',
  Appointment: 'Termin', Note: 'Notiz',
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
  const [appointments, setAppointments] = useState<any[]>([]);
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
      api.get('/activity').then((r: any) => r?.data || r).catch(() => []),
      api.get('/time-entries').catch(() => []),
      api.get('/permits').catch(() => []),
      api.get('/budget/alerts').catch(() => []),
      api.get('/appointments').catch(() => []),
    ]).then(([tasksData, dealsData, stagesData, actData, timeData, permitsData, budgetAlertsData, appointmentsData]) => {
      const taskList = Array.isArray(tasksData) ? tasksData : [];
      const dealList = Array.isArray(dealsData) ? dealsData : [];
      const appointmentList = Array.isArray(appointmentsData) ? appointmentsData : [];
      setAppointments(appointmentList);
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

  const upcomingAppointments = appointments
    .filter((a) => new Date(a.startAt) >= new Date())
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 6);

  const greeting = (() => {
    const h = now.getHours();
    if (h < 12) return 'Guten Morgen';
    if (h < 18) return 'Guten Tag';
    return 'Guten Abend';
  })();

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #E8E4DE', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // Budget percentage
  const totalBudgetHours = tasks.reduce((s, t) => s + (t.budgetHours || 0), 0);
  const budgetPct = totalBudgetHours > 0 ? Math.round((weekMins / 60) / totalBudgetHours * 100) : 0;

  return (
    <div style={{ padding: '28px 32px 40px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header row */}
      <div className="dash-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Dashboard</h1>
        <Link href="/accounts" style={{ textDecoration: 'none' }}>
          <button style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + Neue Firma
          </button>
        </Link>
      </div>

      {/* KPI Cards — clean minimal style */}
      <div className="dash-kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E8E4DE' }}>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginBottom: 8 }}>Offene Deals</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a' }}>{openDeals.length}</div>
          <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 500, marginTop: 4 }}>+{tasks.filter(t => { const d = new Date(t.createdAt); const w = new Date(); w.setDate(w.getDate() - 7); return d >= w; }).length} diese Woche</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E8E4DE' }}>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginBottom: 8 }}>Deal-Volumen</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a' }}>{formatCHF(pipelineValue)}</div>
          <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 500, marginTop: 4 }}>+12%</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E8E4DE' }}>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginBottom: 8 }}>Offene Aufgaben</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a' }}>{activeTasks.length}</div>
          {overdueTasks.length > 0 && <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 500, marginTop: 4 }}>{overdueTasks.length} überfällig</div>}
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E8E4DE' }}>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginBottom: 8 }}>Erfasste Stunden (Woche)</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a' }}>{weekHours}h</div>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginTop: 4 }}>Budget {budgetPct}%</div>
        </div>
      </div>

      {/* Two-column layout: Termine + Aktivitäten */}
      <div className="dash-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Nächste Termine */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #E8E4DE' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 20px' }}>Nächste Termine</h2>
          {upcomingAppointments.length === 0 ? (
            <div style={{ color: '#999', fontSize: 13 }}>Keine anstehenden Termine.</div>
          ) : (
            upcomingAppointments.slice(0, 4).map((a, idx) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: idx < Math.min(upcomingAppointments.length, 4) - 1 ? '1px solid #F0ECE6' : 'none' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', minWidth: 42 }}>
                  {new Date(a.startAt).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div>
                  <span style={{ fontSize: 14, color: '#1a1a1a' }}> – {a.title}</span>
                  {a.account?.name && (
                    <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: '#e8a838', background: '#FFF8EC', borderRadius: 4, padding: '2px 8px' }}>{a.account.name}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Letzte Aktivitäten */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #E8E4DE' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 20px' }}>Letzte Aktivitäten</h2>
          {activities.length === 0 ? (
            <div style={{ color: '#999', fontSize: 13 }}>Noch keine Aktivitäten.</div>
          ) : (
            activities.slice(0, 4).map((act: any, idx) => {
              const actorName = act.actor?.name || act.actorName || 'System';
              const initials = actorName.split(' ').map((w: string) => w[0]).join('').slice(0, 2);
              const entityTypeLabel = ENTITY_LABELS[act.entityType] || act.entityType;
              const entityName = act.payloadJson?.name || act.payloadJson?.title || '';
              const actionLabel = ACTION_LABELS[act.action] || act.action;
              const relTime = (() => {
                const diff = Date.now() - new Date(act.createdAt).getTime();
                const mins = Math.floor(diff / 60000);
                if (mins < 60) return `${mins}min`;
                const hrs = Math.floor(mins / 60);
                if (hrs < 24) return `${hrs}h`;
                return `${Math.floor(hrs / 24)}d`;
              })();
              return (
                <div key={act.id} style={{ padding: '10px 0', borderBottom: idx < 3 ? '1px solid #F0ECE6' : 'none' }}>
                  <div style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>
                    <strong>{actorName.split(' ')[0]} {actorName.split(' ')[1]?.[0] || ''}.</strong>
                    {' hat '}{entityTypeLabel}{entityName ? ` «${entityName}»` : ''}
                    {' auf '}<em style={{ color: '#e8a838' }}>{actionLabel}</em>
                    {' '}<span style={{ color: '#999' }}>— {relTime}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Charts row */}
      <div className="dash-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 24, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E4DE', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0ECE6', fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Aufgaben nach Status</div>
          <div style={{ padding: '12px 16px 20px', minHeight: 200 }}><TasksBarChart data={tasksChart} /></div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E4DE', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0ECE6', fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Deals nach Phase</div>
          <div style={{ padding: '12px 16px 20px', minHeight: 200 }}><DealsPieChart data={dealsChart} /></div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E4DE', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0ECE6', fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Erfasste Zeit (7 Tage)</div>
          <div style={{ padding: '12px 16px 20px', minHeight: 200 }}><TimeLineChart data={timeChart} /></div>
        </div>
      </div>

      {/* Alerts row */}
      {(overduePermits.length > 0 || budgetAlerts.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E4DE', padding: '20px 24px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: '0 0 14px' }}>Überfällige Bewilligungen ({overduePermits.length})</h3>
            {overduePermits.map((p: any) => (
              <Link key={p.id} href={`/projects/${p.projectId}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '8px 0', borderBottom: '1px solid #F0ECE6', fontSize: 13, color: '#dc2626' }}>
                  {p.title} — {new Date(p.expectedDecisionAt).toLocaleDateString('de-CH')}
                </div>
              </Link>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E4DE', padding: '20px 24px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: '0 0 14px' }}>Budget-Alarme ({budgetAlerts.length})</h3>
            {budgetAlerts.map((p: any) => (
              <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '8px 0', borderBottom: '1px solid #F0ECE6' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{p.name}</div>
                  <div style={{ height: 4, background: '#F0ECE6', borderRadius: 99, overflow: 'hidden', marginTop: 4 }}>
                    <div style={{ height: '100%', borderRadius: 99, background: p.pct >= 100 ? '#ef4444' : '#e8a838', width: `${Math.min(p.pct, 100)}%` }} />
                  </div>
                  <div style={{ fontSize: 11, color: p.pct >= 100 ? '#dc2626' : '#999', marginTop: 2 }}>{p.pct}% verbraucht</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom row: Tasks + Deal Forecast */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E4DE', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0ECE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Anstehende Aufgaben</span>
            <Link href="/tasks" style={{ fontSize: 12, color: '#e8a838', textDecoration: 'none', fontWeight: 600 }}>Alle anzeigen</Link>
          </div>
          {upcoming.length === 0 ? (
            <div style={{ padding: '20px', color: '#999', fontSize: 13 }}>Keine anstehenden Aufgaben.</div>
          ) : upcoming.map((t, idx) => {
            const isOverdue = new Date(t.dueDate) < new Date();
            return (
              <Link key={t.id} href={`/tasks/${t.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '10px 20px', borderBottom: idx < upcoming.length - 1 ? '1px solid #F0ECE6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF5')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: isOverdue ? '#dc2626' : '#999', marginTop: 2 }}>
                      {isOverdue ? 'Überfällig: ' : 'Fällig: '}{new Date(t.dueDate).toLocaleDateString('de-CH')}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: PRIORITY_COLORS[t.priority]?.text || '#999', background: PRIORITY_COLORS[t.priority]?.bg || '#f5f5f0', borderRadius: 5, padding: '2px 8px' }}>
                    {PRIORITY_LABELS[t.priority] || t.priority}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E4DE', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0ECE6', fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Deal-Prognose (6 Monate)</div>
          <div style={{ padding: '8px 16px 16px' }}><DealForecastWidget /></div>
        </div>
      </div>
    </div>
  );
}
