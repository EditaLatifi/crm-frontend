"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "../../src/api/client";
import { useToast } from "../ui/Toast";
import { FiPlus, FiCheck, FiTrash2, FiClock, FiUser } from "react-icons/fi";

interface User { id: string; name?: string; email?: string }
interface FollowUp {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  completed: boolean;
  completedAt?: string | null;
  assignedTo?: User | null;
  createdBy?: User | null;
}

interface Props {
  entityType: "Contact" | "Account" | "Deal" | "Project";
  entityId: string;
}

export default function FollowUpSection({ entityType, entityId }: Props) {
  const toast = useToast();
  const [items, setItems] = useState<FollowUp[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", assignedToUserId: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/follow-ups?entityType=${entityType}&entityId=${entityId}`);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (creating && users.length === 0) {
      api.get("/users").then((d: any) => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
    }
  }, [creating, users.length]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.dueDate) return;
    setSaving(true);
    try {
      await api.post("/follow-ups", {
        entityType,
        entityId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        dueDate: form.dueDate,
        assignedToUserId: form.assignedToUserId || undefined,
      });
      setForm({ title: "", description: "", dueDate: "", assignedToUserId: "" });
      setCreating(false);
      toast.success("Follow-up erstellt — Benachrichtigung gesendet.");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Follow-up konnte nicht erstellt werden.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleCompleted(item: FollowUp) {
    try {
      await api.patch(`/follow-ups/${item.id}`, { completed: !item.completed });
      load();
    } catch {
      toast.error("Status konnte nicht aktualisiert werden.");
    }
  }

  async function remove(item: FollowUp) {
    if (!confirm("Follow-up löschen?")) return;
    try {
      await api.delete(`/follow-ups/${item.id}`);
      toast.success("Follow-up gelöscht.");
      load();
    } catch {
      toast.error("Löschen fehlgeschlagen.");
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const open = items.filter(i => !i.completed);
  const done = items.filter(i => i.completed);

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #e5e7eb", padding: "18px 24px", marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Follow-ups{open.length > 0 && <span style={{ marginLeft: 8, fontSize: 11, color: "#64748b", fontWeight: 500 }}>({open.length} offen)</span>}</div>
        <button
          onClick={() => setCreating(c => !c)}
          style={{ display: "inline-flex", alignItems: "center", gap: 4, background: creating ? "#f1f5f9" : "#1a1a1a", color: creating ? "#64748b" : "#fff", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          {creating ? "Abbrechen" : <><FiPlus size={12} /> Neu</>}
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px", marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            required
            placeholder="Titel (z.B. Nachfassen wegen Offerte)"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
          />
          <textarea
            placeholder="Beschreibung (optional)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, minHeight: 50, resize: "vertical", fontFamily: "inherit" }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input
              required
              type="date"
              value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
            />
            <select
              value={form.assignedToUserId}
              onChange={e => setForm(f => ({ ...f, assignedToUserId: e.target.value }))}
              style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, background: "#fff" }}
            >
              <option value="">Mir zuweisen</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{ alignSelf: "flex-end", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Erstellen…" : "Erstellen"}
          </button>
        </form>
      )}

      {loading && <div style={{ color: "#94a3b8", fontSize: 12 }}>Wird geladen…</div>}

      {!loading && items.length === 0 && !creating && (
        <div style={{ color: "#94a3b8", fontSize: 12, padding: "8px 0" }}>Keine Follow-ups geplant.</div>
      )}

      {open.map(item => {
        const due = new Date(item.dueDate);
        const overdue = due < today;
        return (
          <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
            <button
              onClick={() => toggleCompleted(item)}
              title="Als erledigt markieren"
              style={{ width: 18, height: 18, borderRadius: 4, border: "1.5px solid #cbd5e1", background: "#fff", cursor: "pointer", flexShrink: 0, marginTop: 2, padding: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{item.title}</div>
              {item.description && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, whiteSpace: "pre-wrap" }}>{item.description}</div>}
              <div style={{ fontSize: 11, color: overdue ? "#dc2626" : "#64748b", marginTop: 4, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <FiClock size={11} />
                  {overdue ? "Überfällig: " : "Fällig: "}
                  {due.toLocaleDateString("de-CH")}
                </span>
                {item.assignedTo?.name && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <FiUser size={11} />
                    {item.assignedTo.name}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => remove(item)}
              title="Löschen"
              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4, flexShrink: 0 }}
            >
              <FiTrash2 size={13} />
            </button>
          </div>
        );
      })}

      {done.length > 0 && (
        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: "pointer", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{done.length} erledigt</summary>
          {done.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9", opacity: 0.6 }}>
              <button
                onClick={() => toggleCompleted(item)}
                title="Wieder öffnen"
                style={{ width: 18, height: 18, borderRadius: 4, border: "1.5px solid #16a34a", background: "#16a34a", cursor: "pointer", flexShrink: 0, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                <FiCheck size={11} />
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "#1e293b", textDecoration: "line-through" }}>{item.title}</div>
              </div>
              <button
                onClick={() => remove(item)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4 }}
              >
                <FiTrash2 size={13} />
              </button>
            </div>
          ))}
        </details>
      )}
    </div>
  );
}
