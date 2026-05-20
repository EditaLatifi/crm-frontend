"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../src/api/client";
import { useToast } from "../ui/Toast";
import { TASK_STATUS_LABELS } from "../../src/lib/labels";
import {
  FiActivity, FiCheckSquare, FiFileText, FiMail, FiArrowUp, FiArrowDown,
  FiSend, FiClock,
} from "react-icons/fi";

type Kind = "note" | "email" | "activity" | "task";
type FilterKind = "all" | "note" | "activity" | "email";

interface TimelineItem {
  id: string;
  kind: Kind;
  badge: string;
  date: string;
  title: string;
  body?: string;
  actor?: string;
  color: string;
  icon: React.ReactNode;
  rawType?: string;
}

const ACTION_LABELS: Record<string, string> = {
  CREATE: "erstellt",
  UPDATE: "aktualisiert",
  DELETE: "gelöscht",
  COMMENT: "kommentiert",
  timer_stop: "Zeit erfasst",
};

const KIND_BADGE_STYLE: Record<Kind, { bg: string; color: string; label: string }> = {
  note:     { bg: "#fef3c7", color: "#b45309", label: "Notiz" },
  email:    { bg: "#dbeafe", color: "#1d4ed8", label: "E-Mail" },
  activity: { bg: "#e0e7ff", color: "#4338ca", label: "Aktivität" },
  task:     { bg: "#dcfce7", color: "#15803d", label: "Aufgabe" },
};

const FILTER_OPTIONS: { key: FilterKind; label: string }[] = [
  { key: "all",      label: "Alle" },
  { key: "note",     label: "Notizen" },
  { key: "activity", label: "Aktivitäten" },
  { key: "email",    label: "E-Mails" },
];

export default function ActivityTimeline({ contactId, accountId, hideActivity = false }: { contactId: string; accountId?: string; hideActivity?: boolean }) {
  const toast = useToast();
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKind>("all");
  const [noteInput, setNoteInput] = useState("");
  const [postingNote, setPostingNote] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [notesData, activityData, emailsData, tasksData] = await Promise.all([
        api.get(`/contacts/${contactId}/notes`).catch(() => []),
        hideActivity
          ? Promise.resolve([] as any[])
          : api.get(`/activity?entityType=Contact&entityId=${contactId}`).catch(() => []),
        api.get(`/email-logs?entityType=contact&entityId=${contactId}`).catch(() => []),
        api.get(`/tasks`).catch(() => []),
      ]);

      const noteItems: TimelineItem[] = (Array.isArray(notesData) ? notesData : []).map((n: any) => ({
        id: `note-${n.id}`,
        kind: "note",
        badge: KIND_BADGE_STYLE.note.label,
        date: n.createdAt,
        title: n.content?.split("\n")[0]?.slice(0, 120) || "Notiz",
        body: n.content,
        actor: n.createdBy?.name || n.createdBy?.email,
        color: "#b45309",
        icon: <FiFileText size={13} />,
      }));

      const emailItems: TimelineItem[] = (Array.isArray(emailsData) ? emailsData : []).map((e: any) => ({
        id: `email-${e.id}`,
        kind: "email",
        badge: KIND_BADGE_STYLE.email.label,
        date: e.loggedAt,
        title: e.subject || "E-Mail",
        body: e.body,
        actor: e.loggedBy?.name,
        color: e.direction === "OUTBOUND" ? "#2563eb" : "#16a34a",
        icon: e.direction === "OUTBOUND" ? <FiArrowUp size={13} /> : <FiArrowDown size={13} />,
        rawType: e.direction,
      }));

      const activityItems: TimelineItem[] = (Array.isArray(activityData) ? activityData : []).map((a: any) => {
        const actionLabel = ACTION_LABELS[a.action] || a.action;
        const isTimer = a.action === "timer_stop";
        return {
          id: `act-${a.id}`,
          kind: "activity",
          badge: KIND_BADGE_STYLE.activity.label,
          date: a.createdAt,
          title: `${actionLabel} — ${a.entityType}`,
          actor: a.actorName || a.actorUserId,
          color: a.action === "CREATE" ? "#16a34a" : a.action === "DELETE" ? "#dc2626" : isTimer ? "#7c3aed" : "#4338ca",
          icon: isTimer ? <FiClock size={13} /> : <FiActivity size={13} />,
          rawType: a.action,
        };
      });

      const taskItems: TimelineItem[] = (Array.isArray(tasksData) ? tasksData : [])
        .filter((t: any) => t.contactId === contactId || (accountId && t.accountId === accountId))
        .map((t: any) => ({
          id: `task-${t.id}`,
          kind: "task",
          badge: KIND_BADGE_STYLE.task.label,
          date: t.createdAt,
          title: t.title,
          actor: t.assignee?.name,
          color: t.status === "DONE" ? "#16a34a" : t.status === "IN_PROGRESS" ? "#2563eb" : "#94a3b8",
          icon: <FiCheckSquare size={13} />,
          rawType: TASK_STATUS_LABELS[t.status] ?? t.status,
        }));

      const all = [...noteItems, ...emailItems, ...activityItems, ...taskItems].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setItems(all);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, [contactId, accountId]);

  async function handleAddNote() {
    const text = noteInput.trim();
    if (!text) return;
    setPostingNote(true);
    try {
      await api.post(`/contacts/${contactId}/notes`, { content: text });
      setNoteInput("");
      toast.success("Notiz hinzugefügt.");
      await loadAll();
    } catch {
      toast.error("Notiz konnte nicht gespeichert werden.");
    } finally {
      setPostingNote(false);
    }
  }

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    // Tasks are not in the filter chips per spec — hide them when a specific
    // filter is active so the user gets a clean per-source view.
    return items.filter((it) => it.kind === filter);
  }, [items, filter]);

  return (
    <div>
      {/* Add note */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddNote(); } }}
          placeholder="Neue Notiz…"
          style={{
            flex: 1, padding: "8px 12px", borderRadius: 8,
            border: "1.5px solid #e5e7eb", fontSize: 13,
            background: "#f8fafc", outline: "none",
          }}
        />
        <button
          onClick={handleAddNote}
          disabled={postingNote || !noteInput.trim()}
          style={{
            background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 14px", cursor: (postingNote || !noteInput.trim()) ? "not-allowed" : "pointer",
            opacity: (postingNote || !noteInput.trim()) ? 0.5 : 1,
            display: "flex", alignItems: "center", gap: 5, fontWeight: 600, fontSize: 13,
          }}
        >
          <FiSend size={13} />
          {postingNote ? "…" : "Senden"}
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {FILTER_OPTIONS.filter(f => !hideActivity || f.key !== "activity").map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                background: active ? "#1a1a1a" : "#fff",
                color: active ? "#fff" : "#475569",
                border: active ? "1.5px solid #1a1a1a" : "1.5px solid #e5e7eb",
                borderRadius: 999, padding: "4px 14px",
                fontWeight: 600, fontSize: 12, cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Lade Verlauf…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          Noch keine Einträge für diesen Filter.
        </div>
      ) : (
        <div style={{ position: "relative", paddingLeft: 24 }}>
          <div style={{
            position: "absolute", left: 9, top: 6, bottom: 6,
            width: 2, background: "#e5e7eb", borderRadius: 2,
          }} />
          {filtered.map((it, i) => {
            const badge = KIND_BADGE_STYLE[it.kind];
            return (
              <div key={it.id} style={{ display: "flex", gap: 14, marginBottom: i < filtered.length - 1 ? 18 : 0, position: "relative" }}>
                <div style={{
                  position: "absolute", left: -24,
                  width: 20, height: 20, borderRadius: "50%",
                  background: `${it.color}18`, border: `2px solid ${it.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: it.color, flexShrink: 0, top: 0,
                }}>
                  {it.icon}
                </div>
                <div style={{ flex: 1, paddingLeft: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                    <span style={{
                      background: badge.bg, color: badge.color,
                      fontSize: 10, fontWeight: 700, padding: "1px 7px",
                      borderRadius: 5, letterSpacing: "0.04em", textTransform: "uppercase",
                    }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{it.title}</span>
                  </div>
                  {it.body && (
                    <div style={{ fontSize: 13, color: "#374151", marginTop: 4, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {it.body}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    {it.actor ? `${it.actor} · ` : ""}
                    {new Date(it.date).toLocaleDateString("de-CH", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
