"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../src/api/client';
import { useAuth } from '../../../../src/auth/AuthProvider';
import { FiArrowLeft, FiClock } from 'react-icons/fi';

type OverviewEntry = { id: string; name: string; minutes: number; entries: number; project?: string };
type Overview = {
  totalMinutes: number;
  totalEntries: number;
  byProject: OverviewEntry[];
  byEmployee: OverviewEntry[];
  byPhase: OverviewEntry[];
};

function fmtH(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1); d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function TimeOverviewPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(startOfMonth());
  const [to, setTo] = useState(today());
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [filterUserId, setFilterUserId] = useState('');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (filterUserId) params.set('userId', filterUserId);
    api.get(`/time-entries/overview?${params.toString()}`)
      .then((d: any) => setData(d))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [from, to, filterUserId]);

  useEffect(() => {
    if (isAdmin) {
      api.get('/users').then((d: any) => setEmployees(Array.isArray(d) ? d : [])).catch(() => {});
    }
  }, [isAdmin]);

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <Link href="/time" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', textDecoration: 'none', fontSize: 13, marginBottom: 12 }}>
        <FiArrowLeft size={13} /> Zurück zur Zeiterfassung
      </Link>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 18 }}>Zeit-Übersicht</h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <label style={lbl}>Von</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inp} />
        </div>
        <div>
          <label style={lbl}>Bis</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inp} />
        </div>
        {isAdmin && (
          <div>
            <label style={lbl}>Mitarbeiter</label>
            <select value={filterUserId} onChange={e => setFilterUserId(e.target.value)} style={inp}>
              <option value="">— Alle —</option>
              {employees.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {loading && <div style={{ color: '#94a3b8' }}>Wird geladen…</div>}

      {!loading && data && (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 24 }}>
            <KpiCard label="Gesamtstunden" value={fmtH(data.totalMinutes)} icon={<FiClock />} />
            <KpiCard label="Einträge" value={String(data.totalEntries)} />
          </div>

          <Section title="Pro Projekt" rows={data.byProject} columns={['Projekt', 'Einträge', 'Stunden']} />
          {isAdmin && (
            <Section title="Pro Mitarbeiter" rows={data.byEmployee} columns={['Mitarbeiter', 'Einträge', 'Stunden']} />
          )}
          <Section title="Pro Leistungsphase" rows={data.byPhase} columns={['Phase', 'Einträge', 'Stunden']} extraColumn="project" extraLabel="Projekt" />
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 22px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 24, fontWeight: 800, color: '#1a1a1a' }}>
        {icon}<span>{value}</span>
      </div>
    </div>
  );
}

function Section({ title, rows, columns, extraColumn, extraLabel }: { title: string; rows: OverviewEntry[]; columns: string[]; extraColumn?: string; extraLabel?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', marginBottom: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>{title}</div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 13, color: '#94a3b8', padding: '16px 0', textAlign: 'center' }}>Keine Einträge.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fafbfc' }}>
              <th style={th}>{columns[0]}</th>
              {extraColumn && <th style={th}>{extraLabel}</th>}
              <th style={thR}>{columns[1]}</th>
              <th style={thR}>{columns[2]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={td}>{r.name}</td>
                {extraColumn && <td style={td}>{(r as any)[extraColumn]}</td>}
                <td style={tdR}>{r.entries}</td>
                <td style={{ ...tdR, fontWeight: 600 }}>{fmtH(r.minutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 };
const inp: React.CSSProperties = { padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, background: '#fff', minWidth: 140 };
const th: React.CSSProperties = { padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' };
const thR: React.CSSProperties = { ...th, textAlign: 'right' };
const td: React.CSSProperties = { padding: '10px', color: '#1e293b' };
const tdR: React.CSSProperties = { ...td, textAlign: 'right' };
