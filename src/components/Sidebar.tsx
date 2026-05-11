// src/components/Sidebar.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '../api/client';

type NavGroup = {
  title: string;
  items: NavItem[];
};

type NavItem = {
  label: string;
  href: string;
  roles?: string[]; // if set, only these roles see the item
  countKey?: string;
};

const navGroups: NavGroup[] = [
  {
    title: 'CRM',
    items: [
      { label: 'Konten', href: '/accounts', countKey: 'accounts' },
      { label: 'Kontakte', href: '/contacts', countKey: 'contacts' },
      { label: 'Deals', href: '/deals', countKey: 'deals' },
    ],
  },
  {
    title: 'Projekte',
    items: [
      { label: 'Projekte', href: '/projects', countKey: 'projects' },
      { label: 'Aufgaben', href: '/tasks', countKey: 'tasks' },
      { label: 'Zeiterfassung', href: '/time' },
    ],
  },
  {
    title: 'Finanzen',
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Berichte', href: '/reports', roles: ['ADMIN', 'PROJEKTLEITER'] },
    ],
  },
  {
    title: 'Planung',
    items: [
      { label: 'Kalender', href: '/calendar' },
      { label: 'Urlaub', href: '/vacation' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Benutzer', href: '/users', roles: ['ADMIN'] },
      { label: 'Vorlagen', href: '/admin/templates', roles: ['ADMIN'] },
      { label: 'Bauschritte', href: '/admin/milestones', roles: ['ADMIN'] },
    ],
  },
];

export default function Sidebar() {
  const { role, user } = useAuth();
  const pathname = usePathname();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const cached = sessionStorage.getItem('sidebarCounts');
    if (cached) {
      try { setCounts(JSON.parse(cached)); } catch {}
    }
    const timer = setTimeout(() => {
      api.get('/search/counts')
        .then((data: any) => {
          setCounts(data);
          sessionStorage.setItem('sidebarCounts', JSON.stringify(data));
        })
        .catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const canSee = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.includes(role || '');
  };

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      borderRight: '1px solid var(--color-border, #d1d5db)',
      background: 'var(--color-surface, #fff)',
      display: 'flex',
      flexDirection: 'column',
      fontSize: 13,
    }}>
      <div style={{
        fontWeight: 700,
        fontSize: 16,
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border, #d1d5db)',
        color: 'var(--color-text, #1e293b)',
      }}>
        IP3 CRM
      </div>

      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {navGroups.map(group => {
          const visibleItems = group.items.filter(canSee);
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.title} style={{ marginBottom: 4 }}>
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-text-muted, #94a3b8)',
                padding: '12px 20px 4px',
              }}>
                {group.title}
              </div>
              {visibleItems.map(item => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '7px 20px',
                      margin: '1px 8px',
                      borderRadius: 6,
                      color: active ? 'var(--color-accent, #2563eb)' : 'var(--color-text, #374151)',
                      background: active ? 'var(--color-accent-muted, #e9effd)' : 'transparent',
                      fontWeight: active ? 600 : 400,
                      textDecoration: 'none',
                      borderRight: active ? '3px solid var(--color-accent, #2563eb)' : '3px solid transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span>{item.label}</span>
                    {item.countKey && counts[item.countKey] !== undefined && (
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--color-text-muted, #94a3b8)',
                        background: 'var(--color-bg, #f1f5f9)',
                        padding: '1px 7px',
                        borderRadius: 10,
                      }}>
                        {counts[item.countKey]}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {user && (
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--color-border, #d1d5db)',
          fontSize: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--color-accent, #2563eb)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
            }}>
              {(user.name || user.email || '?').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-text, #1e293b)' }}>
                {user.name || user.email}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted, #94a3b8)' }}>
                {role}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
