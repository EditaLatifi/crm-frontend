"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../src/auth/AuthProvider";
import { api } from "../../../../src/api/client";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:        { label: "Offen",          color: "#1d4ed8", bg: "#dbeafe" },
  IN_PROGRESS: { label: "In Bearbeitung", color: "#b45309", bg: "#fef3c7" },
  DONE:        { label: "Erledigt",       color: "#15803d", bg: "#dcfce7" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  LOW:    { label: "Niedrig", color: "#6b7280", dot: "#9ca3af" },
  MEDIUM: { label: "Mittel",  color: "#b45309", dot: "#f59e0b" },
  HIGH:   { label: "Hoch",    color: "#dc2626", dot: "#ef4444" },
};

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#3b82f6"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color,
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 600, flexShrink: 0, letterSpacing: "0.02em"
    }}>
      {initials || "?"}
    </div>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px",
      borderRadius: 20, fontSize: 12, fontWeight: 600, color, background: bg,
      letterSpacing: "0.02em"
    }}>
      {label}
    </span>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#64748b" }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{title}</span>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

export default function TaskDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const taskId = params?.id as string;

  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [newComment, setNewComment] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);

  const [newTime, setNewTime] = useState({ startedAt: "", endedAt: "", durationMinutes: "", description: "" });
  const [loadingTime, setLoadingTime] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editEstimate, setEditEstimate] = useState("");
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"time" | "comments" | "history">("comments");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTask = () => {
    if (!taskId) return;
    api.get(`/tasks/${taskId}`)
      .then(data => {
        setTask(data);
        setComments(data.comments || []);
        setHistory(data.history || []);
        setTimeEntries(data.timeEntries || []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchTask();
    api.get("/users").then(data => setUsers(Array.isArray(data) ? data : [])).catch(() => {});
  }, [taskId]);

  const handleAssignUser = async (userId: string) => {
    await api.patch(`/tasks/${taskId}`, { assignedToUserId: userId });
    fetchTask();
    showToast("Aufgabe zugewiesen");
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === task.status) return;
    await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
    fetchTask();
  };

  const handlePriorityChange = async (newPriority: string) => {
    await api.patch(`/tasks/${taskId}/priority`, { priority: newPriority });
    fetchTask();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoadingComment(true);
    try {
      await api.post(`/tasks/${taskId}/comments`, { text: newComment });
      setNewComment("");
      fetchTask();
      showToast("Kommentar hinzugefügt");
    } catch (e: any) {
      showToast(e?.message || "Fehler beim Hinzufügen", "error");
    }
    setLoadingComment(false);
  };

  const handleAddTime = async () => {
    if (!newTime.startedAt || !newTime.endedAt || !newTime.durationMinutes) return;
    setLoadingTime(true);
    try {
      const accountId = task?.accountId;
      if (!accountId) { showToast("Kein Konto verknüpft", "error"); setLoadingTime(false); return; }
      await api.post(`/tasks/${taskId}/time-entries`, { ...newTime, userId: user?.id, accountId });
      setNewTime({ startedAt: "", endedAt: "", durationMinutes: "", description: "" });
      fetchTask();
      showToast("Zeit erfasst");
    } catch (e: any) {
      showToast(e?.message || "Fehler", "error");
    }
    setLoadingTime(false);
  };

  const startEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "");
    setEditEstimate(task.estimate || "");
    setEditMode(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.patch(`/tasks/${taskId}`, {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
        estimate: editEstimate !== "" ? Number(editEstimate) : null,
      });
      setEditMode(false);
      fetchTask();
      showToast("Gespeichert");
    } catch (e: any) {
      showToast(e?.message || "Fehler beim Speichern", "error");
    }
    setSaving(false);
  };

  const totalMin = timeEntries.reduce((s, t) => s + (t.durationMinutes || 0), 0);

  if (!task) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#64748b", fontSize: 15 }}>
      Lade Aufgabe...
    </div>
  );

  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.OPEN;
  const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
  const assignedUser = users.find(u => u.id === task.assignedToUserId);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 24, zIndex: 9999,
          background: toast.type === "success" ? "#16a34a" : "#dc2626",
          color: "#fff", padding: "10px 18px", borderRadius: 8,
          fontSize: 14, fontWeight: 500, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          animation: "slideIn 0.2s ease"
        }}>
          {toast.message}
        </div>
      )}

      <div className="task-detail-wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, color: "#64748b", fontSize: 13 }}>
          <a href="/tasks" style={{ color: "#64748b", textDecoration: "none" }}>Aufgaben</a>
          <span>/</span>
          <span style={{ color: "#0f172a", fontWeight: 500 }}>
            TASK-{task.id?.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <div className="task-detail-grid">

          {/* ── LEFT: Main task content ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Task card */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9" }}>
              {/* Status bar */}
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", fontFamily: "monospace" }}>
                  TASK-{task.id?.slice(0, 8).toUpperCase()}
                </span>
                <div style={{ width: 1, height: 16, background: "#e2e8f0" }} />
                {/* Status dropdown */}
                <div style={{ position: "relative" }}>
                  <select
                    value={task.status}
                    onChange={e => handleStatusChange(e.target.value)}
                    style={{
                      appearance: "none", border: "none", background: statusCfg.bg, color: statusCfg.color,
                      fontWeight: 600, fontSize: 12, padding: "4px 24px 4px 10px", borderRadius: 20,
                      cursor: "pointer", letterSpacing: "0.02em"
                    }}
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: statusCfg.color, fontSize: 10 }}>▾</span>
                </div>
                {/* Priority */}
                <div style={{ position: "relative" }}>
                  <select
                    value={task.priority || "MEDIUM"}
                    onChange={e => handlePriorityChange(e.target.value)}
                    style={{
                      appearance: "none", border: "1px solid #e2e8f0", background: "#fff",
                      color: priorityCfg.color, fontWeight: 500, fontSize: 12,
                      padding: "4px 24px 4px 10px", borderRadius: 8, cursor: "pointer"
                    }}
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8", fontSize: 10 }}>▾</span>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  {!editMode ? (
                    <button
                      onClick={startEdit}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                        background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8,
                        fontSize: 13, fontWeight: 500, color: "#475569", cursor: "pointer"
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Bearbeiten
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        style={{
                          padding: "6px 14px", background: "#2563eb", color: "#fff",
                          border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500,
                          cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1
                        }}
                      >
                        {saving ? "Speichern..." : "Speichern"}
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        style={{
                          padding: "6px 14px", background: "#f8fafc", border: "1px solid #e2e8f0",
                          borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#64748b", cursor: "pointer"
                        }}
                      >
                        Abbrechen
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Task body */}
              <div style={{ padding: 24 }}>
                {editMode ? (
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    style={{
                      width: "100%", fontSize: 22, fontWeight: 700, color: "#0f172a",
                      border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px",
                      outline: "none", boxSizing: "border-box", marginBottom: 16
                    }}
                    autoFocus
                  />
                ) : (
                  <h1 style={{ margin: "0 0 16px 0", fontSize: 22, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
                    {task.title}
                  </h1>
                )}

                {editMode ? (
                  <textarea
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    rows={5}
                    placeholder="Beschreibung hinzufügen..."
                    style={{
                      width: "100%", fontSize: 14, color: "#374151", border: "1px solid #cbd5e1",
                      borderRadius: 8, padding: "10px 12px", outline: "none",
                      resize: "vertical", boxSizing: "border-box", lineHeight: 1.6, fontFamily: "inherit"
                    }}
                  />
                ) : (
                  <p style={{ margin: 0, fontSize: 14, color: task.description ? "#374151" : "#94a3b8", lineHeight: 1.7 }}>
                    {task.description || "Keine Beschreibung vorhanden."}
                  </p>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", padding: "16px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 20 }}>

                {/* Assignee */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", marginBottom: 8, textTransform: "uppercase" }}>
                    Zugewiesen an
                  </div>
                  {editMode ? (
                    <select
                      value={task.assignedToUserId || ""}
                      onChange={e => handleAssignUser(e.target.value)}
                      style={{
                        width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0",
                        borderRadius: 8, fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer"
                      }}
                    >
                      <option value="">Niemand</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                    </select>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar name={assignedUser?.name || assignedUser?.email || "?"} size={28} />
                      <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                        {assignedUser?.name || assignedUser?.email || "Niemand"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Due date */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", marginBottom: 8, textTransform: "uppercase" }}>
                    Fälligkeitsdatum
                  </div>
                  {editMode ? (
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={e => setEditDueDate(e.target.value)}
                      style={{
                        width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0",
                        borderRadius: 8, fontSize: 13, color: "#374151", boxSizing: "border-box"
                      }}
                    />
                  ) : (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      fontSize: 13, color: task.dueDate ? "#374151" : "#94a3b8", fontWeight: 500
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" }) : "Nicht gesetzt"}
                    </span>
                  )}
                </div>

                {/* Estimate */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", marginBottom: 8, textTransform: "uppercase" }}>
                    Schätzung
                  </div>
                  {editMode ? (
                    <input
                      type="number"
                      value={editEstimate}
                      onChange={e => setEditEstimate(e.target.value)}
                      placeholder="Stunden"
                      min={0}
                      style={{
                        width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0",
                        borderRadius: 8, fontSize: 13, color: "#374151", boxSizing: "border-box"
                      }}
                    />
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: task.estimate ? "#374151" : "#94a3b8", fontWeight: 500 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {task.estimate ? `${task.estimate}h` : "Nicht gesetzt"}
                    </span>
                  )}
                </div>

                {/* Time logged */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", marginBottom: 8, textTransform: "uppercase" }}>
                    Erfasste Zeit
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: totalMin > 0 ? "#2563eb" : "#94a3b8", fontWeight: 600 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {totalMin > 0 ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}min` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div className="task-detail-sidebar" style={{ display: "flex", flexDirection: "column", gap: 0, background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9" }}>
              {([
                { key: "comments", label: "Kommentare", count: comments.length },
                { key: "time",     label: "Zeit",        count: timeEntries.length },
                { key: "history",  label: "Verlauf",     count: history.length },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1, padding: "13px 8px", background: "none", border: "none",
                    borderBottom: activeTab === tab.key ? "2px solid #2563eb" : "2px solid transparent",
                    fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400,
                    color: activeTab === tab.key ? "#2563eb" : "#64748b",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5
                  }}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span style={{
                      background: activeTab === tab.key ? "#dbeafe" : "#f1f5f9",
                      color: activeTab === tab.key ? "#2563eb" : "#64748b",
                      borderRadius: 10, fontSize: 11, fontWeight: 600, padding: "1px 6px"
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

              {/* ── COMMENTS TAB ── */}
              {activeTab === "comments" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 420, overflowY: "auto" }}>
                    {comments.length === 0 && (
                      <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 13 }}>
                        Noch keine Kommentare.
                      </div>
                    )}
                    {comments.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 10 }}>
                        <Avatar name={c.author?.name || c.authorId || "U"} size={30} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{c.author?.name || "Benutzer"}</span>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>{c.createdAt ? new Date(c.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</span>
                          </div>
                          <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, background: "#f8fafc", borderRadius: 8, padding: "8px 12px" }}>
                            {c.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Kommentar schreiben..."
                      rows={3}
                      onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAddComment(); }}
                      style={{
                        width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                        borderRadius: 8, fontSize: 13, color: "#374151", resize: "none",
                        fontFamily: "inherit", lineHeight: 1.5, outline: "none", boxSizing: "border-box"
                      }}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={loadingComment || !newComment.trim()}
                      style={{
                        padding: "9px 16px", background: "#2563eb", color: "#fff", border: "none",
                        borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        opacity: loadingComment || !newComment.trim() ? 0.6 : 1, alignSelf: "flex-end"
                      }}
                    >
                      {loadingComment ? "Senden..." : "Kommentieren"}
                    </button>
                  </div>
                </>
              )}

              {/* ── TIME TAB ── */}
              {activeTab === "time" && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 300, overflowY: "auto" }}>
                    {timeEntries.length === 0 && (
                      <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>
                        Noch keine Zeit erfasst.
                      </div>
                    )}
                    {timeEntries.map((t, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "#f8fafc", borderRadius: 8 }}>
                        <Avatar name={t.user?.name || "U"} size={28} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                            <span style={{ fontWeight: 600, fontSize: 12, color: "#0f172a" }}>{t.user?.name || "Benutzer"}</span>
                            <span style={{ fontWeight: 700, fontSize: 12, color: "#2563eb" }}>{t.durationMinutes} min</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>
                            {t.startedAt ? new Date(t.startedAt).toLocaleString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""} → {t.endedAt ? new Date(t.endedAt).toLocaleString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                          </div>
                          {t.description && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{t.description}</div>}
                        </div>
                      </div>
                    ))}
                    {totalMin > 0 && (
                      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>
                          Gesamt: {Math.floor(totalMin / 60)}h {totalMin % 60}min
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Add time form */}
                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Zeit hinzufügen</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>Start</label>
                        <input
                          type="datetime-local"
                          value={newTime.startedAt}
                          onChange={e => setNewTime(nt => ({ ...nt, startedAt: e.target.value }))}
                          style={{ width: "100%", padding: "7px 9px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, boxSizing: "border-box" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>Ende</label>
                        <input
                          type="datetime-local"
                          value={newTime.endedAt}
                          onChange={e => setNewTime(nt => ({ ...nt, endedAt: e.target.value }))}
                          style={{ width: "100%", padding: "7px 9px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, boxSizing: "border-box" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>Minuten</label>
                        <input
                          type="number"
                          value={newTime.durationMinutes}
                          onChange={e => setNewTime(nt => ({ ...nt, durationMinutes: e.target.value }))}
                          placeholder="0"
                          min={1}
                          style={{ width: "100%", padding: "7px 9px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, boxSizing: "border-box" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>Beschreibung</label>
                        <input
                          value={newTime.description}
                          onChange={e => setNewTime(nt => ({ ...nt, description: e.target.value }))}
                          placeholder="Optional..."
                          style={{ width: "100%", padding: "7px 9px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, boxSizing: "border-box" }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddTime}
                      disabled={loadingTime || !newTime.startedAt || !newTime.endedAt || !newTime.durationMinutes}
                      style={{
                        padding: "9px 16px", background: "#2563eb", color: "#fff", border: "none",
                        borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        opacity: loadingTime || !newTime.startedAt || !newTime.endedAt || !newTime.durationMinutes ? 0.5 : 1
                      }}
                    >
                      {loadingTime ? "Speichern..." : "Zeit erfassen"}
                    </button>
                  </div>
                </>
              )}

              {/* ── HISTORY TAB ── */}
              {activeTab === "history" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 0, maxHeight: 500, overflowY: "auto" }}>
                  {history.length === 0 && (
                    <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 13 }}>
                      Noch kein Verlauf.
                    </div>
                  )}
                  {history.map((h, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, paddingBottom: 16, position: "relative" }}>
                      {i < history.length - 1 && (
                        <div style={{ position: "absolute", left: 14, top: 28, bottom: 0, width: 1, background: "#f1f5f9" }} />
                      )}
                      <Avatar name={h.user?.name || "U"} size={28} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 600, fontSize: 12, color: "#0f172a" }}>{h.user?.name || "Benutzer"}</span>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>{h.createdAt ? new Date(h.createdAt).toLocaleString("de-DE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          {h.action}{h.payload ? `: ${typeof h.payload === "object" ? Object.entries(h.payload).map(([k, v]) => `${k} → ${v}`).join(", ") : h.payload}` : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
