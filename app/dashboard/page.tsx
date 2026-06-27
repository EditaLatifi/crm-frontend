"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, isManagerRole } from '../../src/auth/AuthProvider';
import { api } from '../../src/api/client';
import Link from 'next/link';
import { FiArrowRight, FiX } from 'react-icons/fi';
import './dashboard-desktop.css';
import './dashboard-mobile.css';
import { formatCHF } from '../../src/lib/formatCurrency';

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Offen', IN_PROGRESS: 'In Bearbeitung', DONE: 'Erledigt', PLANNED: 'Geplant',
};
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  OPEN:        { bg: '#f1f5f9', text: '#64748b' },
  PLANNED:     { bg: '#f1f5f9', text: '#64748b' },
  IN_PROGRESS: { bg: '#FFF8EC', text: '#d97706' },
  DONE:        { bg: '#f0fdf4', text: '#16a34a' },
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // Deals are management-only; hide all deal surfaces from regular employees.
  const showDeals = isManagerRole(user?.role);

  const [tasks, setTasks] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<any[]>([]);
  const [budgetOverview, setBudgetOverview] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [welcomeDismissed, setWelcomeDismissed] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  // Show the welcome card unless this user has dismissed it before.
  useEffect(() => {
    try { setWelcomeDismissed(localStorage.getItem('dash-welcome-dismissed') === '1'); } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get('/tasks').catch(() => []),
      api.get('/deals').catch(() => []),
      api.get('/deals/deal-stages').catch(() => []),
      api.get('/projects').catch(() => []),
      api.get('/time-entries').catch(() => []),
      api.get('/appointments').catch(() => []),
      api.get('/follow-ups?completed=false').catch(() => []),
      api.get('/budget/alerts').catch(() => []),
      api.get('/projects/budget-overview').catch(() => null),
    ]).then(([tasksData, dealsData, stagesData, projectsData, timeData, appointmentsData, followUpsData, budgetAlertsData, budgetData]) => {
      setTasks(tasksData?.data ?? (Array.isArray(tasksData) ? tasksData : []));
      setDeals(dealsData?.data ?? (Array.isArray(dealsData) ? dealsData : []));
      setStages(Array.isArray(stagesData) ? stagesData : []);
      setProjects(projectsData?.data ?? (Array.isArray(projectsData) ? projectsData : []));
      setTimeEntries(Array.isArray(timeData) ? timeData : []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setFollowUps(Array.isArray(followUpsData) ? followUpsData : []);
      setBudgetAlerts(Array.isArray(budgetAlertsData) ? budgetAlertsData : []);
      setBudgetOverview(budgetData);
      setDataLoading(false);
    });
  }, [user]);

  // Derived metrics
  const openDeals = deals.filter(d => { const s = stages.find((st: any) => st.id === d.stageId); return s && !s.isWon && !s.isLost; });
  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'ACTIVE');
  const overdueProjects = projects.filter(p => p.status === 'ACTIVE' && p.dueDate && new Date(p.dueDate) < new Date());
  const negotiationDeals = openDeals.filter(d => {
    const s = stages.find((st: any) => st.id === d.stageId);
    return s?.name === 'Verhandlung';
  });

  // Budget Auslastung
  const totalBudgetHours = budgetOverview?.totals?.budget || 0;
  const totalActual = budgetOverview?.totals?.actual || 0;
  const budgetPct = totalBudgetHours > 0 ? Math.round((totalActual / totalBudgetHours) * 100) : 0;

  // Weighted pipeline
  const weightMap: Record<string, number> = {};
  stages.forEach((s: any) => {
    if (s.isWon) weightMap[s.id] = 1;
    else if (s.isLost) weightMap[s.id] = 0;
    else weightMap[s.id] = Math.min(0.9, (s.order || 1) * 0.15);
  });
  const weightedPipeline = openDeals.reduce((sum, d) => sum + (d.amount || 0) * (weightMap[d.stageId] || 0.3), 0);

  // Tasks
  const activeTasks = tasks.filter(t => t.status !== 'DONE');
  const overdueTasks = activeTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date());
  const myTasks = activeTasks
    .sort((a, b) => {
      const aOverdue = a.dueDate && new Date(a.dueDate) < new Date() ? 0 : 1;
      const bOverdue = b.dueDate && new Date(b.dueDate) < new Date() ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return 0;
    })
    .slice(0, 5);

  // Combined upcoming events: appointments + follow-ups + payment reminders
  const now = new Date();
  const upcoming: { id: string; date: Date; title: string; type: 'meeting' | 'followup' | 'payment'; meta: string }[] = [];

  appointments
    .filter(a => new Date(a.startAt) >= now)
    .forEach(a => upcoming.push({
      id: `appt-${a.id}`,
      date: new Date(a.startAt),
      title: a.title,
      type: 'meeting',
      meta: [a.account?.name, a.contact?.name].filter(Boolean).join(' · '),
    }));

  followUps
    .filter(f => f.dueDate)
    // Hide deal-linked follow-ups from non-managers (deals are management-only).
    .filter(f => showDeals || f.entityType !== 'Deal')
    .forEach(f => upcoming.push({
      id: `fu-${f.id}`,
      date: new Date(f.dueDate),
      title: f.title,
      type: 'followup',
      meta: [f.entityType, f.assignedTo?.name].filter(Boolean).join(' · '),
    }));

  // Deal follow-up dates
  deals
    .filter(d => d.followUpDate && new Date(d.followUpDate) >= new Date(now.toDateString()))
    .forEach(d => upcoming.push({
      id: `deal-fu-${d.id}`,
      date: new Date(d.followUpDate),
      title: `Follow-up: ${d.name}`,
      type: 'followup',
      meta: d.account?.name || '',
    }));

  upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());

  const TYPE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
    meeting:  { label: 'Meeting',   bg: '#dbeafe', color: '#1d4ed8' },
    followup: { label: 'Follow-up', bg: '#fef3c7', color: '#92400e' },
    payment:  { label: 'Zahlung',   bg: '#fee2e2', color: '#991b1b' },
  };

  function formatEventDate(date: Date): string {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const d = new Date(date); d.setHours(0,0,0,0);

    if (d.getTime() === today.getTime()) {
      return `Heute\n${date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (d.getTime() === tomorrow.getTime()) {
      return `Morgen\n${date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}`;
    }
    const weekday = date.toLocaleDateString('de-CH', { weekday: 'short' });
    const dayMonth = date.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
    return `${weekday}\n${dayMonth}`;
  }

  if (loading || dataLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #E8E4DE', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ padding: '28px 32px 40px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div className="dash-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Dashboard</h1>
      </div>

      {/* Role-aware welcome card (dismissible) — gives new / non-technical users a first orientation. */}
      {!welcomeDismissed && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: '#FAF9F6', border: '1px solid #E8E4DE', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
              Willkommen{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {user?.role === 'ADMIN'
                ? 'Überblick über Projekte, Finanzen, Team und Anträge — alles an einem Ort.'
                : isManagerRole(user?.role)
                  ? 'Verwalte hier deine Projekte, Deals und Aufgaben.'
                  : 'Hier findest du deine Aufgaben, anstehende Termine und die Zeiterfassung.'}
            </div>
          </div>
          <button
            onClick={() => { try { localStorage.setItem('dash-welcome-dismissed', '1'); } catch {} setWelcomeDismissed(true); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, display: 'flex', flexShrink: 0 }}
            title="Ausblenden"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      {/* ═══ KPI Cards ═══ */}
      <div className="dash-kpi-row" style={{ display: 'grid', gridTemplateColumns: `repeat(${showDeals ? 4 : 2}, 1fr)`, gap: 16, marginBottom: 28 }}>
        {/* Offene Deals — management only */}
        {showDeals && (
        <div style={kpiCard}>
          <div style={kpiLabel}>OFFENE DEALS</div>
          <div style={kpiValue}>{openDeals.length}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            {negotiationDeals.length > 0 ? `${negotiationDeals.length} in Verhandlung` : `${deals.length} total`}
          </div>
        </div>
        )}

        {/* Deal-Volumen — management only */}
        {showDeals && (
        <div style={kpiCard}>
          <div style={kpiLabel}>DEAL-VOLUMEN</div>
          <div style={{ ...kpiValue, fontSize: pipelineValue >= 1000000 ? 28 : 32 }}>{formatCHF(pipelineValue)}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Gewichtet: {formatCHF(Math.round(weightedPipeline))}
          </div>
        </div>
        )}

        {/* Aktive Projekte */}
        <div style={kpiCard}>
          <div style={kpiLabel}>AKTIVE PROJEKTE</div>
          <div style={kpiValue}>{activeProjects.length}</div>
          <div style={{ fontSize: 13, color: overdueProjects.length > 0 ? '#dc2626' : '#64748b', fontWeight: overdueProjects.length > 0 ? 600 : 400, marginTop: 4 }}>
            {overdueProjects.length > 0 ? `${overdueProjects.length} überfällig` : `${projects.length} total`}
          </div>
        </div>

        {/* Budget-Auslastung */}
        <div style={kpiCard}>
          <div style={kpiLabel}>BUDGET-AUSLASTUNG (CHF)</div>
          <div style={{ ...kpiValue, color: budgetPct >= 100 ? '#dc2626' : budgetPct >= 80 ? '#d97706' : '#16a34a' }}>
            {budgetPct}%
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>vom Gesamtbudget verbraucht</div>
        </div>
      </div>

      {/* ═══ Middle Row: Tasks + Budget Warnings ═══ */}
      <div className="dash-bottom-grid" style={{ display: 'grid', gridTemplateColumns: showDeals ? '1fr 1fr' : '1fr', gap: 20, marginBottom: 28 }}>

        {/* Meine offenen Aufgaben */}
        <div style={sectionCard}>
          <div style={sectionHeader}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Meine offenen Aufgaben</span>
            <Link href="/tasks" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>
              {activeTasks.length} Aufgaben
            </Link>
          </div>
          {myTasks.length === 0 ? (
            <div style={{ padding: 24, color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>Keine offenen Aufgaben.</div>
          ) : myTasks.map((t, idx) => {
            const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
            const projectName = t.project?.name || '';
            const phaseCode = t.phaseCode || '';
            return (
              <Link key={t.id} href={`/tasks/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  padding: '14px 20px',
                  borderBottom: idx < myTasks.length - 1 ? '1px solid #f1f5f9' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12,
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{t.title}</div>
                    {(projectName || phaseCode) && (
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                        {projectName}{phaseCode ? ` → Phase ${phaseCode}` : ''}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '4px 10px', whiteSpace: 'nowrap',
                    background: isOverdue ? '#fef2f2' : (STATUS_COLORS[t.status]?.bg || '#f1f5f9'),
                    color: isOverdue ? '#dc2626' : (STATUS_COLORS[t.status]?.text || '#64748b'),
                  }}>
                    {isOverdue ? 'Überfällig' : (STATUS_LABELS[t.status] || t.status)}
                  </span>
                  {t.dueDate && (
                    <span style={{ fontSize: 12, color: isOverdue ? '#dc2626' : '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {new Date(t.dueDate).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Budget-Warnungen — management only (finance detail, not actionable for employees) */}
        {showDeals && (
        <div style={sectionCard}>
          <div style={sectionHeader}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Budget-Warnungen</span>
          </div>
          {budgetAlerts.length === 0 ? (
            <div style={{ padding: 24, color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>Alle Budgets im grünen Bereich.</div>
          ) : budgetAlerts.slice(0, 5).map((p: any, idx) => {
            const pct = p.pct || 0;
            const barColor = pct >= 100 ? '#dc2626' : pct >= 80 ? '#d97706' : '#16a34a';
            return (
              <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  padding: '14px 20px',
                  borderBottom: idx < Math.min(budgetAlerts.length, 5) - 1 ? '1px solid #f1f5f9' : 'none',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{p.name}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: barColor }}>{pct}%</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: barColor, width: `${Math.min(pct, 100)}%`, transition: 'width 0.4s ease' }} />
                  </div>
                  {p.usedHours !== undefined && p.totalHours !== undefined && (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                      {p.usedHours} von {p.totalHours} Stunden verbraucht
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        )}
      </div>

      {/* ═══ Anstehende Termine & Follow-ups ═══ */}
      <div style={sectionCard}>
        <div style={sectionHeader}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Anstehende Termine & Follow-ups</span>
          <Link href="/calendar" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>
            Kalender <FiArrowRight size={12} />
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div style={{ padding: 24, color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>Keine anstehenden Termine.</div>
        ) : upcoming.slice(0, 8).map((item, idx) => {
          const badge = TYPE_BADGE[item.type];
          const dateLines = formatEventDate(item.date).split('\n');
          return (
            <div key={item.id} style={{
              display: 'grid', gridTemplateColumns: '70px 1fr auto auto',
              alignItems: 'center', gap: 16,
              padding: '14px 20px',
              borderBottom: idx < Math.min(upcoming.length, 8) - 1 ? '1px solid #f1f5f9' : 'none',
            }}>
              {/* Date */}
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>
                <div style={{ fontWeight: 500 }}>{dateLines[0]}</div>
                {dateLines[1] && <div style={{ fontSize: 12 }}>{dateLines[1]}</div>}
              </div>
              {/* Title */}
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{item.title}</div>
              {/* Badge */}
              <span style={{
                fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '4px 12px',
                background: badge.bg, color: badge.color, whiteSpace: 'nowrap',
              }}>
                {badge.label}
              </span>
              {/* Meta */}
              <div style={{ fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap' }}>{item.meta}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Style constants ─── */
const kpiCard: React.CSSProperties = {
  background: '#fff', borderRadius: 12, padding: '20px 24px',
  border: '1px solid #E8E4DE',
};
const kpiLabel: React.CSSProperties = {
  fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.06em', marginBottom: 8,
};
const kpiValue: React.CSSProperties = {
  fontSize: 32, fontWeight: 700, color: '#1a1a1a', lineHeight: 1,
};
const sectionCard: React.CSSProperties = {
  background: '#fff', borderRadius: 12, border: '1px solid #E8E4DE', overflow: 'hidden',
};
const sectionHeader: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
};
