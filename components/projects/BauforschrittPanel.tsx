"use client";
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../src/api/client';
import { FiCheck, FiEdit3, FiSave, FiX, FiSettings, FiPlus, FiTrash2 } from 'react-icons/fi';

type Master = {
  id: string;
  name: string;
  order: number;
  isDefault: boolean;
  active: boolean;
};

type ProjMilestone = {
  id: string;
  milestoneId?: string | null;
  name?: string | null;
  dueDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  order: number;
  completed: boolean;
  completedAt?: string | null;
  completedByUserId?: string | null;
  comment?: string | null;
  milestone?: Master | null;
};

export default function BauforschrittPanel({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const [masters, setMasters] = useState<Master[]>([]);
  const [items, setItems] = useState<ProjMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedIds, setPickedIds] = useState<Set<string>>(new Set());
  const [savingPicker, setSavingPicker] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [savingAdd, setSavingAdd] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([
        api.get('/projects/milestones/master'),
        api.get(`/projects/${projectId}/milestones`),
      ]);
      setMasters(Array.isArray(m) ? m : []);
      setItems(Array.isArray(p) ? p : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [projectId]);

  const completedCount = items.filter(i => i.completed).length;
  const total = items.length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const remaining = total - completedCount;

  const openPicker = () => {
    setPickedIds(new Set(items.map(i => i.milestoneId).filter((id): id is string => !!id)));
    setPickerOpen(true);
  };

  const togglePick = (id: string) => {
    setPickedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const savePicker = async () => {
    setSavingPicker(true);
    try {
      await api.post(`/projects/${projectId}/milestones`, { milestoneIds: Array.from(pickedIds) });
      await loadAll();
      setPickerOpen(false);
    } finally {
      setSavingPicker(false);
    }
  };

  const toggleDone = async (item: ProjMilestone) => {
    await api.patch(`/projects/${projectId}/milestones/${item.id}`, { completed: !item.completed });
    loadAll();
  };

  const saveComment = async (item: ProjMilestone) => {
    await api.patch(`/projects/${projectId}/milestones/${item.id}`, {
      completed: item.completed,
      comment: commentDraft,
    });
    setEditingComment(null);
    setCommentDraft('');
    loadAll();
  };

  const addMilestone = async () => {
    if (!newName.trim()) return;
    setSavingAdd(true);
    try {
      await api.post(`/projects/${projectId}/milestones/add`, {
        name: newName.trim(),
        startDate: newStart || undefined,
        endDate: newEnd || undefined,
        dueDate: newDue || undefined,
      });
      setNewName(''); setNewDue(''); setNewStart(''); setNewEnd(''); setAddOpen(false);
      await loadAll();
    } finally {
      setSavingAdd(false);
    }
  };

  const deleteMilestone = async (item: ProjMilestone) => {
    await api.delete(`/projects/${projectId}/milestones/${item.id}`);
    loadAll();
  };

  const milestoneName = (m: ProjMilestone) => m.name || m.milestone?.name || '';

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Bauforschritt</div>
        {canEdit && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setAddOpen(o => !o)} style={btnSecondary}>
              <FiPlus size={12} /> Meilenstein
            </button>
            <button onClick={openPicker} style={btnSecondary}>
              <FiSettings size={12} /> Schritte auswählen
            </button>
          </div>
        )}
      </div>

      {/* Ad-hoc milestone add form (name + Beginn/Ende dates) */}
      {canEdit && addOpen && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 3 }}>Meilenstein</div>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="z.B. Aushub"
              style={{ width: '100%', fontSize: 13, padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7, boxSizing: 'border-box' }}
              autoFocus
            />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 3 }}>Beginn</div>
            <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} style={{ fontSize: 13, padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7 }} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 3 }}>Ende</div>
            <input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)} style={{ fontSize: 13, padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 7 }} />
          </div>
          <button onClick={addMilestone} disabled={savingAdd || !newName.trim()} style={btnPrimary}>
            {savingAdd ? 'Speichern…' : 'Hinzufügen'}
          </button>
        </div>
      )}

      {loading && <div style={{ color: '#94a3b8', fontSize: 12 }}>Wird geladen…</div>}

      {!loading && total === 0 && (
        <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
          Noch keine Bauschritte ausgewählt.{' '}
          {canEdit && <button onClick={openPicker} style={{ ...btnLink, marginLeft: 4 }}>Jetzt auswählen</button>}
        </div>
      )}

      {!loading && total > 0 && (
        <>
          {/* Progress bar */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                {completedCount} von {total} abgeschlossen
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: percent === 100 ? '#16a34a' : '#3b82f6' }}>{percent}%</span>
            </div>
            <div style={{ height: 8, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${percent}%`,
                background: percent === 100 ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#3b82f6,#6366f1)',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              Verbleibend: {remaining}
            </div>
          </div>

          {/* Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map(item => {
              const isEditing = editingComment === item.id;
              return (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', padding: '10px 12px', borderRadius: 8, background: item.completed ? '#f0fdf4' : '#f8fafc', border: `1px solid ${item.completed ? '#bbf7d0' : '#e5e7eb'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      disabled={!canEdit}
                      onClick={() => toggleDone(item)}
                      style={{
                        width: 20, height: 20, borderRadius: 4,
                        border: `2px solid ${item.completed ? '#16a34a' : '#cbd5e1'}`,
                        background: item.completed ? '#16a34a' : '#fff',
                        cursor: canEdit ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.completed && <FiCheck size={12} color="#fff" />}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', textDecoration: item.completed ? 'line-through' : 'none' }}>
                        {milestoneName(item)}
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 2, flexWrap: 'wrap' }}>
                        {(item.startDate || item.endDate) && (
                          <span style={{ fontSize: 11, color: '#64748b' }}>
                            {item.startDate ? new Date(item.startDate).toLocaleDateString('de-CH') : '—'} – {item.endDate ? new Date(item.endDate).toLocaleDateString('de-CH') : '—'}
                          </span>
                        )}
                        {item.dueDate && (
                          <span style={{ fontSize: 11, color: !item.completed && new Date(item.dueDate) < new Date() ? '#dc2626' : '#64748b' }}>
                            Fällig: {new Date(item.dueDate).toLocaleDateString('de-CH')}
                          </span>
                        )}
                        {item.completed && item.completedAt && (
                          <span style={{ fontSize: 11, color: '#16a34a' }}>
                            ✓ {new Date(item.completedAt).toLocaleDateString('de-CH')}
                          </span>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => {
                          if (isEditing) { setEditingComment(null); setCommentDraft(''); }
                          else { setEditingComment(item.id); setCommentDraft(item.comment || ''); }
                        }}
                        style={{ ...btnIcon }}
                        title="Kommentar"
                      >
                        <FiEdit3 size={11} />
                      </button>
                    )}
                    {canEdit && (
                      <button onClick={() => deleteMilestone(item)} style={{ ...btnIcon }} title="Löschen">
                        <FiTrash2 size={11} />
                      </button>
                    )}
                  </div>

                  {/* Comment row (read or edit) */}
                  {!isEditing && item.comment && (
                    <div style={{ marginTop: 8, marginLeft: 30, fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
                      {item.comment}
                    </div>
                  )}

                  {isEditing && (
                    <div style={{ marginTop: 8, marginLeft: 30, display: 'flex', gap: 6 }}>
                      <input
                        value={commentDraft}
                        onChange={e => setCommentDraft(e.target.value)}
                        placeholder="Kommentar zum Schritt…"
                        style={{ flex: 1, fontSize: 12, padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: 6 }}
                        autoFocus
                      />
                      <button onClick={() => saveComment(item)} style={btnPrimarySm}><FiSave size={11} /></button>
                      <button onClick={() => { setEditingComment(null); setCommentDraft(''); }} style={btnIcon}><FiX size={11} /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Picker modal */}
      {pickerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, maxWidth: 520, width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Bauschritte auswählen</div>
              <button onClick={() => setPickerOpen(false)} style={btnIcon}><FiX size={14} /></button>
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
              Wähle aus, welche Schritte für dieses Projekt gelten:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
              {masters.map(m => {
                const checked = pickedIds.has(m.id);
                return (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 7, cursor: 'pointer', background: checked ? '#eff6ff' : '#f8fafc', border: `1px solid ${checked ? '#3b82f6' : '#e5e7eb'}` }}>
                    <input type="checkbox" checked={checked} onChange={() => togglePick(m.id)} style={{ width: 16, height: 16 }} />
                    <span style={{ fontSize: 13, color: '#1e293b', fontWeight: checked ? 600 : 500 }}>{m.name}</span>
                  </label>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setPickerOpen(false)} style={btnSecondary}>Abbrechen</button>
              <button onClick={savePicker} disabled={savingPicker} style={btnPrimary}>
                {savingPicker ? 'Speichern…' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
const btnPrimarySm: React.CSSProperties = { ...btnPrimary, padding: '5px 10px', fontSize: 11 };
const btnSecondary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
  background: '#fff', color: '#475569', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
};
const btnIcon: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 6,
  background: 'transparent', color: '#64748b', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer',
};
const btnLink: React.CSSProperties = {
  background: 'none', border: 'none', color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer', fontSize: 13, padding: 0,
};
