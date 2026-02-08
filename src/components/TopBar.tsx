// src/components/TopBar.tsx
import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import TimerWidget from './TopBar/TimerWidget';

export default function TopBar() {
  const { user, logout } = useAuth();
  return (
    <header className="flex items-center justify-between h-14 px-6 border-b bg-white">
      <div className="font-bold text-lg tracking-tight">CRM</div>
      <div className="flex-1 flex items-center mx-6">
        <input
          type="text"
          placeholder="Search..."
          className="border rounded px-3 py-1 w-72 text-sm bg-gray-50 focus:outline-none focus:ring"
        />
      </div>
      <div className="flex items-center gap-4">
        <TimerWidget />
        <span className="text-sm text-gray-700">{user?.name}</span>
        <button
          onClick={logout}
          className="text-xs px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
