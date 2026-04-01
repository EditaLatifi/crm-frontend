"use client";
import { useEffect, useState } from "react";
import { api } from "../../src/api/client";
import { TASK_STATUS_LABELS } from "../../src/lib/labels";
import { FiActivity, FiBriefcase, FiCheckSquare, FiEdit2, FiTrash2, FiMail, FiPhone } from "react-icons/fi";

interface TimelineEvent {
  id: string;
  type: "activity" | "deal" | "task";
  date: string;
  title: string;
  subtitle?: string;
  color: string;
  icon: React.ReactNode;
}

const ACTION_LABELS: Record<string, string> = {
  CREATE: "erstellt",
  UPDATE: "aktualisiert",
  DELETE: "gelöscht",
  COMMENT: "kommentiert",
  timer_stop: "Zeit erfasst",
};

export default function ContactTimeline({ contactId, accountId }: { contactId: string; accountId?: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [activityData, tasksData] = await Promise.all([
          api.get(`/activity?entityType=Contact&entityId=${contactId}`).catch(() => []),
          api.get(`/tasks`).catch(() => []),
        ]);

        const activityEvents: TimelineEvent[] = (Array.isArray(activityData) ? activityData : []).map((a: any) => ({
          id: `act-${a.id}`,
          type: "activity",
          date: a.createdAt,
          title: `${ACTION_LABELS[a.action] || a.action} — ${a.entityType}`,
          subtitle: a.actorName || a.actorUserId,
          color: a.action === "CREATE" ? "#16a34a" : a.action === "DELETE" ? "#dc2626" : "#2563eb",
          icon: <FiActivity size={13} />,
        }));

        // Tasks linked to the contact's account
        const relatedTasks: TimelineEvent[] = (Array.isArray(tasksData) ? tasksData : [])
          .filter((t: any) => t.accountId === accountId || t.contactId === contactId)
          .map((t: any) => ({
            id: `task-${t.id}`,
            type: "task",
            date: t.createdAt,
            title: t.title,
            subtitle: `Aufgabe · ${TASK_STATUS_LABELS[t.status] ?? t.status}`,
            color: t.status === "DONE" ? "#16a34a" : t.status === "IN_PROGRESS" ? "#2563eb" : "#94a3b8",
            icon: <FiCheckSquare size={13} />,
          }));

        const all = [...activityEvents, ...relatedTasks].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setEvents(all);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [contactId, accountId]);

  if (loading) return (
    <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Lade Timeline…</div>
  );

  if (events.length === 0) return (
    <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
      Noch keine Aktivitäten für diesen Kontakt.
    </div>
  );

  return (
    <div style={{ position: "relative", paddingLeft: 24 }}>
      {/* Vertical line */}
      <div style={{
        position: "absolute", left: 9, top: 6, bottom: 6,
        width: 2, background: "#e5e7eb", borderRadius: 2,
      }} />

      {events.map((ev, i) => (
        <div key={ev.id} style={{ display: "flex", gap: 14, marginBottom: i < events.length - 1 ? 20 : 0, position: "relative" }}>
          {/* Dot */}
          <div style={{
            position: "absolute", left: -24,
            width: 20, height: 20, borderRadius: "50%",
            background: `${ev.color}18`, border: `2px solid ${ev.color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: ev.color, flexShrink: 0, top: 0,
          }}>
            {ev.icon}
          </div>

          {/* Content */}
          <div style={{ flex: 1, paddingLeft: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{ev.title}</div>
            {ev.subtitle && (
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{ev.subtitle}</div>
            )}
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              {new Date(ev.date).toLocaleDateString("de-CH", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
