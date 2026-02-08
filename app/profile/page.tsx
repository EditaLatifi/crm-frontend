
"use client";
import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  meta?: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
}

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/users/me').then(async res => {
        try {
          const data = await res.json();
          return data;
        } catch { return null; }
      }),
      fetch('/api/tasks?assignedToMe=true').then(async res => {
        try {
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        } catch { return []; }
      })
    ]).then(([userData, tasksData]) => {
      setUser(userData);
      setTasks(tasksData);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ padding: 32, maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 32, fontSize: 22, fontWeight: 700, color: '#23272f' }}>Profile</h1>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 32, display: 'flex', alignItems: 'center', gap: 32, marginBottom: 32 }}>
        {user ? (
          <>
            <img src={user.avatarUrl || '/avatar.svg'} alt="avatar" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', background: '#f3f4f6', border: '2px solid #e5e7eb' }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#23272f', marginBottom: 4 }}>{user.name}</div>
              <div style={{ fontSize: 15, color: '#64748b', marginBottom: 8 }}>{user.email}</div>
              <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 600, marginBottom: 8 }}>{user.role}</div>
              {user.meta && <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{user.meta}</div>}
              {user.role === 'ADMIN' ? (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#23272f', marginBottom: 8 }}>Admin Actions</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: 8, fontSize: 14, color: '#2563eb' }}>View all users</li>
                    <li style={{ marginBottom: 8, fontSize: 14, color: '#2563eb' }}>Manage roles</li>
                    <li style={{ marginBottom: 8, fontSize: 14, color: '#2563eb' }}>Access audit logs</li>
                  </ul>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div style={{ color: '#888', fontSize: 15 }}>Loading user...</div>
        )}
      </div>
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#23272f', marginBottom: 16 }}>Assigned Tasks</div>
        {loading ? (
          <div style={{ color: '#888', fontSize: 14 }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={{ color: '#888', fontSize: 14 }}>No assigned tasks.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tasks.map(task => (
              <li key={task.id} style={{ marginBottom: 18, padding: 0, fontSize: 15, color: '#23272f', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 600 }}>{task.title}</span>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{task.status}</span>
                {task.dueDate && <span style={{ fontSize: 13, color: '#94a3b8' }}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}