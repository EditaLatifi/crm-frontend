"use client";
import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../../src/api/client';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../src/auth/AuthProvider';
import { FiX, FiClock } from 'react-icons/fi';

type Project = { id: string; name: string };
type Phase = { id: string; name: string; order: number; budgetHours?: number; usedMinutes?: number };
type Employee = { id: string; name: string };
type TaskOpt = { id: string; title: string; projectId?: string };

export default function LogTimeQuickModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: () => void }) {
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [projects, setProjects] = useState<Project[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [tasks, setTasks] = useState<TaskOpt[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projectId, setProjectId] = useState('');
  const [projectPhaseId, setProjectPhaseId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [employeeUserId, setEmployeeUserId] = useState('');
  const [overBudgetReason, setOverBudgetReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    api.get('/projects').then((res: any) => { const d = res?.data ?? (Array.isArray(res) ? res : []); setProjects(d.map((p: any) => ({ id: p.id, name: p.name }))); }).catch(() => {});
    if (isAdmin) {
      api.get('/users').then((d: any) => setEmployees(Array.isArray(d) ? d : [])).catch(() => {});
    }
    setProjectId(''); setProjectPhaseId(''); setTaskId(''); setHours(''); setDescription(''); setEmployeeUserId(''); setOverBudgetReason('');
    setDate(new Date().toISOString().slice(0, 10));
  }, [open, isAdmin]);

  const [phaseKontingent, setPhaseKontingent] = useState<{ budgetHours: number; usedHours: number; remaining: number } | null>(null);

  useEffect(() => {
    if (!projectId) { setPhases([]); setTasks([]); setPhaseKontingent(null); return; }
    api.get(`/projects/${projectId}`).then((d: any) => {
      const list = Array.isArray(d?.phases) ? d.phases : [];
      setPhases(list.map((p: any) => ({
        id: p.id, name: p.name, order: p.order,
        budgetHours: p.budgetHours || 0,
        usedMinutes: (p.timeEntries || []).reduce((s: number, e: any) => s + (e.durationMinutes || 0), 0),
      })));
    }).catch(() => setPhases([]));
    api.get(`/tasks`).then((d: any) => {
      const list = Array.isArray(d) ? d : [];
      setTasks(list.filter((t: any) => t.projectId === projectId).map((t: any) => ({ id: t.id, title: t.title, projectId: t.projectId })));
    }).catch(() => setTasks([]));
  }, [projectId]);

  const hoursNum = Number(hours) || 0;
  const isOverBudget = !!(
    phaseKontingent &&
    phaseKontingent.budgetHours > 0 &&
    phaseKontingent.usedHours + hoursNum > phaseKontingent.budgetHours
  );
  const reasonMissing = isOverBudget && !overBudgetReason.trim();

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId) { toast.error('Projekt ist erforderlich.'); return; }
    if (!hours || Number(hours) <= 0) { toast.error('Stunden sind erforderlich.'); return; }
    if (Number(hours) > 14) { toast.error('Maximale Erfassung: 14 Stunden pro Eintrag.'); return; }
    if (Number(hours) > 10) { toast.warning('Hinweis: Mehr als 10 Stunden erfasst.'); }
    if (reasonMissing) { toast.error('Begründung für Budgetüberschreitung erforderlich.'); return; }
    setSaving(true);
    try {
      const result = await api.post('/time-entries', {
        projectId,
        projectPhaseId: projectPhaseId || undefined,
        taskId: taskId || undefined,
        hours: Number(hours),
        date,
        description: description.trim() || undefined,
        employeeUserId: employeeUserId || undefined,
        overBudgetReason: isOverBudget ? overBudgetReason.trim() : undefined,
      });
      if (result?.overBudget) {
        toast.warning('Erfasst — Budget überschritten.');
      } else if (result?.kontingentWarning) {
        toast.warning(result.kontingentWarning);
      } else {
        toast.success('Zeit erfasst.');
      }
      onSaved?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 460, padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiClock size={18} color="#1a1a1a" />
            <span style={{ fontSize: 17, fontWeight: 700, color: '#1e293b' }}>Zeit erfassen</span>
          </div>
          <button onClick={onClose} style={btnIcon}><FiX size={14} /></button>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Projekt *</label>
            <select value={projectId} onChange={e => { setProjectId(e.target.value); setProjectPhaseId(''); }} style={inp}>
              <option value="">— Projekt wählen —</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Leistungsphase</label>
            <select value={projectPhaseId} onChange={e => {
              setProjectPhaseId(e.target.value);
              const ph = phases.find((p: any) => p.id === e.target.value);
              const bh = ph?.budgetHours ?? 0;
              if (ph && bh > 0) {
                const used = (ph.usedMinutes || 0) / 60;
                setPhaseKontingent({ budgetHours: bh, usedHours: Math.round(used * 10) / 10, remaining: Math.round((bh - used) * 10) / 10 });
              } else {
                setPhaseKontingent(null);
              }
            }} style={inp} disabled={!projectId}>
              <option value="">— Optional —</option>
              {phases.sort((a: any, b: any) => a.order - b.order).map((p: any) => <option key={p.id} value={p.id}>{String(p.order).padStart(2, '0')} - {p.name}</option>)}
            </select>
            {phaseKontingent && (
              <div style={{ marginTop: 6, padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: phaseKontingent.remaining <= 0 ? '#fef2f2' : phaseKontingent.remaining < phaseKontingent.budgetHours * 0.2 ? '#fffbeb' : '#f0fdf4', color: phaseKontingent.remaining <= 0 ? '#dc2626' : phaseKontingent.remaining < phaseKontingent.budgetHours * 0.2 ? '#d97706' : '#16a34a' }}>
                Kontingent: {phaseKontingent.usedHours}h / {phaseKontingent.budgetHours}h verbraucht — {phaseKontingent.remaining > 0 ? `${phaseKontingent.remaining}h ubrig` : `${Math.abs(phaseKontingent.remaining)}h uber Budget`}
              </div>
            )}
            {isOverBudget && (
              <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 8, background: '#fef2f2', border: '1.5px solid #fecaca' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', marginBottom: 6 }}>
                  ⚠ Budget überschritten — Begründung erforderlich
                </div>
                <textarea
                  value={overBudgetReason}
                  onChange={e => setOverBudgetReason(e.target.value)}
                  placeholder="z.B. Planänderung durch Kunden"
                  rows={2}
                  style={{ ...inp, resize: 'vertical', borderColor: reasonMissing ? '#dc2626' : '#fecaca', background: '#fff' }}
                  required
                />
              </div>
            )}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>Aufgabe</label>
            <select value={taskId} onChange={e => setTaskId(e.target.value)} style={inp} disabled={!projectId}>
              <option value="">— Optional —</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={lbl}>Stunden *</label>
              <input type="number" min="0.25" max="14" step="0.25" value={hours} onChange={e => setHours(e.target.value)} style={inp} placeholder="2.5" autoFocus />
            </div>
            <div>
              <label style={lbl}>Datum *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
            </div>
          </div>

          {isAdmin && (
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>Mitarbeiter (Admin)</label>
              <select value={employeeUserId} onChange={e => setEmployeeUserId(e.target.value)} style={inp}>
                <option value="">— Mich (Standard) —</option>
                {employees.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Kommentar</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Was wurde gemacht?"
              rows={2}
              style={{ ...inp, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Abbrechen</button>
            <button type="submit" disabled={saving || reasonMissing} style={{ ...btnPrimary, opacity: (saving || reasonMissing) ? 0.6 : 1, cursor: (saving || reasonMissing) ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Speichern…' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 };
const inp: React.CSSProperties = { width: '100%', padding: '9px 11px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit' };
const btnPrimary: React.CSSProperties = { padding: '9px 18px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const btnSecondary: React.CSSProperties = { padding: '9px 18px', background: '#fff', color: '#475569', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const btnIcon: React.CSSProperties = { padding: 6, background: 'transparent', color: '#94a3b8', border: 'none', borderRadius: 6, cursor: 'pointer' };
