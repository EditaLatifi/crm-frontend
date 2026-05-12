"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../../../src/api/client';
import { formatCurrency } from '../../../../src/lib/formatCurrency';
import { FiArrowLeft } from 'react-icons/fi';

const TYPE_LABELS: Record<string, string> = {
  ARCHITECTURE: 'Architektur',
  INTERIOR_DESIGN: 'Innenarchitektur',
  CONSTRUCTION_MANAGEMENT: 'Bauleitung',
  VISUALIZATION: 'Visualisierung',
  REAL_ESTATE: 'Immobilien',
  DIGITIZATION: 'Digitalisierung',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktiv',
  ON_HOLD: 'Pausiert',
  COMPLETED: 'Abgeschlossen',
  CANCELLED: 'Storniert',
};

type ProjectRow = {
  id: string;
  name: string;
  type: string;
  status: string;
  budget: number;
  currency: string;
  totalEstimated: number;
  totalActual: number;
  remaining: number;
};

type Overview = {
  totals: { budget: number; estimated: number; actual: number };
  byType: Record<string, { count: number; budget: number; estimated: number; actual: number }>;
  projects: ProjectRow[];
};

type HoursData = Record<string, { budgetHours: number; usedHours: number }>;

export default function BudgetOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [hours, setHours] = useState<HoursData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/projects/budget-overview'),
      api.get('/projects?pageSize=200'),
      api.get('/time-entries'),
    ]).then(([budgetData, projRes, timeRes]: any) => {
      setData(budgetData);
      const projects = projRes?.data ?? (Array.isArray(projRes) ? projRes : []);
      const timeEntries = Array.isArray(timeRes) ? timeRes : [];

      // Sum hours per project from time entries
      const usedByProject: Record<string, number> = {};
      for (const te of timeEntries) {
        if (te.projectId) {
          usedByProject[te.projectId] = (usedByProject[te.projectId] || 0) + (te.durationMinutes || 0);
        }
      }

      const h: HoursData = {};
      let totalBudget = 0, totalUsed = 0;
      for (const p of projects) {
        const phases = p.phases || [];
        const budget = phases.reduce((s: number, ph: any) => s + (ph.budgetHours || 0), 0);
        const usedMin = usedByProject[p.id] || 0;
        const usedH = usedMin / 60;
        h[p.id] = { budgetHours: budget, usedHours: usedH };
        totalBudget += budget;
        totalUsed += usedH;
      }
      h['__total'] = { budgetHours: totalBudget, usedHours: totalUsed };
      setHours(h);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 32 }}>Wird geladen…</div>;
  if (!data) return <div style={{ padding: 32 }}>Keine Daten verfügbar.</div>;

  const byStatus: Record<string, { count: number; budget: number }> = {};
  for (const p of data.projects) {
    if (!byStatus[p.status]) byStatus[p.status] = { count: 0, budget: 0 };
    byStatus[p.status].count += 1;
    byStatus[p.status].budget += p.budget;
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: 13, marginBottom: 12 }}>
        <FiArrowLeft size={13} /> Zurück zu Projekten
      </Link>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Budget-Übersicht</h1>

      {/* Totals CHF */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
        <KpiCard label="Gesamtbudget" value={formatCurrency(data.totals.budget, 'CHF')} color="#1a1a1a" />
        <KpiCard label="Geschätzt (alle Posten)" value={formatCurrency(data.totals.estimated, 'CHF')} color="#3b82f6" />
        <KpiCard label="Tatsächlich" value={formatCurrency(data.totals.actual, 'CHF')} color="#16a34a" />
      </div>

      {/* Totals Hours */}
      {hours['__total'] && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          <KpiCard label="Kontingent (Stunden)" value={`${hours['__total'].budgetHours.toFixed(0)}h`} color="#1a1a1a" />
          <KpiCard label="Erfasst (Stunden)" value={`${hours['__total'].usedHours.toFixed(0)}h`} color="#3b82f6" />
          <KpiCard label="Verfügbar (Stunden)" value={`${Math.max(0, hours['__total'].budgetHours - hours['__total'].usedHours).toFixed(0)}h`} color={hours['__total'].usedHours > hours['__total'].budgetHours ? '#dc2626' : '#16a34a'} />
        </div>
      )}

      {/* By type */}
      <Section title="Nach Projekttyp">
        <table style={tbl}>
          <thead>
            <tr style={trh}>
              <th style={th}>Typ</th>
              <th style={thR}>Projekte</th>
              <th style={thR}>Budget</th>
              <th style={thR}>Geschätzt</th>
              <th style={thR}>Tatsächlich</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.byType).map(([type, v]) => (
              <tr key={type} style={trb}>
                <td style={td}>{TYPE_LABELS[type] || type}</td>
                <td style={tdR}>{v.count}</td>
                <td style={tdR}>{formatCurrency(v.budget, 'CHF')}</td>
                <td style={tdR}>{formatCurrency(v.estimated, 'CHF')}</td>
                <td style={tdR}>{formatCurrency(v.actual, 'CHF')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* By status */}
      <Section title="Nach Status">
        <table style={tbl}>
          <thead>
            <tr style={trh}>
              <th style={th}>Status</th>
              <th style={thR}>Projekte</th>
              <th style={thR}>Budget</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(byStatus).map(([s, v]) => (
              <tr key={s} style={trb}>
                <td style={td}>{STATUS_LABELS[s] || s}</td>
                <td style={tdR}>{v.count}</td>
                <td style={tdR}>{formatCurrency(v.budget, 'CHF')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Projects table */}
      <Section title="Alle Projekte">
        <table style={tbl}>
          <thead>
            <tr style={trh}>
              <th style={th}>Projekt</th>
              <th style={th}>Typ</th>
              <th style={th}>Status</th>
              <th style={thR}>Budget</th>
              <th style={thR}>Geschätzt</th>
              <th style={thR}>Tatsächlich</th>
              <th style={thR}>Verbleibend</th>
              <th style={thR}>Kontingent (h)</th>
              <th style={thR}>Erfasst (h)</th>
              <th style={thR}>Verfügbar (h)</th>
            </tr>
          </thead>
          <tbody>
            {data.projects.map(p => (
              <tr key={p.id} style={trb}>
                <td style={td}>
                  <Link href={`/projects/${p.id}`} style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 600 }}>{p.name}</Link>
                </td>
                <td style={td}>{TYPE_LABELS[p.type] || p.type}</td>
                <td style={td}>{STATUS_LABELS[p.status] || p.status}</td>
                <td style={tdR}>{formatCurrency(p.budget, p.currency || 'CHF')}</td>
                <td style={tdR}>{formatCurrency(p.totalEstimated, p.currency || 'CHF')}</td>
                <td style={tdR}>{formatCurrency(p.totalActual, p.currency || 'CHF')}</td>
                <td style={{ ...tdR, color: p.remaining < 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                  {formatCurrency(p.remaining, p.currency || 'CHF')}
                </td>
                <td style={tdR}>
                  {hours[p.id]?.budgetHours ? `${hours[p.id].budgetHours}h` : '—'}
                </td>
                <td style={tdR}>
                  {hours[p.id]?.usedHours ? `${hours[p.id].usedHours.toFixed(1)}h` : '—'}
                </td>
                <td style={{ ...tdR, color: hours[p.id]?.budgetHours && hours[p.id].usedHours > hours[p.id].budgetHours ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                  {hours[p.id]?.budgetHours ? `${Math.max(0, hours[p.id].budgetHours - hours[p.id].usedHours).toFixed(1)}h` : '—'}
                  {hours[p.id]?.budgetHours && hours[p.id].usedHours > hours[p.id].budgetHours && ' ⚠️'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>{title}</div>
      <div style={{ overflowX: 'auto' }}>{children}</div>
    </div>
  );
}

const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const trh: React.CSSProperties = { background: '#fafbfc' };
const trb: React.CSSProperties = { borderBottom: '1px solid #f1f5f9' };
const th: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' };
const thR: React.CSSProperties = { ...th, textAlign: 'right' };
const td: React.CSSProperties = { padding: '10px', color: '#1e293b' };
const tdR: React.CSSProperties = { ...td, textAlign: 'right' };
