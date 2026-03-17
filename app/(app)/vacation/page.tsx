"use client";
import { useEffect, useState } from "react";
import { api } from "../../../src/api/client";
import { useToast } from "../../../components/ui/Toast";
import Modal from "../../../components/ui/Modal";

interface VacationRequest {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  type: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note?: string;
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: { name: string };
}

const TYPE_LABELS: Record<string, string> = {
  VACATION: "Urlaub",
  SICK: "Krankenstand",
  UNPAID: "Unbezahlt",
  OTHER: "Sonstiges",
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:  { bg: "#fef3c7", color: "#d97706", label: "Ausstehend" },
  APPROVED: { bg: "#dcfce7", color: "#16a34a", label: "Genehmigt" },
  REJECTED: { bg: "#fee2e2", color: "#dc2626", label: "Abgelehnt" },
};

function calcDays(start: string, end: string): number {
  if (!start || !end) return 0;
  let count = 0;
  const cur = new Date(start);
  const endDate = new Date(end);
  while (cur <= endDate) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export default function VacationPage() {
  const toast = useToast();
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ startDate: "", endDate: "", type: "VACATION", note: "" });
  const [saving, setSaving] = useState(false);
  const [previewDays, setPreviewDays] = useState(0);

  const fetchRequests = () => {
    api.get("/vacation/mine")
      .then((d: any) => { setRequests(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  useEffect(() => {
    setPreviewDays(calcDays(form.startDate, form.endDate));
  }, [form.startDate, form.endDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.startDate || !form.endDate) return;
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error("Enddatum muss nach dem Startdatum liegen.");
      return;
    }
    setSaving(true);
    try {
      const created: any = await api.post("/vacation", form);
      setRequests((prev) => [created, ...prev]);
      setModalOpen(false);
      setForm({ startDate: "", endDate: "", type: "VACATION", note: "" });
      toast.success("Urlaubsantrag eingereicht.");
    } catch (e: any) {
      toast.error(e.message || "Antrag konnte nicht eingereicht werden.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(id: string) {
    try {
      await api.delete(`/vacation/${id}`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success("Antrag storniert.");
    } catch {
      toast.error("Konnte nicht storniert werden.");
    }
  }

  const approved = requests.filter((r) => r.status === "APPROVED");
  const totalDays = approved.reduce((s, r) => s + r.days, 0);
  const pending = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: 0 }}>Meine Urlaubsanträge</h1>
          <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
            Verwalte deine Urlaubsanträge und freie Tage.
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          + Antrag stellen
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { label: "Genehmigte Tage (dieses Jahr)", value: totalDays, color: "#16a34a", icon: "✅" },
          { label: "Ausstehende Anträge", value: pending, color: "#d97706", icon: "⏳" },
          { label: "Anträge gesamt", value: requests.length, color: "#2563eb", icon: "📋" },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, minWidth: 180, background: "#fff", border: `1.5px solid #e5e7eb`, borderLeft: `4px solid ${s.color}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1e293b" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Request list */}
      <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Alle Anträge</span>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Laden…</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🏖️</div>
            Noch keine Urlaubsanträge gestellt.
          </div>
        ) : (
          requests.map((r) => {
            const s = STATUS_STYLE[r.status];
            return (
              <div key={r.id} style={{ padding: "16px 20px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "flex-start", gap: 16 }}>
                {/* Date block */}
                <div style={{ flexShrink: 0, textAlign: "center", background: "#f8fafc", borderRadius: 10, padding: "10px 14px", minWidth: 70 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#2563eb" }}>
                    {new Date(r.startDate).getDate()}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {new Date(r.startDate).toLocaleDateString("de-CH", { month: "short" })}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                      {TYPE_LABELS[r.type] || r.type}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, borderRadius: 20, padding: "2px 10px" }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: 12, color: "#64748b", background: "#f1f5f9", borderRadius: 6, padding: "2px 8px" }}>
                      {r.days} Arbeitstag{r.days !== 1 ? "e" : ""}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    {new Date(r.startDate).toLocaleDateString("de-CH")}
                    {" – "}
                    {new Date(r.endDate).toLocaleDateString("de-CH")}
                  </div>
                  {r.note && (
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>"{r.note}"</div>
                  )}
                  {r.adminNote && (
                    <div style={{ fontSize: 12, color: r.status === "APPROVED" ? "#16a34a" : "#dc2626", marginTop: 4 }}>
                      Admin: {r.adminNote}
                    </div>
                  )}
                  {r.reviewedBy && r.reviewedAt && (
                    <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2 }}>
                      {r.status === "APPROVED" ? "Genehmigt" : "Abgelehnt"} von {r.reviewedBy.name} · {new Date(r.reviewedAt).toLocaleDateString("de-CH")}
                    </div>
                  )}
                </div>

                {/* Action */}
                {r.status === "PENDING" && (
                  <button
                    onClick={() => handleCancel(r.id)}
                    style={{ flexShrink: 0, background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Stornieren
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New request modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Urlaubsantrag stellen">
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Von *</label>
              <input
                type="date" required
                value={form.startDate}
                onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Bis *</label>
              <input
                type="date" required
                value={form.endDate}
                onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
          </div>

          {previewDays > 0 && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: 13, color: "#2563eb", fontWeight: 600 }}>
              📅 {previewDays} Arbeitstag{previewDays !== 1 ? "e" : ""} ausgewählt
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Typ</label>
            <select
              value={form.type}
              onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
            >
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Notiz (optional)</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
              rows={3}
              placeholder="z.B. Familienurlaub, Arzttermin…"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button type="button" onClick={() => setModalOpen(false)}
              style={{ background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 7, padding: "9px 20px", fontWeight: 600, cursor: "pointer" }}>
              Abbrechen
            </button>
            <button type="submit" disabled={saving || previewDays === 0}
              style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", fontWeight: 700, cursor: "pointer", opacity: (saving || previewDays === 0) ? 0.6 : 1 }}>
              {saving ? "Einreichen…" : "Antrag einreichen"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
