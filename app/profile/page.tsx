"use client";
import React, { useEffect, useState } from 'react';
import './profile-mobile.css';
import { useAuth } from '../../src/auth/AuthProvider';
import { api, getMe } from '../../src/api/client';
import { ROLE_LABELS, TASK_STATUS_LABELS } from '../../src/lib/labels';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 7,
  border: '1.5px solid #d1d5db', fontSize: 14, boxSizing: 'border-box',
};

export default function UserProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit profile
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Change password
  const [pwOpen, setPwOpen] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    let userData: User | null = null;
    if (authUser?.email) {
      try { userData = await getMe(); } catch { userData = null; }
    }
    let tasksData: Task[] = [];
    try {
      const data = await api.get('/tasks?assignedToMe=true');
      tasksData = Array.isArray(data) ? data : [];
    } catch { tasksData = []; }
    setUser(userData);
    setTasks(tasksData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [authUser]);

  const openEdit = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditError('');
    setEditOpen(true);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) { setEditError('Name ist erforderlich'); return; }
    if (!editEmail.trim()) { setEditError('E-Mail ist erforderlich'); return; }
    setEditSaving(true);
    setEditError('');
    try {
      const updated = await api.patch('/users/profile', { name: editName.trim(), email: editEmail.trim() });
      setUser(u => u ? { ...u, name: updated.name, email: updated.email } : u);
      setEditOpen(false);
    } catch (err: any) {
      setEditError(err.message || 'Fehler beim Speichern');
    } finally {
      setEditSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (!oldPw) { setPwError('Bitte aktuelles Passwort eingeben'); return; }
    if (!newPw || newPw.length < 6) { setPwError('Neues Passwort muss mindestens 6 Zeichen haben'); return; }
    if (newPw !== confirmPw) { setPwError('Passwörter stimmen nicht überein'); return; }
    setPwSaving(true);
    try {
      await api.post('/users/change-password', { oldPassword: oldPw, newPassword: newPw });
      setPwSuccess('Passwort erfolgreich geändert.');
      setOldPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => { setPwOpen(false); setPwSuccess(''); }, 1500);
    } catch (err: any) {
      setPwError(err.message || 'Fehler beim Ändern des Passworts');
    } finally {
      setPwSaving(false);
    }
  };

  const STATUS_COLOR: Record<string, string> = {
    OPEN: '#2563eb', IN_PROGRESS: '#f59e0b', DONE: '#22c55e', PENDING: '#94a3b8',
  };

  return (
    <div className="profile-container" style={{ padding: '32px 24px', maxWidth: 640, margin: '0 auto' }}>
      <h1 className="profile-title" style={{ marginBottom: 24, fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Mein Profil</h1>

      {/* Profile card */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '24px 28px', marginBottom: 20 }}>
        {loading ? (
          <div style={{ color: '#94a3b8', fontSize: 14 }}>Lade Profil...</div>
        ) : user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 20 }}>
                  {user.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{user.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{ROLE_LABELS[user.role] ?? user.role}</div>
                </div>
              </div>
              <button onClick={openEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Bearbeiten
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>E-Mail</div>
                <div style={{ fontSize: 14, color: '#1e293b' }}>{user.email}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Dabei seit</div>
                <div style={{ fontSize: 14, color: '#1e293b' }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('de-CH') : '—'}</div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 14 }}>Profil konnte nicht geladen werden.</div>
        )}
      </div>

      {/* Password change */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '20px 28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Passwort</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Passwort ändern</div>
          </div>
          <button onClick={() => { setPwOpen(o => !o); setPwError(''); setPwSuccess(''); }} style={{ padding: '7px 16px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#f8fafc', color: '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            {pwOpen ? 'Schliessen' : 'Ändern'}
          </button>
        </div>
        {pwOpen && (
          <form onSubmit={handlePasswordChange} style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Aktuelles Passwort</label>
              <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} style={inputStyle} autoComplete="current-password" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Neues Passwort</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={inputStyle} autoComplete="new-password" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Neues Passwort bestätigen</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={inputStyle} autoComplete="new-password" />
            </div>
            {pwError && <div style={{ color: '#dc2626', fontSize: 13 }}>{pwError}</div>}
            {pwSuccess && <div style={{ color: '#16a34a', fontSize: 13 }}>{pwSuccess}</div>}
            <button type="submit" disabled={pwSaving} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14, cursor: pwSaving ? 'not-allowed' : 'pointer', opacity: pwSaving ? 0.7 : 1, alignSelf: 'flex-start' }}>
              {pwSaving ? 'Speichern...' : 'Passwort speichern'}
            </button>
          </form>
        )}
      </div>

      {/* Assigned tasks */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '20px 28px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>
          Meine Aufgaben ({tasks.length})
        </div>
        {loading ? (
          <div style={{ color: '#94a3b8', fontSize: 14 }}>Lade Aufgaben...</div>
        ) : tasks.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: 14 }}>Keine zugewiesenen Aufgaben.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.map(task => (
              <Link key={task.id} href={`/tasks/${task.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, border: '1px solid #f1f5f9', background: '#f8fafc', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#f8fafc')}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{task.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {task.dueDate && (
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>Fällig: {new Date(task.dueDate).toLocaleDateString('de-CH')}</span>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: (STATUS_COLOR[task.status] || '#94a3b8') + '20', color: STATUS_COLOR[task.status] || '#94a3b8' }}>
                      {TASK_STATUS_LABELS[task.status] ?? task.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Profil bearbeiten</div>
            <form onSubmit={handleEditSave}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>E-Mail</label>
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={inputStyle} required />
                </div>
                {editError && <div style={{ color: '#dc2626', fontSize: 13 }}>{editError}</div>}
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditOpen(false)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
                <button type="submit" disabled={editSaving} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 13, cursor: editSaving ? 'not-allowed' : 'pointer', opacity: editSaving ? 0.7 : 1 }}>
                  {editSaving ? 'Speichern...' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
