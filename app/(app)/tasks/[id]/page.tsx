"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../src/auth/AuthProvider";
import { api } from "../../../../src/api/client";
import { getAllPhaseCodes } from "../../../../src/lib/siaPhases";

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

  const [newTime, setNewTime] = useState({ startedAt: "", endedAt: "", description: "" });
  const [loadingTime, setLoadingTime] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editEstimate, setEditEstimate] = useState("");
  const [editPhase, setEditPhase] = useState("");
  const [editSpecification, setEditSpecification] = useState("");
  const [editBudgetHours, setEditBudgetHours] = useState("");
  const [saving, setSaving] = useState(false);
  const phaseOptions = getAllPhaseCodes();
  const isAdmin = user?.role === 'ADMIN';

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<"time" | "comments" | "history" | "checklists" | "documents">("comments");
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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
    api.get(`/tasks/${taskId}/documents`).then(d => setDocuments(Array.isArray(d) ? d : [])).catch(() => {});
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
    if (!newTime.startedAt || !newTime.endedAt) return;
    const durationMinutes = calcDurationMinutes(newTime.startedAt, newTime.endedAt);
    if (durationMinutes <= 0) { showToast("Ende-Zeitpunkt muss nach Start-Zeitpunkt liegen", "error"); return; }
    setLoadingTime(true);
    try {
      const accountId = task?.accountId;
      if (!accountId) { showToast("Kein Konto verknüpft", "error"); setLoadingTime(false); return; }
      await api.post(`/tasks/${taskId}/time-entries`, { ...newTime, durationMinutes, userId: user?.id, accountId });
      setNewTime({ startedAt: "", endedAt: "", description: "" });
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
    setEditPhase(task.phase || "");
    setEditSpecification(task.specification || "");
    setEditBudgetHours(task.budgetHours ?? "");
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
        phase: editPhase || null,
        specification: editSpecification || null,
        budgetHours: editBudgetHours !== "" ? Number(editBudgetHours) : null,
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

  function fmtDuration(minutes: number): string {
    if (!minutes || minutes <= 0) return '0min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  }

  function formatHistoryEntry(action: string, payload: any): string {
    const STATUS_MAP: Record<string, string> = { OPEN: 'Offen', IN_PROGRESS: 'In Bearbeitung', DONE: 'Erledigt', PENDING: 'Ausstehend' };
    const PRIORITY_MAP: Record<string, string> = { LOW: 'Niedrig', MEDIUM: 'Mittel', HIGH: 'Hoch', URGENT: 'Dringend' };
    switch (action) {
      case 'CREATED': return 'Aufgabe erstellt';
      case 'STATUS_CHANGED': return `Status: ${STATUS_MAP[payload?.from] ?? payload?.from ?? '?'} → ${STATUS_MAP[payload?.to] ?? payload?.to ?? '?'}`;
      case 'PRIORITY_CHANGED': return `Priorität: ${PRIORITY_MAP[payload?.from] ?? payload?.from ?? '?'} → ${PRIORITY_MAP[payload?.to] ?? payload?.to ?? '?'}`;
      case 'ASSIGNED': return `Zugewiesen: ${payload?.from ?? 'Niemand'} → ${payload?.to ?? 'Niemand'}`;
      case 'TITLE_CHANGED': return `Titel: "${payload?.from}" → "${payload?.to}"`;
      case 'TIME_LOGGED': {
        const min = payload?.durationMinutes ?? 0;
        const h = Math.floor(min / 60); const m = min % 60;
        const dur = h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`;
        return `Zeit erfasst: ${dur}${payload?.description ? ` – ${payload.description}` : ''}`;
      }
      default: return action;
    }
  }

  function calcDurationMinutes(startedAt: string, endedAt: string): number {
    if (!startedAt || !endedAt) return 0;
    return Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000);
  }

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
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, marginTop: 30, color: "#64748b", fontSize: 13 }}>
          <a href="/tasks" style={{ color: "#64748b", textDecoration: "none" }}>Aufgaben</a>
          <span>/</span>
          <span style={{ color: "#0f172a", fontWeight: 500 }}>
            {task.title}
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

                {/* Phase + Budget + Spec fields in edit mode */}
                {editMode && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" }}>Leistungsphase</div>
                      <select value={editPhase} onChange={e => setEditPhase(e.target.value)}
                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#374151", boxSizing: "border-box" }}>
                        <option value="">— Keine Phase —</option>
                        {phaseOptions.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
                      </select>
                    </div>
                    {isAdmin && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" }}>Stundenkontingent (h)</div>
                        <input type="number" min="0" step="0.5" value={editBudgetHours} onChange={e => setEditBudgetHours(e.target.value)} placeholder="z.B. 40"
                          style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#374151", boxSizing: "border-box" }} />
                      </div>
                    )}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" }}>Spezifikation</div>
                      <textarea value={editSpecification} onChange={e => setEditSpecification(e.target.value)} rows={3} placeholder="Freitext-Spezifikation"
                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#374151", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }} />
                    </div>
                  </div>
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
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString("de-CH", { day: "2-digit", month: "short", year: "numeric" }) : "Nicht gesetzt"}
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

                {/* Phase */}
                {task.phase && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", marginBottom: 8, textTransform: "uppercase" }}>Leistungsphase</div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", background: "#f3e8ff", borderRadius: 6, padding: "3px 10px" }}>{task.phase}</span>
                  </div>
                )}

                {/* Budget hours */}
                {task.budgetHours != null && task.budgetHours > 0 && (() => {
                  const usedH = totalMin / 60;
                  const budgetH = task.budgetHours;
                  const pct = Math.min((usedH / budgetH) * 100, 100);
                  const over = usedH > budgetH;
                  return (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", marginBottom: 8, textTransform: "uppercase" }}>Budget</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: over ? "#dc2626" : "#1e293b", marginBottom: 4 }}>
                        {usedH.toFixed(1)}h / {budgetH}h
                        {over && <span style={{ fontSize: 11, color: "#dc2626", marginLeft: 6, background: "#fee2e2", borderRadius: 4, padding: "1px 6px" }}>Überschritten!</span>}
                      </div>
                      <div style={{ background: "#f1f5f9", borderRadius: 20, height: 6, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: over ? "#dc2626" : "#2563eb", borderRadius: 20, width: `${pct}%`, transition: "width 0.3s" }} />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Specification */}
            {task.specification && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", padding: "16px 24px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", marginBottom: 8, textTransform: "uppercase" }}>Spezifikation</div>
                <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{task.specification}</div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div className="task-detail-sidebar" style={{ display: "flex", flexDirection: "column", gap: 0, background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", overflow: "hidden" }}>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9" }}>
              {([
                { key: "comments", label: "Kommentare", count: comments.length },
                { key: "checklists", label: "Checklisten", count: (Array.isArray(task.checklists) ? task.checklists : []).length },
                { key: "documents", label: "Dokumente", count: documents.length },
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
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>{c.createdAt ? new Date(c.createdAt).toLocaleString("de-CH", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</span>
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
                            <span style={{ fontWeight: 700, fontSize: 12, color: "#2563eb" }}>{fmtDuration(t.durationMinutes)}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>
                            {t.startedAt ? new Date(t.startedAt).toLocaleString("de-CH", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""} → {t.endedAt ? new Date(t.endedAt).toLocaleString("de-CH", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
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
                        <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>Dauer</label>
                        <div style={{ padding: "7px 9px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 12, background: "#f8fafc", color: "#2563eb", fontWeight: 700, minHeight: 32 }}>
                          {newTime.startedAt && newTime.endedAt
                            ? calcDurationMinutes(newTime.startedAt, newTime.endedAt) > 0
                              ? fmtDuration(calcDurationMinutes(newTime.startedAt, newTime.endedAt))
                              : <span style={{ color: "#dc2626" }}>Ende vor Start</span>
                            : <span style={{ color: "#94a3b8" }}>—</span>}
                        </div>
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
                      disabled={loadingTime || !newTime.startedAt || !newTime.endedAt || calcDurationMinutes(newTime.startedAt, newTime.endedAt) <= 0}
                      style={{
                        padding: "9px 16px", background: "#2563eb", color: "#fff", border: "none",
                        borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        opacity: loadingTime || !newTime.startedAt || !newTime.endedAt || calcDurationMinutes(newTime.startedAt, newTime.endedAt) <= 0 ? 0.5 : 1
                      }}
                    >
                      {loadingTime ? "Speichern..." : "Zeit erfassen"}
                    </button>
                  </div>
                </>
              )}

              {/* ── HISTORY TAB ── */}
              {/* ── DOCUMENTS TAB ── */}
              {activeTab === "documents" && (
                <TaskDocumentsPanel
                  taskId={taskId}
                  documents={documents}
                  uploading={uploading}
                  dragOver={dragOver}
                  setUploading={setUploading}
                  setDragOver={setDragOver}
                  onRefresh={() => api.get(`/tasks/${taskId}/documents`).then(d => setDocuments(Array.isArray(d) ? d : [])).catch(() => {})}
                />
              )}

              {/* ── CHECKLISTS TAB ── */}
              {activeTab === "checklists" && (
                <ChecklistsPanel
                  checklists={Array.isArray(task.checklists) ? task.checklists : []}
                  onSave={async (cls: any[]) => {
                    await api.patch(`/tasks/${taskId}`, { checklists: cls });
                    fetchTask();
                  }}
                />
              )}

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
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>{h.createdAt ? new Date(h.createdAt).toLocaleString("de-CH", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          {formatHistoryEntry(h.action, h.payload)}
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

/* ══════════ Checklists Panel ══════════ */
interface CLItem { id: string; text: string; done: boolean }
interface CList { id: string; title: string; items: CLItem[] }

function ChecklistsPanel({ checklists, onSave }: { checklists: CList[]; onSave: (cls: CList[]) => Promise<void> }) {
  const [cls, setCls] = useState<CList[]>(checklists);
  const [saving, setSaving] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => { setCls(checklists); }, [checklists]);

  const save = async (updated: CList[]) => {
    setCls(updated);
    setSaving(true);
    await onSave(updated).catch(() => {});
    setSaving(false);
  };

  const uid = () => Math.random().toString(36).slice(2, 10);

  const addChecklist = () => {
    if (!newTitle.trim()) return;
    save([...cls, { id: uid(), title: newTitle.trim(), items: [] }]);
    setNewTitle("");
  };

  const deleteChecklist = (clId: string) => {
    save(cls.filter(c => c.id !== clId));
  };

  const addItem = (clId: string, text: string) => {
    if (!text.trim()) return;
    save(cls.map(c => c.id === clId ? { ...c, items: [...c.items, { id: uid(), text: text.trim(), done: false }] } : c));
  };

  const toggleItem = (clId: string, itemId: string) => {
    save(cls.map(c => c.id === clId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) } : c));
  };

  const deleteItem = (clId: string, itemId: string) => {
    save(cls.map(c => c.id === clId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c));
  };

  const saveItemEdit = (clId: string, itemId: string) => {
    if (!editText.trim()) return;
    save(cls.map(c => c.id === clId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, text: editText.trim() } : i) } : c));
    setEditingItem(null);
  };

  return (
    <div>
      {/* Add new checklist */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={newTitle} onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addChecklist()}
          placeholder="Neue Checkliste…"
          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13 }}
        />
        <button onClick={addChecklist} disabled={!newTitle.trim() || saving}
          style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: newTitle.trim() ? 1 : 0.5, whiteSpace: "nowrap" }}>
          + Checkliste
        </button>
      </div>

      {cls.length === 0 && (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>Noch keine Checklisten.</div>
      )}

      {cls.map(cl => {
        const done = cl.items.filter(i => i.done).length;
        const total = cl.items.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <div key={cl.id} style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{cl.title}</span>
                {total > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: done === total ? "#16a34a" : "#64748b", background: done === total ? "#dcfce7" : "#f1f5f9", borderRadius: 10, padding: "1px 8px" }}>
                    {done}/{total} erledigt
                  </span>
                )}
              </div>
              <button onClick={() => deleteChecklist(cl.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 14, padding: "2px 6px" }}>✕</button>
            </div>
            {total > 0 && (
              <div style={{ background: "#e5e7eb", borderRadius: 20, height: 4, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", background: done === total ? "#16a34a" : "#2563eb", borderRadius: 20, width: `${pct}%`, transition: "width 0.3s" }} />
              </div>
            )}
            {cl.items.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                <input type="checkbox" checked={item.done} onChange={() => toggleItem(cl.id, item.id)}
                  style={{ accentColor: "#2563eb", width: 16, height: 16, cursor: "pointer", flexShrink: 0 }} />
                {editingItem === item.id ? (
                  <div style={{ flex: 1, display: "flex", gap: 6 }}>
                    <input value={editText} onChange={e => setEditText(e.target.value)} autoFocus
                      onKeyDown={e => e.key === "Enter" && saveItemEdit(cl.id, item.id)}
                      style={{ flex: 1, padding: "4px 8px", borderRadius: 6, border: "1px solid #2563eb", fontSize: 13 }} />
                    <button onClick={() => saveItemEdit(cl.id, item.id)} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 5, padding: "2px 8px", fontSize: 11, cursor: "pointer" }}>✓</button>
                    <button onClick={() => setEditingItem(null)} style={{ background: "#f1f5f9", border: "none", borderRadius: 5, padding: "2px 8px", fontSize: 11, cursor: "pointer", color: "#64748b" }}>✕</button>
                  </div>
                ) : (
                  <span onClick={() => { setEditingItem(item.id); setEditText(item.text); }}
                    style={{ flex: 1, fontSize: 13, color: item.done ? "#94a3b8" : "#374151", textDecoration: item.done ? "line-through" : "none", cursor: "pointer" }}>
                    {item.text}
                  </span>
                )}
                <button onClick={() => deleteItem(cl.id, item.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", fontSize: 12, padding: "2px 4px" }}>✕</button>
              </div>
            ))}
            <AddItemInput onAdd={(text: string) => addItem(cl.id, text)} />
          </div>
        );
      })}
    </div>
  );
}

function AddItemInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
      <input value={text} onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && text.trim()) { onAdd(text); setText(""); } }}
        placeholder="Neues Item…"
        style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, background: "#fff" }} />
      <button onClick={() => { if (text.trim()) { onAdd(text); setText(""); } }} disabled={!text.trim()}
        style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: text.trim() ? "#2563eb" : "#f1f5f9", color: text.trim() ? "#fff" : "#94a3b8", fontSize: 12, fontWeight: 600, cursor: text.trim() ? "pointer" : "default" }}>+</button>
    </div>
  );
}

/* ══════════ Task Documents Panel ══════════ */
const ALLOWED_EXT = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.dwg', '.dxf'];
const DOC_CATEGORIES = ['Pläne', 'Berichte', 'Verträge', 'Fotos', 'Sonstiges'];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TaskDocumentsPanel({ taskId, documents, uploading, dragOver, setUploading, setDragOver, onRefresh }: {
  taskId: string; documents: any[]; uploading: boolean; dragOver: boolean;
  setUploading: (v: boolean) => void; setDragOver: (v: boolean) => void;
  onRefresh: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = useState("");

  async function handleFiles(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) { alert(`Typ nicht erlaubt: ${ext}`); continue; }
      if (file.size > MAX_FILE_SIZE) { alert(`Datei zu gross (max. 50 MB): ${file.name}`); continue; }
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        if (uploadCategory) formData.append('category', uploadCategory);
        await api.upload(`/tasks/${taskId}/documents/upload`, formData);
        onRefresh();
      } catch { alert(`Upload fehlgeschlagen: ${file.name}`); }
      setUploading(false);
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm('Dokument wirklich löschen?')) return;
    try { await api.delete(`/tasks/documents/${docId}`); onRefresh(); } catch {}
  }

  return (
    <div>
      {/* Category selector */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "#64748b", marginRight: 8 }}>Kategorie (optional):</span>
        <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}
          style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12 }}>
          <option value="">Keine</option>
          {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Drag & Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#2563eb' : '#d1d5db'}`,
          borderRadius: 12, padding: '24px 16px', textAlign: 'center',
          cursor: 'pointer', marginBottom: 16, transition: 'all 0.2s',
          background: dragOver ? '#eff6ff' : '#fafafa',
        }}
      >
        <input ref={fileInputRef} type="file" multiple accept={ALLOWED_EXT.join(',')} style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.length) { handleFiles(e.target.files); e.target.value = ''; } }} />
        <div style={{ fontSize: 20, marginBottom: 4 }}>📎</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: dragOver ? '#2563eb' : '#64748b' }}>
          {uploading ? 'Wird hochgeladen…' : 'Dateien hierher ziehen oder klicken'}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>PDF, DWG, DXF, Bilder, Office · max. 50 MB</div>
      </div>

      {/* Document list */}
      {documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 13 }}>Noch keine Dokumente.</div>
      ) : documents.map((doc: any) => (
        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>📄</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{doc.name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
              {doc.uploadedBy?.name && <span>{doc.uploadedBy.name}</span>}
              {doc.size && <span>{formatFileSize(doc.size)}</span>}
              <span>{new Date(doc.createdAt).toLocaleDateString('de-CH')}</span>
              {doc.category && <span style={{ color: '#7c3aed', fontWeight: 600 }}>{doc.category}</span>}
            </div>
          </div>
          <a href={doc.url} target="_blank" rel="noopener noreferrer" download
            style={{ background: '#eff6ff', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#2563eb', display: 'flex', alignItems: 'center', textDecoration: 'none', fontSize: 12 }}>
            ⬇
          </a>
          <button onClick={() => handleDelete(doc.id)}
            style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', fontSize: 12 }}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
