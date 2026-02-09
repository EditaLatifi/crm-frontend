
"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../src/auth/AuthProvider';
import { getMe } from '../../src/api/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  meta?: string;
  createdAt?: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
}

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const { user: authUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let userData = null;
      if (authUser?.email) {
        try {
          userData = await getMe(authUser.email);
        } catch {
          userData = null;
        }
      }
      const tasksRes = await fetch('/api/tasks?assignedToMe=true');
      let tasksData: Task[] = [];
      try {
        const data = await tasksRes.json();
        tasksData = Array.isArray(data) ? data : [];
      } catch {
        tasksData = [];
      }
      setUser(userData);
      setTasks(tasksData);
      setLoading(false);
    }
    fetchData();
  }, [authUser]);

  return (
    <div style={{ padding: 40, maxWidth: 640, margin: '0 auto', background: '#f5f6f7', borderRadius: 12, boxShadow: '0 2px 8px #e5e7eb33' }}>
      <h1 style={{ marginBottom: 28, fontSize: 26, fontWeight: 700, color: '#222', letterSpacing: 0.5, borderBottom: '1px solid #e0e2e5', paddingBottom: 12 }}>Benutzer-Profil</h1>
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e0e2e5', padding: 28, marginBottom: 28 }}>
        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: '#222', marginBottom: 2 }}>{user.name}</div>
            <div style={{ fontSize: 15, color: '#444', marginBottom: 6 }}>E-Mail: <span style={{ fontWeight: 500 }}>{user.email}</span></div>
            <div style={{ fontSize: 14, color: '#666', fontWeight: 500, marginBottom: 6 }}>Rolle: {user.role}</div>
            {user.createdAt && <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>Dabei seit: {new Date(user.createdAt).toLocaleDateString()}</div>}
            {user.meta && <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{user.meta}</div>}
          </div>
        ) : (
          <div style={{ color: '#aaa', fontSize: 15 }}>Lade Benutzer...</div>
        )}
      </div>
      <div style={{ background: '#f7f8fa', borderRadius: 8, padding: 28, border: '1px solid #e0e2e5' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#222', marginBottom: 12 }}>Zugewiesene Aufgaben</div>
        {loading ? (
          <div style={{ color: '#aaa', fontSize: 14 }}>Lade Aufgaben...</div>
        ) : tasks.length === 0 ? (
          <div style={{ color: '#aaa', fontSize: 14 }}>Keine zugewiesenen Aufgaben.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tasks.map(task => (
              <li key={task.id} style={{ marginBottom: 14, fontSize: 14, color: '#222', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 600 }}>{task.title}</span>
                <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>{task.status}</span>
                {task.dueDate && <span style={{ fontSize: 13, color: '#888' }}>Fällig: {new Date(task.dueDate).toLocaleDateString()}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}