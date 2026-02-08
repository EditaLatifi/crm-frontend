// src/components/Sidebar.tsx
import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import Link from 'next/link';

const navItems = [
  { label: 'Deals Board', href: '/deals', admin: false },
  { label: 'Tasks Board', href: '/tasks', admin: false },
  { label: 'Accounts', href: '/accounts', admin: false },
  { label: 'Time', href: '/time', admin: false },
  { label: 'Reports', href: '/reports', admin: true },
  { label: 'Users', href: '/users', admin: true },
];

export default function Sidebar() {
  const { role } = useAuth();
  return (
    <aside className="w-56 min-h-screen border-r bg-gray-50 flex flex-col text-sm">
      <div className="font-bold text-lg px-6 py-4 border-b">CRM</div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(item => {
          if (item.admin && role !== 'ADMIN') return null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 rounded hover:bg-gray-200 text-gray-800"
              prefetch={false}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
