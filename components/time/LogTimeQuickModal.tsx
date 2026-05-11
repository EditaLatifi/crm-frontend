"use client";
import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../../src/api/client';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../src/auth/AuthProvider';
import { FiX, FiClock } from 'react-icons/fi';

type Project = { id: string; name: string };
type Phase = { id: string; name: string; order: number };
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    api.get('/projects').then((d: any) => setProjects(Array.isArray(d) ? d.map((p: any) => ({ id: p.id, name: p.name })) : [])).catch(() => {});
    if (isAdmin) {
      api.get('/users').then((d: any) => setEmployees(Array.isArray(d) ? d : [])).catch(() => {});
    }
    setProjectId(''); setProjectPhaseId(''); setTaskId(''); setHours(''); setDescription(''); setEmployeeUserId('');
    setDate(new Date().toISOString().slice(0, 10));
  }, [open, isAdmin]);

  useEffect(() => {
    if (!projectId) { setPhases([]); setTasks([]); return; }
    api.get(`/projects/${projectId}`).then((d: any) => {
      const list = Array.isArray(d?.phases) ? d.phases : [];
      setPhases(list.map((p: any) => ({ id: p.id, name: p.name, order: p.order })));
    }).catch(() => setPhases([]));
    api.get(`/tasks`).then((d: any) => {
      const list = Array.isArray(d) ? d : [];
      setTasks(list.filter((t: any) => t.projectId === projectId).map((t: any) => ({ id: t.id, title: t.title, projectId: t.projectId })));
    }).catch(() => setTasks([]));
  }, [projectId]);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId) { toast.error('Projekt ist erforderlich.'); return; }
    if (!hours || Number(hours) <= 0) { toast.error('Stunden sind erforderlich.'); return; }
    if (Number(hours) > 14) { toast.error('Maximale Erfassung: 14 Stunden pro Eintrag.'); return; }
    if (Number(hours) > 10) { toast.warning('Hinweis: Mehr als 10 Stunden erfasst.'); }
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
      });
      if (result?.kontingentWarning) {
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
            <select value={projectPhaseId} onChange={e => setProjectPhaseId(e.target.value)} style={inp} disabled={!projectId}>
              <option value="">— Optional —</option>
              {phases.sort((a, b) => a.order - b.order).map(p => <option key={p.id} value={p.id}>{String(p.order).padStart(2, '0')} – {p.name}</option>)}
            </select>
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
            <button type="submit" disabled={saving} style={btnPrimary}>
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
