"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../src/auth/AuthProvider';
import { api } from '../../src/api/client';
import './users-desktop.css';
import './users-mobile.css';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
};

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<{ email: string; name: string; role: string; password: string }>({ email: '', name: '', role: 'USER', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      api.get('/api/users').then((data) => {
        console.log('[UsersPage] GET /api/users result:', data);
        setUsers(data);
        setAllUsers(data);
      });
    }
  }, [user]);

  const handleAddUser = async () => {
    setLoading(true);
    try {
      const created = await api.post('/api/users', newUser);
      setUsers((prev) => [...prev, created]);
      setNewUser({ email: '', name: '', role: 'USER', password: '' });
      // Fetch all users again to refresh the second table
      const fresh = await api.get('/api/users');
      console.log('[UsersPage] After add, GET /api/users result:', fresh);
      setAllUsers(fresh);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN')
    return (
      <div className="users-container">
        <h2 className="users-title">Access Denied</h2>
      </div>
    );

  return (
    <div className="users-container">
      <h1 className="users-title">Benutzer-Verwaltig</h1>
      <form
        className="users-form"
        onSubmit={e => {
          e.preventDefault();
          handleAddUser();
        }}
      >
        <label htmlFor="email" style={{ fontWeight: 500 }}>E-Mail</label>
        <input
          id="email"
          type="email"
          value={newUser.email}
          onChange={e => setNewUser({ ...newUser, email: e.target.value })}
          required
          style={{ marginBottom: 16, width: '100%' }}
        />
        <label htmlFor="name" style={{ fontWeight: 500 }}>Name</label>
        <input
          id="name"
          type="text"
          value={newUser.name}
          onChange={e => setNewUser({ ...newUser, name: e.target.value })}
          required
          style={{ marginBottom: 16, width: '100%' }}
        />
        <label htmlFor="role" style={{ fontWeight: 500 }}>Rolle</label>
        <input
          id="role"
          type="text"
          value={newUser.role}
          onChange={e => setNewUser({ ...newUser, role: e.target.value })}
          required
          style={{ marginBottom: 16, width: '100%' }}
        />
        <label htmlFor="password" style={{ fontWeight: 500 }}>Passwort</label>
        <input
          id="password"
          type="password"
          value={newUser.password}
          onChange={e => setNewUser({ ...newUser, password: e.target.value })}
          required
          style={{ marginBottom: 24, width: '100%' }}
        />
        <button
          type="submit"
          className="users-add-btn"
          disabled={loading}
          style={{ width: '100%', padding: '12px 0', fontWeight: 600, fontSize: 16, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Am Hinzuefüege...' : 'Benutzer hinzuefüege'}
        </button>
      </form>
      <h2 className="users-title" style={{ fontSize: 22, margin: '32px 0 18px 0', fontWeight: 700 }}>Alli Benutzer</h2>
      <div className="users-table" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ fontWeight: 600 }}>Name</th>
              <th style={{ fontWeight: 600 }}>E-Mail</th>
              <th style={{ fontWeight: 600 }}>Rolle</th>
              <th style={{ fontWeight: 600 }}>Erstellt am</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 400 }}>{u.name}</td>
                <td style={{ fontWeight: 400 }}>{u.email}</td>
                <td style={{ fontWeight: 400 }}>{u.role}</td>
                <td style={{ fontWeight: 400 }}>{u.createdAt ? new Date(u.createdAt).toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
