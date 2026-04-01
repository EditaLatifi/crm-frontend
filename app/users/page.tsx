"use client";
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../../src/auth/AuthProvider';
import { api } from '../../src/api/client';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import './users-desktop.css';
import './users-mobile.css';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
  lastLoginAt?: string;
};

export default function UsersPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Create form
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'USER', password: '' });
  const [showPw, setShowPw] = useState(false);

  // Edit modal
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Password reset modal
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [resetPw, setResetPw] = useState('');
  const [showResetPw, setShowResetPw] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchUsers = () => {
    api.get('/users').then((d: any) => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchUsers();
  }, [user]);

  /* ─ Create ─ */
  async function handleAddUser(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', newUser);
      setNewUser({ email: '', name: '', role: 'USER', password: '' });
      toast.success('Benutzer erstellt.');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Erstellen.');
    } finally {
      setLoading(false);
    }
  }

  /* ─ Edit ─ */
  function openEdit(u: User) {
    setEditForm({ name: u.name, email: u.email, role: u.role });
    setEditUser(u);
  }

  async function handleEdit(e: FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setEditSaving(true);
    try {
      await api.patch(`/users/${editUser.id}`, editForm);
      toast.success('Benutzer aktualisiert.');
      setEditUser(null);
      fetchUsers();
    } catch {
      toast.error('Fehler beim Aktualisieren.');
    } finally {
      setEditSaving(false);
    }
  }

  /* ─ Delete ─ */
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      toast.success('Benutzer gelöscht.');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Löschen.');
    } finally {
      setDeleting(false);
    }
  }

  /* ─ Password reset ─ */
  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    if (resetPw.length < 6) { toast.error('Mindestens 6 Zeichen.'); return; }
    setResetting(true);
    try {
      await api.post(`/users/${resetTarget.id}/reset-password`, { newPassword: resetPw });
      toast.success('Passwort zurückgesetzt.');
      setResetTarget(null);
      setResetPw('');
    } catch (err: any) {
      toast.error(err.message || 'Fehler.');
    } finally {
      setResetting(false);
    }
  }

  if (user?.role !== 'ADMIN') return <div className="users-container"><h2 className="users-title">Zugriff verweigert</h2></div>;

  const inputS: Record<string, any> = { width: '100%', padding: '8px 12px', borderRadius: 7, border: '1.5px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' };

  return (
    <div className="users-container" style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 className="users-title" style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: '0 0 24px' }}>Benutzerverwaltung</h1>

      {/* ─── Create form ─── */}
      <form className="users-form" onSubmit={handleAddUser} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '20px 24px', marginBottom: 28 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16 }}>Neuen Benutzer anlegen</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Name *</label>
            <input required value={newUser.name} onChange={e => setNewUser(f => ({ ...f, name: e.target.value }))} style={inputS} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>E-Mail *</label>
            <input type="email" required value={newUser.email} onChange={e => setNewUser(f => ({ ...f, email: e.target.value }))} style={inputS} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Rolle *</label>
            <select value={newUser.role} onChange={e => setNewUser(f => ({ ...f, role: e.target.value }))} style={inputS}>
              <option value="USER">Mitarbeiter</option>
              <option value="ADMIN">Admin/Management</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Passwort *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={newUser.password}
                onChange={e => setNewUser(f => ({ ...f, password: e.target.value }))}
                style={{ ...inputS, paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#64748b', padding: '2px 4px' }}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading}
          style={{ padding: '10px 24px', fontWeight: 700, fontSize: 14, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Wird hinzugefügt…' : 'Benutzer hinzufügen'}
        </button>
      </form>

      {/* ─── Users table ─── */}
      <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Alle Benutzer ({users.length})</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Name', 'E-Mail', 'Rolle', 'Erstellt am', 'Letzter Login', 'Aktionen'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isSelf = u.id === user?.id;
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>
                      {u.name}
                      {isSelf && <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 6 }}>(Du)</span>}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: u.role === 'ADMIN' ? '#7c3aed' : '#2563eb', background: u.role === 'ADMIN' ? '#f3e8ff' : '#eff6ff', borderRadius: 20, padding: '3px 10px' }}>
                        {u.role === 'ADMIN' ? 'Admin/Management' : 'Mitarbeiter'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('de-CH') : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(u)} style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Bearbeiten
                        </button>
                        <button onClick={() => { setResetTarget(u); setResetPw(''); setShowResetPw(false); }} style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #e2e8f0', background: '#fff', color: '#d97706', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Passwort
                        </button>
                        {!isSelf && (
                          <button onClick={() => setDeleteTarget(u)} style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            Löschen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Edit Modal ─── */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Benutzer bearbeiten">
        {editUser && (
          <form onSubmit={handleEdit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Name</label>
              <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={inputS} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>E-Mail</label>
              <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} style={inputS} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Rolle</label>
              <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} style={inputS}>
                <option value="USER">Mitarbeiter</option>
                <option value="ADMIN">Admin/Management</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEditUser(null)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 7, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Abbrechen</button>
              <button type="submit" disabled={editSaving} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', opacity: editSaving ? 0.7 : 1 }}>
                {editSaving ? 'Speichern…' : 'Speichern'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ─── Delete Confirmation Modal ─── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Benutzer löschen">
        {deleteTarget && (
          <div>
            <p style={{ fontSize: 14, color: '#374151', marginBottom: 20 }}>
              Möchtest du den Benutzer <b>{deleteTarget.name}</b> ({deleteTarget.email}) wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteTarget(null)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 7, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Abbrechen</button>
              <button onClick={handleDelete} disabled={deleting} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Löschen…' : 'Endgültig löschen'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── Password Reset Modal ─── */}
      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title="Passwort zurücksetzen">
        {resetTarget && (
          <form onSubmit={handleResetPassword}>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Neues Passwort für <b>{resetTarget.name}</b> festlegen:
            </p>
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <input
                type={showResetPw ? 'text' : 'password'}
                required
                minLength={6}
                value={resetPw}
                onChange={e => setResetPw(e.target.value)}
                placeholder="Neues Passwort (min. 6 Zeichen)"
                style={{ ...inputS, paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowResetPw(v => !v)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#64748b', padding: '2px 4px' }}
              >
                {showResetPw ? '🙈' : '👁️'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setResetTarget(null)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 7, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Abbrechen</button>
              <button type="submit" disabled={resetting} style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', opacity: resetting ? 0.7 : 1 }}>
                {resetting ? 'Zurücksetzen…' : 'Passwort zurücksetzen'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
