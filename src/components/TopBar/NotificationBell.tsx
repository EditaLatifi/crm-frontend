"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getAccessToken } from '../../auth/tokenStore';
import { api } from '../../api/client';

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href?: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.read).length);
    } catch {}
  }, []);

  // SSE connection
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    const es = new EventSource(`${apiBase}/notifications/stream?token=${encodeURIComponent(token)}`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.event === 'connected') {
          setUnreadCount(msg.unreadCount ?? 0);
          fetchNotifications();
        } else if (msg.event === 'notification') {
          setNotifications(prev => [msg.data, ...prev]);
          setUnreadCount(c => c + 1);
        }
      } catch {}
    };

    return () => { es.close(); };
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleOpen() {
    setOpen(o => !o);
    if (!open) fetchNotifications();
  }

  async function markAllRead() {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  async function markRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  }

  async function deleteOne(id: string, wasRead: boolean) {
    await api.delete(`/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (!wasRead) setUnreadCount(c => Math.max(0, c - 1));
  }

  function handleNotifClick(n: Notification) {
    if (!n.read) markRead(n.id);
    if (n.href) {
      window.location.href = n.href;
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative p-1.5 rounded hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 w-80 bg-white border rounded-lg shadow-lg z-50 flex flex-col max-h-[480px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b">
            <span className="font-semibold text-sm">Benachrichtigungen</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Alle gelesen
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">Keine Benachrichtigungen</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex items-start gap-2 px-4 py-3 border-b last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50' : ''}`}
                  onClick={() => handleNotifClick(n)}
                >
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {n.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('de-CH', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteOne(n.id, n.read); }}
                    className="ml-1 text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5"
                    aria-label="Löschen"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
