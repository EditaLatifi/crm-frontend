import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function Modal({ open, onClose, title, children, width = 560 }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 14,
        width: '100%',
        maxWidth: width,
        maxHeight: 'calc(100vh - 40px)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        animation: 'modal-in 0.18s ease',
        border: '1px solid #E8E4DE',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid #E8E4DE',
          background: '#FAF9F6',
          flexShrink: 0,
        }}>
          <h2 style={{
            margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a1a',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8, border: '1px solid #E8E4DE',
              background: '#fff', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#fef2f2';
              (e.currentTarget as HTMLElement).style.borderColor = '#fecaca';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '#fff';
              (e.currentTarget as HTMLElement).style.borderColor = '#E8E4DE';
            }}
          >
            <FiX size={14} color="#999" />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.97) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
