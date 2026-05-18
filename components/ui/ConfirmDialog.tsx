"use client";
import React from "react";
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Bestätigen",
  cancelLabel = "Abbrechen",
  confirmTone = "primary",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: "primary" | "danger";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmBg = confirmTone === "danger" ? "#dc2626" : "#1a1a1a";
  const confirmHoverBg = confirmTone === "danger" ? "#b91c1c" : "#111";

  return (
    <Modal open={open} onClose={onCancel} title={title} width={460}>
      <div style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.55, marginBottom: 22 }}>
        {message}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button
          onClick={onCancel}
          disabled={busy}
          style={{
            background: "#E8E4DE", color: "#1a1a1a", border: "none",
            borderRadius: 8, padding: "9px 18px", fontWeight: 600, fontSize: 13,
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          style={{
            background: confirmBg, color: "#fff", border: "none",
            borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13,
            cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!busy) (e.currentTarget as HTMLElement).style.background = confirmHoverBg;
          }}
          onMouseLeave={(e) => {
            if (!busy) (e.currentTarget as HTMLElement).style.background = confirmBg;
          }}
        >
          {busy ? "…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
