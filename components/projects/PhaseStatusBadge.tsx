"use client";
import { FiPlay, FiCheck, FiRotateCcw } from "react-icons/fi";

export type PhaseStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";

interface PhaseStatusBadgeProps {
  status: PhaseStatus;
  onChange?: (newStatus: PhaseStatus) => void;
  canEdit?: boolean;
  compact?: boolean;
}

const STATUS_CFG: Record<PhaseStatus, { label: string; color: string; bg: string; border: string }> = {
  PENDING:     { label: "Nicht gestartet", color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" },
  IN_PROGRESS: { label: "In Bearbeitung",  color: "#d97706", bg: "#fef3c7", border: "#fcd34d" },
  COMPLETED:   { label: "Abgeschlossen",   color: "#15803d", bg: "#dcfce7", border: "#86efac" },
  ON_HOLD:     { label: "Pausiert",        color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" },
};

export default function PhaseStatusBadge({ status, onChange, canEdit = false, compact = false }: PhaseStatusBadgeProps) {
  const cfg = STATUS_CFG[status];
  const fontSize = compact ? 10 : 11;
  const pad = compact ? "2px 8px" : "4px 10px";

  const badge = (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize, fontWeight: 700, color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.border}`, borderRadius: 10, padding: pad, whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );

  if (!canEdit || !onChange) return badge;

  let action: { label: string; next: PhaseStatus; icon: React.ReactNode } | null = null;
  if (status === "PENDING") action = { label: "Starten", next: "IN_PROGRESS", icon: <FiPlay size={11} /> };
  else if (status === "IN_PROGRESS") action = { label: "Abschließen", next: "COMPLETED", icon: <FiCheck size={11} /> };
  else if (status === "COMPLETED") action = { label: "Wieder öffnen", next: "PENDING", icon: <FiRotateCcw size={11} /> };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {badge}
      {action && (
        <button
          onClick={(e) => { e.stopPropagation(); onChange(action!.next); }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "#1a1a1a", color: "#fff", border: "none",
            borderRadius: 8, padding: compact ? "3px 9px" : "4px 11px",
            fontSize: compact ? 10 : 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
          }}
          title={action.label}
        >
          {action.icon} {action.label}
        </button>
      )}
    </span>
  );
}
