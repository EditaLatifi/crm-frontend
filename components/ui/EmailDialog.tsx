"use client";
import { useEffect, useState } from "react";
import { api } from "../../src/api/client";
import { useToast } from "./Toast";
import { FiX, FiSend } from "react-icons/fi";

interface EmailDialogProps {
  open: boolean;
  onClose: () => void;
  defaultTo?: string;
  defaultSubject?: string;
  defaultBody?: string;
  entityType: "Contact" | "Account" | "Deal" | "Project";
  entityId: string;
  accountId?: string;
  contactId?: string;
}

export default function EmailDialog({
  open, onClose,
  defaultTo = "", defaultSubject = "", defaultBody = "",
  entityType, entityId, accountId, contactId,
}: EmailDialogProps) {
  const toast = useToast();
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setTo(defaultTo);
      setSubject(defaultSubject);
      setBody(defaultBody);
    }
  }, [open, defaultTo, defaultSubject, defaultBody]);

  if (!open) return null;

  async function handleSend() {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      toast.error("Empfänger, Betreff und Text sind erforderlich.");
      return;
    }
    setSending(true);
    try {
      await api.post("/email/send", {
        to: to.trim(),
        subject: subject.trim(),
        text: body,
        entityType,
        entityId,
        accountId: accountId ?? null,
        contactId: contactId ?? null,
      });
      toast.success("E-Mail gesendet.");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "E-Mail konnte nicht gesendet werden.");
    } finally {
      setSending(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db",
    fontSize: 14, boxSizing: "border-box", fontFamily: "inherit",
  };
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 560, boxShadow: "0 16px 48px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>E-Mail senden</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
            <FiX size={16} />
          </button>
        </div>
        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={lbl}>An *</label>
            <input type="email" value={to} onChange={e => setTo(e.target.value)} style={inp} placeholder="empfaenger@example.com" />
          </div>
          <div>
            <label style={lbl}>Betreff *</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Text *</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              style={{ ...inp, minHeight: 140, resize: "vertical" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "12px 22px 18px", borderTop: "1px solid #f1f5f9" }}>
          <button onClick={onClose} disabled={sending} style={{ background: "#E8E4DE", color: "#64748b", border: "none", borderRadius: 7, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Abbrechen
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 7, padding: "8px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: sending ? 0.7 : 1 }}
          >
            <FiSend size={12} />
            {sending ? "Senden…" : "Senden"}
          </button>
        </div>
      </div>
    </div>
  );
}
