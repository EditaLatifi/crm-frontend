"use client";
import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../../../../src/api/client';
import { useAuth } from '../../../../src/auth/AuthProvider';
import { useToast } from '../../../../components/ui/Toast';
import { FiPlus, FiTrash2, FiX, FiSave, FiEdit2 } from 'react-icons/fi';

type Phase = { name: string; description?: string; order: number; budgetHours?: number | null };
type BudgetItem = { category: string; description: string; estimatedCost: number; phase?: string };
type Template = {
  id: string;
  name: string;
  type: string;
  description?: string;
  defaultPhases: Phase[];
  defaultMilestoneIds: string[];
  defaultBudgetItems?: BudgetItem[];
  active: boolean;
};

const BUDGET_CATEGORIES = ['HONORARE', 'ROHBAU', 'ELEKTRO', 'SANITAER', 'HEIZUNG', 'FASSADE', 'DACH', 'INNENAUSBAU', 'UMGEBUNG', 'RESERVE', 'SONSTIGES'];
type Milestone = { id: string; name: string; order: number; active: boolean };

const TYPE_OPTIONS = [
  { value: 'HOUSE',                   label: 'Haus' },
  { value: 'APARTMENT',               label: 'Wohnung' },
  { value: 'RENOVATION',              label: 'Renovation' },
  { value: 'COMMERCIAL',              label: 'Gewerbe' },
  { value: 'CUSTOM',                  label: 'Sonstiges' },
  { value: 'ARCHITECTURE',            label: 'Architektur' },
  { value: 'INTERIOR_DESIGN',         label: 'Innenarchitektur' },
  { value: 'CONSTRUCTION_MANAGEMENT', label: 'Bauleitung' },
  { value: 'VISUALIZATION',           label: 'Visualisierung' },
  { value: 'REAL_ESTATE',             label: 'Immobilien' },
  { value: 'DIGITIZATION',            label: 'Digitalisierung' },
];

export default function AdminTemplatesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, m] = await Promise.all([
        api.get('/projects/templates'),
        api.get('/projects/milestones/master'),
      ]);
      setTemplates(Array.isArray(t) ? t : []);
      setMilestones(Array.isArray(m) ? m : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.role === 'ADMIN') load(); }, [user]);

  const remove = async (id: string) => {
    if (!confirm('Vorlage deaktivieren?')) return;
    await api.delete(`/projects/templates/${id}`);
    toast.success('Deaktiviert.');
    load();
  };

  if (user?.role !== 'ADMIN') {
    return <div style={{ padding: 32 }}><h2>Zugriff verweigert</h2></div>;
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Projektvorlagen</h1>
          <div style={{ color: '#64748b', fontSize: 13 }}>
            Vorlagen mit Standard-Phasen und -Bauschritten für neue Projekte.
          </div>
        </div>
        <button onClick={() => setCreating(true)} style={btnPrimary}>
          <FiPlus size={13} /> Neue Vorlage
        </button>
      </div>

      {loading && <div style={{ color: '#94a3b8' }}>Wird geladen…</div>}

      {!loading && templates.length === 0 && !creating && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          Noch keine Vorlagen erstellt.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {templates.map(t => (
          <div key={t.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {TYPE_OPTIONS.find(o => o.value === t.type)?.label || t.type} ·{' '}
                  {(t.defaultPhases || []).length} Phasen ·{' '}
                  {(t.defaultMilestoneIds || []).length} Bauschritte ·{' '}
                  {(t.defaultBudgetItems || []).length} Budget-Posten
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditing(t)} style={btnSecondary}><FiEdit2 size={12} /> Bearbeiten</button>
                <button onClick={() => remove(t.id)} style={btnDanger}><FiTrash2 size={12} /></button>
              </div>
            </div>
            {t.description && <div style={{ fontSize: 13, color: '#475569', marginTop: 10 }}>{t.description}</div>}
          </div>
        ))}
      </div>

      {(creating || editing) && (
        <TemplateModal
          initial={editing}
          milestones={milestones}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function TemplateModal({
  initial, milestones, onClose, onSaved,
}: { initial: Template | null; milestones: Milestone[]; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [name, setName] = useState(initial?.name || '');
  const [type, setType] = useState(initial?.type || 'ARCHITECTURE');
  const [description, setDescription] = useState(initial?.description || '');
  const [phases, setPhases] = useState<Phase[]>(initial?.defaultPhases || []);
  const [pickedMilestones, setPickedMilestones] = useState<Set<string>>(new Set(initial?.defaultMilestoneIds || []));
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(initial?.defaultBudgetItems || []);
  const [saving, setSaving] = useState(false);

  const addPhase = () => setPhases(p => [...p, { name: '', description: '', order: p.length + 1 }]);
  const removePhase = (idx: number) => setPhases(p => p.filter((_, i) => i !== idx).map((x, i) => ({ ...x, order: i + 1 })));
  const updatePhase = (idx: number, patch: Partial<Phase>) => setPhases(p => p.map((x, i) => i === idx ? { ...x, ...patch } : x));

  const addBudget = () => setBudgetItems(b => [...b, { category: 'SONSTIGES', description: '', estimatedCost: 0 }]);
  const removeBudget = (idx: number) => setBudgetItems(b => b.filter((_, i) => i !== idx));
  const updateBudget = (idx: number, patch: Partial<BudgetItem>) => setBudgetItems(b => b.map((x, i) => i === idx ? { ...x, ...patch } : x));

  const toggleMilestone = (id: string) => {
    setPickedMilestones(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const save = async () => {
    if (!name.trim()) { toast.error('Name ist erforderlich.'); return; }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        description: description.trim() || null,
        defaultPhases: phases.filter(p => p.name.trim()),
        defaultMilestoneIds: Array.from(pickedMilestones),
        defaultBudgetItems: budgetItems.filter(b => b.description.trim()),
      };
      if (initial) {
        await api.patch(`/projects/templates/${initial.id}`, payload);
      } else {
        await api.post('/projects/templates', payload);
      }
      toast.success('Gespeichert.');
      onSaved();
    } catch {
      toast.error('Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, maxWidth: 720, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{initial ? 'Vorlage bearbeiten' : 'Neue Vorlage'}</div>
          <button onClick={onClose} style={btnIcon}><FiX size={14} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inp} placeholder="z.B. Einfamilienhaus" />
          </div>
          <div>
            <label style={lbl}>Typ</label>
            <select value={type} onChange={e => setType(e.target.value)} style={inp}>
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>Beschreibung</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...inp, minHeight: 60, resize: 'vertical' }} />
        </div>

        {/* Phases */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={section}>Standard-Phasen</span>
            <button onClick={addPhase} style={btnSecondarySm}><FiPlus size={11} /> Phase</button>
          </div>
          {phases.length === 0 && (
            <div style={{ fontSize: 12, color: '#94a3b8', padding: '12px 0' }}>Keine Phasen definiert.</div>
          )}
          {phases.map((p, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#94a3b8', width: 22 }}>{String(idx + 1).padStart(2, '0')}</span>
              <input
                value={p.name}
                onChange={e => updatePhase(idx, { name: e.target.value })}
                placeholder="Phasen-Name"
                style={{ ...inp, flex: 2 }}
              />
              <input
                value={p.description || ''}
                onChange={e => updatePhase(idx, { description: e.target.value })}
                placeholder="Beschreibung (optional)"
                style={{ ...inp, flex: 3 }}
              />
              <input
                type="number" min="0" step="0.5"
                value={p.budgetHours ?? ''}
                onChange={e => updatePhase(idx, { budgetHours: e.target.value ? Number(e.target.value) : null })}
                placeholder="Std."
                style={{ ...inp, width: 70 }}
              />
              <button onClick={() => removePhase(idx)} style={btnIconDanger}><FiTrash2 size={12} /></button>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div style={{ marginBottom: 18 }}>
          <span style={section}>Standard-Bauschritte</span>
          {milestones.length === 0 ? (
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
              Keine Bauschritte definiert. Lege sie zuerst unter <strong>/admin/milestones</strong> an.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 8 }}>
              {milestones.map(m => {
                const checked = pickedMilestones.has(m.id);
                return (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, cursor: 'pointer', background: checked ? '#eff6ff' : '#f8fafc', border: `1px solid ${checked ? '#3b82f6' : '#e5e7eb'}`, fontSize: 12 }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleMilestone(m.id)} />
                    <span style={{ color: '#1e293b' }}>{m.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Budget structure */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={section}>Standard-Budgetposten</span>
            <button onClick={addBudget} style={btnSecondarySm}><FiPlus size={11} /> Posten</button>
          </div>
          {budgetItems.length === 0 && (
            <div style={{ fontSize: 12, color: '#94a3b8', padding: '12px 0' }}>Keine Budgetposten definiert.</div>
          )}
          {budgetItems.map((b, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <select value={b.category} onChange={e => updateBudget(idx, { category: e.target.value })} style={{ ...inp, width: 130 }}>
                {BUDGET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                value={b.description}
                onChange={e => updateBudget(idx, { description: e.target.value })}
                placeholder="Beschreibung"
                style={{ ...inp, flex: 2 }}
              />
              <input
                type="number" min="0" step="100"
                value={b.estimatedCost}
                onChange={e => updateBudget(idx, { estimatedCost: Number(e.target.value) })}
                placeholder="Betrag"
                style={{ ...inp, width: 110 }}
              />
              <input
                value={b.phase || ''}
                onChange={e => updateBudget(idx, { phase: e.target.value })}
                placeholder="Phase (opt.)"
                style={{ ...inp, width: 100 }}
              />
              <button onClick={() => removeBudget(idx)} style={btnIconDanger}><FiTrash2 size={12} /></button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          <button onClick={onClose} style={btnSecondary}>Abbrechen</button>
          <button onClick={save} disabled={saving} style={btnPrimary}>
            <FiSave size={12} /> {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 };
const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, boxSizing: 'border-box', background: '#fff' };
const section: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' };
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const btnSecondary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#fff', color: '#475569', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const btnSecondarySm: React.CSSProperties = { ...btnSecondary, padding: '4px 8px', fontSize: 11 };
const btnDanger: React.CSSProperties = { padding: 6, background: '#fff', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const btnIcon: React.CSSProperties = { padding: 6, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, color: '#64748b', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const btnIconDanger: React.CSSProperties = { ...btnIcon, color: '#dc2626', borderColor: '#fecaca' };
