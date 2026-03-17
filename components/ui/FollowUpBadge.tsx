"use client";
import { useState } from "react";
import { api } from "../../src/api/client";
import { useToast } from "./Toast";

interface FollowUpBadgeProps {
  entityType: "contact" | "deal";
  entityId: string;
  followUpDate?: string | null;
  onUpdated?: () => void;
}

export default function FollowUpBadge({ entityType, entityId, followUpDate, onUpdated }: FollowUpBadgeProps) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(followUpDate ? followUpDate.slice(0, 10) : "");
  const [saving, setSaving] = useState(false);

  const isOverdue = followUpDate && new Date(followUpDate) < new Date();

  async function handleSave() {
    setSaving(true);
    try {
      const endpoint = entityType === "contact" ? `/contacts/${entityId}` : `/deals/${entityId}`;
      await api.patch(endpoint, { followUpDate: value || null });
      toast.success("Follow-up Datum gespeichert.");
      setEditing(false);
      onUpdated?.();
    } catch {
      toast.error("Follow-up Datum konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setSaving(true);
    try {
      const endpoint = entityType === "contact" ? `/contacts/${entityId}` : `/deals/${entityId}`;
      await api.patch(endpoint, { followUpDate: null });
      toast.success("Follow-up Datum entfernt.");
      setValue("");
      setEditing(false);
      onUpdated?.();
    } catch {
      toast.error("Follow-up Datum konnte nicht entfernt werden.");
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            padding: "5px 10px", borderRadius: 6, border: "1.5px solid #d1d5db",
            fontSize: 13, outline: "none",
          }}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
        >
          {saving ? "…" : "OK"}
        </button>
        {followUpDate && (
          <button
            onClick={handleClear}
            disabled={saving}
            style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "5px 10px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
          >
            Löschen
          </button>
        )}
        <button
          onClick={() => setEditing(false)}
          style={{ background: "none", color: "#94a3b8", border: "none", fontSize: 13, cursor: "pointer" }}
        >
          ✕
        </button>
      </div>
    );
  }

  if (!followUpDate) {
    return (
      <button
        onClick={() => setEditing(true)}
        style={{
          background: "#f1f5f9", color: "#64748b", border: "1px dashed #cbd5e1",
          borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}
      >
        + Follow-up setzen
      </button>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: isOverdue ? "#fef2f2" : "#f0fdf4",
        color: isOverdue ? "#dc2626" : "#16a34a",
        border: `1px solid ${isOverdue ? "#fecaca" : "#bbf7d0"}`,
        borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer",
      }}
    >
      {isOverdue && <span>⚠</span>}
      {isOverdue ? "Überfällig: " : "Follow-up: "}
      {new Date(followUpDate).toLocaleDateString("de-CH")}
    </button>
  );
}
