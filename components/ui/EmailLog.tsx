"use client";
import { useEffect, useState } from "react";
import { api } from "../../src/api/client";
import { useToast } from "./Toast";
import { FiMail, FiArrowUp, FiArrowDown, FiTrash2 } from "react-icons/fi";

interface EmailEntry {
  id: string;
  subject: string;
  body?: string;
  direction: "INBOUND" | "OUTBOUND";
  loggedAt: string;
  loggedBy?: { name?: string };
}

interface EmailLogProps {
  entityType: "account" | "contact";
  entityId: string;
}

export default function EmailLog({ entityType, entityId }: EmailLogProps) {
  const toast = useToast();
  const [logs, setLogs] = useState<EmailEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", body: "", direction: "OUTBOUND" });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchLogs = () => {
    api.get(`/email-logs?entityType=${entityType}&entityId=${entityId}`)
      .then((d: any) => setLogs(Array.isArray(d) ? d : []))
      .catch(() => {});
  };

  useEffect(() => { fetchLogs(); }, [entityId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        [entityType === "account" ? "accountId" : "contactId"]: entityId,
      };
      const created: any = await api.post("/email-logs", payload);
      setLogs((prev) => [created, ...prev]);
      setForm({ subject: "", body: "", direction: "OUTBOUND" });
      setShowForm(false);
      toast.success("E-Mail protokolliert.");
    } catch {
      toast.error("E-Mail konnte nicht protokolliert werden.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/email-logs/${id}`);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      toast.success("E-Mail-Log gelöscht.");
    } catch {
      toast.error("Konnte nicht gelöscht werden.");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>E-Mail-Log</span>
        <button
          onClick={() => setShowForm((s) => !s)}
          style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          {showForm ? "Abbrechen" : "+ E-Mail loggen"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 9, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Betreff *</label>
            <input
              required value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
              style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1.5px solid #d1d5db", fontSize: 13, boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 }}>Inhalt (optional)</label>
            <textarea
              value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
              rows={3} style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1.5px solid #d1d5db", fontSize: 13, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
            />
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select value={form.direction} onChange={(e) => setForm(f => ({ ...f, direction: e.target.value }))}
              style={{ padding: "7px 10px", borderRadius: 6, border: "1.5px solid #d1d5db", fontSize: 13 }}>
              <option value="OUTBOUND">Ausgehend</option>
              <option value="INBOUND">Eingehend</option>
            </select>
            <button type="submit" disabled={saving}
              style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "7px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "…" : "Speichern"}
            </button>
          </div>
        </form>
      )}

      {logs.length === 0 ? (
        <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <FiMail size={22} color="#cbd5e1" />
          Noch keine E-Mails protokolliert.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {logs.map((log) => (
            <div key={log.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: log.body ? "pointer" : "default", background: "#fff" }}
                onClick={() => log.body && setExpanded(expanded === log.id ? null : log.id)}
              >
                <div style={{ color: log.direction === "OUTBOUND" ? "#2563eb" : "#16a34a", flexShrink: 0 }}>
                  {log.direction === "OUTBOUND" ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.subject}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                    {log.loggedBy?.name || "Unbekannt"} · {new Date(log.loggedAt).toLocaleDateString("de-CH", { day: "2-digit", month: "short", year: "numeric" })}
                    {" · "}
                    <span style={{ color: log.direction === "OUTBOUND" ? "#2563eb" : "#16a34a", fontWeight: 600 }}>
                      {log.direction === "OUTBOUND" ? "Ausgehend" : "Eingehend"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }}
                  style={{ background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", padding: 4, flexShrink: 0 }}
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
              {expanded === log.id && log.body && (
                <div style={{ padding: "10px 14px 12px", borderTop: "1px solid #f1f5f9", fontSize: 13, color: "#374151", whiteSpace: "pre-wrap", background: "#f8fafc", lineHeight: 1.6 }}>
                  {log.body}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
