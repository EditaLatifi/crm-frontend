"use client";
import { useEffect, useState, useRef } from "react";
import { api } from "../../src/api/client";
import { FiBell } from "react-icons/fi";
import Link from "next/link";

interface Notification {
  id: string;
  type: "overdue_task" | "followup_contact" | "followup_deal" | "upcoming_appointment";
  label: string;
  href: string;
  date: string;
}

const SEEN_KEY = "crm_seen_notif_ids";

function loadSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSeenIds(ids: Set<string>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
  } catch {}
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Load seen IDs only on the client (localStorage is not available during SSR)
  useEffect(() => {
    setSeenIds(loadSeenIds());
  }, []);

  async function fetchNotifications() {
    try {
      const [tasks, contacts, deals, appointments] = await Promise.all([
        api.get("/tasks").catch(() => []),
        api.get("/contacts").catch(() => []),
        api.get("/deals").catch(() => []),
        api.get("/appointments").catch(() => []),
      ]);

      const now = new Date();
      const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000); // next 24h
      const result: Notification[] = [];

      // Overdue tasks
      (Array.isArray(tasks) ? tasks : [])
        .filter((t: any) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE")
        .slice(0, 5)
        .forEach((t: any) => {
          result.push({
            id: `task-${t.id}`,
            type: "overdue_task",
            label: `Aufgabe überfällig: ${t.title}`,
            href: `/tasks/${t.id}`,
            date: t.dueDate,
          });
        });

      // Overdue contact follow-ups
      (Array.isArray(contacts) ? contacts : [])
        .filter((c: any) => c.followUpDate && new Date(c.followUpDate) < now)
        .slice(0, 5)
        .forEach((c: any) => {
          result.push({
            id: `contact-${c.id}`,
            type: "followup_contact",
            label: `Follow-up überfällig: ${c.name}`,
            href: `/contacts/${c.id}`,
            date: c.followUpDate,
          });
        });

      // Overdue deal follow-ups
      (Array.isArray(deals) ? deals : [])
        .filter((d: any) => d.followUpDate && new Date(d.followUpDate) < now)
        .slice(0, 5)
        .forEach((d: any) => {
          result.push({
            id: `deal-${d.id}`,
            type: "followup_deal",
            label: `Deal-Follow-up überfällig: ${d.name}`,
            href: `/deals/${d.id}`,
            date: d.followUpDate,
          });
        });

      // Upcoming appointments (next 24h)
      (Array.isArray(appointments) ? appointments : [])
        .filter((a: any) => {
          const start = new Date(a.startAt);
          return start >= now && start <= soon;
        })
        .slice(0, 5)
        .forEach((a: any) => {
          result.push({
            id: `appt-${a.id}`,
            type: "upcoming_appointment",
            label: `Termin: ${a.title}`,
            href: `/calendar`,
            date: a.startAt,
          });
        });

      // Sort by date ascending
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setNotifs(result);
    } catch {}
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

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

  const ICONS: Record<string, string> = {
    overdue_task: "⚠️",
    followup_contact: "👤",
    followup_deal: "💼",
    upcoming_appointment: "📅",
  };

  const unread = notifs.filter(n => !seenIds.has(n.id)).length;

  function markAllSeen() {
    const updated = new Set(seenIds);
    notifs.forEach(n => updated.add(n.id));
    setSeenIds(updated);
    saveSeenIds(updated);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => {
          const opening = !open;
          setOpen(opening);
          if (opening) markAllSeen();
        }}
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
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: 340, background: "#fff", border: "1.5px solid #e5e7eb",
          borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          zIndex: 100, overflow: "hidden",
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
                  href={n.href}
                  onClick={() => setOpen(false)}
                  style={{ textDecoration: "none" }}
                >
                  <div style={{
                    display: "flex", gap: 10, padding: "11px 16px",
                    borderBottom: "1px solid #f8fafc", alignItems: "flex-start",
                    transition: "background 0.1s",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{ICONS[n.type]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b", lineHeight: 1.4 }}>{n.label}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        {new Date(n.date).toLocaleDateString("de-CH", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>
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
