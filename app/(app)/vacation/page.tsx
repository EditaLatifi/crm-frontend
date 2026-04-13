"use client";
import { useEffect, useState } from "react";
import { api } from "../../../src/api/client";
import { useToast } from "../../../components/ui/Toast";
import './vacation-mobile.css';
import Modal from "../../../components/ui/Modal";
import { FiUmbrella } from "react-icons/fi";

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

interface MyStats {
  year: number;
  used: number;
  quota: number | null;
  remaining: number | null;
}

const TYPE_LABELS: Record<string, string> = {
  VACATION: "Urlaub",
  SICK: "Krankenstand",
  MILITARY_SERVICE: "Militärdienst",
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
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ startDate: "", endDate: "", type: "VACATION", note: "" });
  const [saving, setSaving] = useState(false);
  const [previewDays, setPreviewDays] = useState(0);

  const fetchAll = () => {
    Promise.all([
      api.get("/vacation/mine"),
      api.get("/vacation/my-stats"),
    ]).then(([reqs, stats]: any) => {
      setRequests(Array.isArray(reqs) ? reqs : []);
      setMyStats(stats && typeof stats === "object" ? stats : null);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

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
      setRequests(prev => [created, ...prev]);
      setModalOpen(false);
      setForm({ startDate: "", endDate: "", type: "VACATION", note: "" });
      toast.success("Urlaubsantrag eingereicht.");
      fetchAll();
    } catch (e: any) {
      toast.error(e.message || "Antrag konnte nicht eingereicht werden.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Urlaubsantrag wirklich stornieren?')) return;
    try {
      await api.delete(`/vacation/${id}`);
      setRequests(prev => prev.filter(r => r.id !== id));
      toast.success("Antrag storniert.");
    } catch {
      toast.error("Konnte nicht storniert werden.");
    }
  }

  const pending = requests.filter(r => r.status === "PENDING").length;
  const year = myStats?.year ?? new Date().getFullYear();

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 40px", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div className="vacation-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Meine Urlaubsanträge</h1>
          <div style={{ fontSize: 13, color: "#999", fontWeight: 400, marginTop: 4 }}>Verwalte deine Urlaubsanträge und freie Tage.</div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          style={{ fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", background: "#1a1a1a", color: "#fff", padding: "9px 20px", cursor: "pointer" }}
        >
          + Antrag stellen
        </button>
      </div>

      {/* Stats cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        {myStats?.quota != null ? (
          <>
            <div style={{ flex: 1, minWidth: 160, background: "#fff", border: "1px solid #E8E4DE", borderLeft: "4px solid #1a1a1a", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Kontingent {year}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>{myStats.quota} AT</div>
            </div>
            <div style={{ flex: 1, minWidth: 160, background: "#fff", border: "1px solid #E8E4DE", borderLeft: "4px solid #16a34a", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Verbraucht</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>{myStats.used} AT</div>
            </div>
            <div style={{ flex: 1, minWidth: 160, background: "#fff", border: `1px solid #E8E4DE`, borderLeft: `4px solid ${(myStats.remaining ?? 0) < 0 ? "#dc2626" : "#7c3aed"}`, borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Verbleibend</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: (myStats.remaining ?? 0) < 0 ? "#dc2626" : "#1a1a1a" }}>{myStats.remaining} AT</div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, minWidth: 160, background: "#fff", border: "1px solid #E8E4DE", borderLeft: "4px solid #16a34a", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Genehmigte Tage ({year})</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>{myStats?.used ?? 0} AT</div>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 160, background: "#fff", border: "1px solid #E8E4DE", borderLeft: "4px solid #d97706", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Ausstehende Anträge</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>{pending}</div>
        </div>
        <div style={{ flex: 1, minWidth: 160, background: "#fff", border: "1px solid #E8E4DE", borderLeft: "4px solid #1a1a1a", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Anträge gesamt</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>{requests.length}</div>
        </div>
      </div>

      {/* Request list */}
      <div style={{ background: "#fff", border: "1px solid #E8E4DE", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #E8E4DE" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>Alle Anträge</span>
        </div>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Laden…</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            <FiUmbrella size={36} style={{ marginBottom: 8, color: "#cbd5e1" }} />
            <div>Noch keine Urlaubsanträge gestellt.</div>
          </div>
        ) : (
          requests.map(r => {
            const s = STATUS_STYLE[r.status];
            return (
              <div key={r.id} style={{ padding: "16px 20px", borderBottom: "1px solid #FAF9F6", display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flexShrink: 0, textAlign: "center", background: "#FAF9F6", borderRadius: 10, padding: "10px 14px", minWidth: 70 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a" }}>
                    {new Date(r.startDate).getDate()}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    {new Date(r.startDate).toLocaleDateString("de-CH", { month: "short" })}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
                      {TYPE_LABELS[r.type] || r.type}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, borderRadius: 20, padding: "2px 10px" }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: 12, color: "#64748b", background: "#E8E4DE", borderRadius: 6, padding: "2px 8px" }}>
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
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Bis *</label>
              <input
                type="date" required
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
          </div>

          {previewDays > 0 && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 14px", marginBottom: 14, fontSize: 13, color: "#1a1a1a", fontWeight: 600 }}>
              📅 {previewDays} Arbeitstag{previewDays !== 1 ? "e" : ""} ausgewählt
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Typ</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
            >
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Notiz (optional)</label>
            <textarea
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              rows={3}
              placeholder="z.B. Familienurlaub, Arzttermin…"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button type="button" onClick={() => setModalOpen(false)}
              style={{ background: "#E8E4DE", color: "#64748b", border: "none", borderRadius: 7, padding: "9px 20px", fontWeight: 600, cursor: "pointer" }}>
              Abbrechen
            </button>
            <button type="submit" disabled={saving || previewDays === 0}
              style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", fontWeight: 700, cursor: "pointer", opacity: (saving || previewDays === 0) ? 0.6 : 1 }}>
              {saving ? "Einreichen…" : "Antrag einreichen"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
