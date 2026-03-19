"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { FiBell, FiX } from "react-icons/fi";
import Link from "next/link";
import { notificationsApi, AppNotification } from "../../src/api/notifications";
import { useNotificationStream } from "../../src/hooks/useNotificationStream";

const ICONS: Record<string, string> = {
  TASK_ASSIGNED: "📋",
  TASK_COMMENT: "💬",
  DEAL_STAGE_CHANGED: "💼",
  PERMIT_STATUS_CHANGED: "📄",
  VACATION_REVIEWED: "🌴",
};

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Initial load
  useEffect(() => {
    notificationsApi.getAll().then(setNotifs).catch(() => {});
  }, []);

  // Real-time SSE
  const handleStreamEvent = useCallback((event: any) => {
    if (event.event === 'notification' && event.data) {
      setNotifs(prev => [event.data, ...prev]);
    }
  }, []);
  useNotificationStream(handleStreamEvent);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unread = notifs.filter(n => !n.read).length;

  function handleOpen() {
    const opening = !open;
    setOpen(opening);
    if (opening && unread > 0) {
      notificationsApi.markAllRead().catch(() => {});
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    }
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    notificationsApi.deleteOne(id).catch(() => {});
    setNotifs(prev => prev.filter(n => n.id !== id));
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={handleOpen}
        style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", padding: 6, borderRadius: 8,
          color: "#64748b",
        }}
        title="Benachrichtigungen"
      >
        <FiBell size={20} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 2, right: 2,
            background: "#ef4444", color: "#fff", borderRadius: "50%",
            width: 16, height: 16, fontSize: 10, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            lineHeight: 1,
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={isMobile ? {
          position: "fixed", top: 60, left: 8, right: 8, width: "auto",
          background: "#fff", border: "1.5px solid #e5e7eb",
          borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          zIndex: 1000, overflow: "hidden",
        } : {
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: 340,
          background: "#fff", border: "1.5px solid #e5e7eb",
          borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          zIndex: 1000, overflow: "hidden",
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Benachrichtigungen</span>
            {notifs.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>
                {notifs.length} gesamt
              </span>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifs.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                Keine neuen Benachrichtigungen 🎉
              </div>
            ) : (
              notifs.map((n) => (
                <Link
                  key={n.id}
                  href={n.href || "#"}
                  onClick={() => setOpen(false)}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "flex", gap: 10, padding: "11px 16px",
                      borderBottom: "1px solid #f8fafc", alignItems: "flex-start",
                      transition: "background 0.1s",
                      background: n.read ? "transparent" : "#f0f9ff",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? "transparent" : "#f0f9ff")}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{ICONS[n.type] ?? "🔔"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: "#1e293b", lineHeight: 1.4 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: "#475569", marginTop: 1, lineHeight: 1.4 }}>{n.body}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        {new Date(n.createdAt).toLocaleDateString("de-CH", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, n.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 2, flexShrink: 0 }}
                      title="Löschen"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
