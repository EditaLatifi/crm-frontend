"use client";
import Link from 'next/link';
import {
  STATUS_COLORS, STATUS_BG, STATUS_LABELS,
  TYPE_LABELS, TYPE_ICONS, PHASE_COLORS,
} from './phaseConfig';
import { FiUser, FiCalendar, FiMapPin, FiChevronRight } from 'react-icons/fi';
import { formatCurrency } from '../../src/lib/formatCurrency';

type Phase = { id: string; order: number; name: string; status: string };
type Project = {
  id: string;
  name: string;
  status: string;
  type: string;
  address?: string;
  budget?: number;
  currency: string;
  startDate?: string;
  expectedEndDate?: string;
  account?: { id: string; name: string } | null;
  owner: { id: string; name: string; email: string };
  phases: Phase[];
  members: { userId: string; user: { id: string; name: string } }[];
};

export default function ProjectCard({ project }: { project: Project }) {
  const phases = project.phases || [];
  const completed = phases.filter(p => p.status === 'COMPLETED' || p.status === 'SKIPPED').length;
  const progress = phases.length > 0 ? Math.round((completed / phases.length) * 100) : 0;
  const currentPhase = phases.find(p => p.status === 'IN_PROGRESS') || phases.find(p => p.status === 'PENDING');

  return (
    <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '20px 22px',
          cursor: 'pointer',
          transition: 'all 0.18s',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(37,99,235,0.10)';
          (e.currentTarget as HTMLElement).style.borderColor = '#bfdbfe';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Top accent strip */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: STATUS_COLORS[project.status] || '#3b82f6',
          borderRadius: '14px 14px 0 0',
        }} />

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, marginTop: 4 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>{TYPE_ICONS[project.type] || '🏗️'}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {project.name}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                background: STATUS_BG[project.status], color: STATUS_COLORS[project.status],
                border: `1px solid ${STATUS_COLORS[project.status]}33`,
              }}>
                {STATUS_LABELS[project.status] || project.status}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
                background: '#f1f5f9', color: '#64748b',
              }}>
                {TYPE_LABELS[project.type] || project.type}
              </span>
            </div>
          </div>
          <FiChevronRight size={16} color="#94a3b8" style={{ marginTop: 4, flexShrink: 0 }} />
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {currentPhase ? currentPhase.name : (progress === 100 ? 'Alle Phasen abgeschlossen' : 'Bereit')}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: progress === 100 ? '#22c55e' : '#3b82f6' }}>
              {progress}%
            </span>
          </div>
          <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99 }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: progress === 100 ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#3b82f6,#6366f1)',
              borderRadius: 99,
              transition: 'width 0.4s',
            }} />
          </div>
          {/* Phase dots */}
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            {phases.map(p => (
              <div
                key={p.id}
                title={p.name}
                style={{
                  flex: 1, height: 4, borderRadius: 99,
                  background: PHASE_COLORS[p.status] || '#e2e8f0',
                  transition: 'background 0.2s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Meta info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {project.account && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
              <FiUser size={12} color="#94a3b8" />
              {project.account.name}
            </div>
          )}
          {project.address && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
              <FiMapPin size={12} color="#94a3b8" />
              {project.address}
            </div>
          )}
          {(project.startDate || project.expectedEndDate) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
              <FiCalendar size={12} color="#94a3b8" />
              {project.startDate ? new Date(project.startDate).toLocaleDateString('de-CH') : '—'}
              {' → '}
              {project.expectedEndDate ? new Date(project.expectedEndDate).toLocaleDateString('de-CH') : '—'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9',
        }}>
          <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
            <FiUser size={11} color="#94a3b8" />
            {project.owner.name}
          </div>
          {project.budget && (
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
              {formatCurrency(project.budget, project.currency || 'CHF')}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
