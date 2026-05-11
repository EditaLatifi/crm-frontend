// src/components/TopBar.tsx
'use client';
import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useRouter } from 'next/navigation';
import NotificationBell from './TopBar/NotificationBell';
import { FiClock, FiSearch } from 'react-icons/fi';
import LogTimeQuickModal from '../../components/time/LogTimeQuickModal';

export default function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showTimeModal, setShowTimeModal] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        padding: '0 24px',
        borderBottom: '1px solid var(--color-border, #d1d5db)',
        background: 'var(--color-surface, #fff)',
      }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text, #1e293b)' }}>
          IP3 CRM
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', margin: '0 24px', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Suchen..."
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                border: '1px solid var(--color-border, #d1d5db)',
                borderRadius: 8,
                fontSize: 13,
                background: 'var(--color-bg, #f6f7fa)',
                color: 'var(--color-text, #1e293b)',
                outline: 'none',
              }}
            />
          </div>

          <button
            onClick={() => setShowTimeModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              background: 'var(--color-accent, #2563eb)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <FiClock size={14} />
            Zeit erfassen
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <NotificationBell />
          <span style={{ fontSize: 13, color: 'var(--color-text-muted, #6b7280)' }}>{user?.name}</span>
          <button
            onClick={handleLogout}
            style={{
              fontSize: 12,
              padding: '5px 12px',
              border: '1px solid var(--color-border, #d1d5db)',
              borderRadius: 6,
              background: 'var(--color-bg, #f6f7fa)',
              color: 'var(--color-text, #374151)',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <LogTimeQuickModal open={showTimeModal} onClose={() => setShowTimeModal(false)} />
    </>
  );
}
