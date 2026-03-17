"use client";
import { useEffect, useState, useRef } from "react";
import { api } from "../../src/api/client";
import { useToast } from "./Toast";
import { FiPlus, FiSend, FiFileText } from "react-icons/fi";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  createdBy?: { name?: string; email?: string };
}

interface QuickNotesProps {
  /** "deal" uses /deals/:id/notes endpoint (structured notes list) */
  entityType: "deal" | "account" | "contact";
  entityId: string;
  /** For accounts/contacts, the current plain-text notes value */
  initialNotes?: string;
}

export default function QuickNotes({ entityType, entityId, initialNotes }: QuickNotesProps) {
  const toast = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [plainNotes, setPlainNotes] = useState(initialNotes || "");
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (entityType === "deal") {
      api.get(`/deals/${entityId}/notes`)
        .then((data: any) => setNotes(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [entityType, entityId]);

  async function handleAddNote() {
    const text = input.trim();
    if (!text) return;
    setSaving(true);
    try {
      if (entityType === "deal") {
        const note = await api.post(`/deals/${entityId}/notes`, { content: text });
        setNotes((prev) => [note, ...prev]);
        toast.success("Notiz hinzugefügt.");
      } else {
        const endpoint = entityType === "account" ? `/accounts/${entityId}` : `/contacts/${entityId}`;
        const combined = plainNotes ? `${plainNotes}\n\n${text}` : text;
        await api.patch(endpoint, { notes: combined });
        setPlainNotes(combined);
        toast.success("Notiz gespeichert.");
      }
      setInput("");
    } catch {
      toast.error("Notiz konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePlain() {
    setSaving(true);
    try {
      const endpoint = entityType === "account" ? `/accounts/${entityId}` : `/contacts/${entityId}`;
      await api.patch(endpoint, { notes: plainNotes });
      toast.success("Notizen gespeichert.");
    } catch {
      toast.error("Notizen konnten nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  if (entityType !== "deal") {
    return (
      <div>
        <textarea
          ref={textareaRef}
          value={plainNotes}
          onChange={(e) => setPlainNotes(e.target.value)}
          placeholder="Notizen hinzufügen…"
          rows={5}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 8,
            border: "1.5px solid #e5e7eb", fontSize: 13, color: "#1e293b",
            resize: "vertical", background: "#f8fafc", boxSizing: "border-box",
            fontFamily: "inherit", lineHeight: 1.6,
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button
            onClick={handleSavePlain}
            disabled={saving}
            style={{
              background: "#2563eb", color: "#fff", border: "none", borderRadius: 7,
              padding: "7px 16px", fontWeight: 600, fontSize: 13,
              cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Speichern…" : "Speichern"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
          disabled={saving || !input.trim()}
          style={{
            background: "#2563eb", color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 14px", cursor: (saving || !input.trim()) ? "not-allowed" : "pointer",
            opacity: (saving || !input.trim()) ? 0.5 : 1,
            display: "flex", alignItems: "center", gap: 5, fontWeight: 600, fontSize: 13,
          }}
        >
          <FiSend size={13} />
          {saving ? "…" : "Senden"}
        </button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <FiFileText size={22} color="#cbd5e1" />
          Noch keine Notizen.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notes.map((n) => (
            <div key={n.id} style={{
              background: "#fffbeb", border: "1px solid #fef08a", borderRadius: 8,
              padding: "10px 14px",
            }}>
              <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{n.content}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                {n.createdBy?.name || n.createdBy?.email || "Unbekannt"} ·{" "}
                {new Date(n.createdAt).toLocaleDateString("de-CH", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
