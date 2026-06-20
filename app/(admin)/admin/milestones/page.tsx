"use client";
import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../../../../src/api/client';
import { useAuth } from '../../../../src/auth/AuthProvider';
import { useToast } from '../../../../components/ui/Toast';
import AdminConfigTabs from '../../../../components/admin/AdminConfigTabs';
import { FiPlus, FiEdit2, FiTrash2, FiArrowUp, FiArrowDown, FiCheck, FiX } from 'react-icons/fi';

type Milestone = {
  id: string;
  name: string;
  order: number;
  isDefault: boolean;
  active: boolean;
};

export default function AdminMilestonesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get('/projects/milestones/master');
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.role === 'ADMIN') load(); }, [user]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await api.post('/projects/milestones/master', { name: newName.trim() });
      setNewName('');
      toast.success('Bauschritt erstellt.');
      load();
    } catch {
      toast.error('Fehler beim Erstellen.');
    }
  };

  const startEdit = (m: Milestone) => { setEditId(m.id); setEditName(m.name); };
  const cancelEdit = () => { setEditId(null); setEditName(''); };
  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await api.patch(`/projects/milestones/master/${id}`, { name: editName.trim() });
      cancelEdit();
      toast.success('Aktualisiert.');
      load();
    } catch {
      toast.error('Fehler beim Speichern.');
    }
  };

  const move = async (m: Milestone, dir: -1 | 1) => {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(x => x.id === m.id);
    const target = sorted[idx + dir];
    if (!target) return;
    try {
      await Promise.all([
        api.patch(`/projects/milestones/master/${m.id}`, { order: target.order }),
        api.patch(`/projects/milestones/master/${target.id}`, { order: m.order }),
      ]);
      load();
    } catch {
      toast.error('Fehler beim Verschieben.');
    }
  };

  const deactivate = async (m: Milestone) => {
    if (!confirm(`Bauschritt "${m.name}" deaktivieren?`)) return;
    try {
      await api.delete(`/projects/milestones/master/${m.id}`);
      toast.success('Deaktiviert.');
      load();
    } catch {
      toast.error('Fehler.');
    }
  };

  const toggleDefault = async (m: Milestone) => {
    try {
      await api.patch(`/projects/milestones/master/${m.id}`, { isDefault: !m.isDefault });
      load();
    } catch {
      toast.error('Fehler.');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div style={{ padding: 32 }}><h2>Zugriff verweigert</h2></div>;
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
      <AdminConfigTabs />
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Bauforschritt – Stammdaten</h1>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>
        Verwalte die Liste der verfügbaren Bauschritte. Aktivierte Schritte können in jedem Projekt ausgewählt werden.
      </p>

      {/* Create */}
      <form onSubmit={create} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18, marginBottom: 22, display: 'flex', gap: 10 }}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Neuer Bauschritt z.B. ‚Fertig Sanitär'"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
        />
        <button type="submit" style={btnPrimary}><FiPlus size={13} /> Hinzufügen</button>
      </form>

      {/* List */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        {loading && <div style={{ padding: 20, color: '#94a3b8' }}>Wird geladen…</div>}
        {!loading && items.length === 0 && (
          <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Keine Bauschritte definiert.</div>
        )}
        {!loading && items.map((m, idx) => {
          const isEditing = editId === m.id;
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: idx === items.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', minWidth: 24 }}>{String(m.order + 1).padStart(2, '0')}</span>
              {isEditing ? (
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #3b82f6', fontSize: 13 }}
                  autoFocus
                />
              ) : (
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{m.name}</span>
              )}

              <label style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="checkbox" checked={m.isDefault} onChange={() => toggleDefault(m)} />
                Standard
              </label>

              {isEditing ? (
                <>
                  <button onClick={() => saveEdit(m.id)} style={btnIconOk}><FiCheck size={13} /></button>
                  <button onClick={cancelEdit} style={btnIcon}><FiX size={13} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => move(m, -1)} disabled={idx === 0} style={btnIcon} title="Nach oben"><FiArrowUp size={12} /></button>
                  <button onClick={() => move(m, 1)} disabled={idx === items.length - 1} style={btnIcon} title="Nach unten"><FiArrowDown size={12} /></button>
                  <button onClick={() => startEdit(m)} style={btnIcon} title="Bearbeiten"><FiEdit2 size={12} /></button>
                  <button onClick={() => deactivate(m)} style={btnIconDanger} title="Deaktivieren"><FiTrash2 size={12} /></button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
  background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
const btnIcon: React.CSSProperties = {
  padding: 6, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6,
  color: '#64748b', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};
const btnIconOk: React.CSSProperties = { ...btnIcon, color: '#16a34a', borderColor: '#86efac' };
const btnIconDanger: React.CSSProperties = { ...btnIcon, color: '#dc2626', borderColor: '#fecaca' };
