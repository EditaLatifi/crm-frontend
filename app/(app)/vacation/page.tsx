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
    <div style={{ padding: "28px 32px 40px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div className="vacation-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Meine Urlaubsanträge</h1>
        <button
          onClick={() => setModalOpen(true)}
          style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
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

      {/* Visual Calendar Timeline */}
      {requests.filter(r => r.status !== 'REJECTED').length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #E8E4DE", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}>Kalenderübersicht {year}</div>
          {(() => {
            const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
            const yearStart = new Date(year, 0, 1).getTime();
            const yearEnd = new Date(year, 11, 31).getTime();
            const totalDays = Math.ceil((yearEnd - yearStart) / (1000 * 60 * 60 * 24)) + 1;
            const approved = requests.filter(r => r.status === 'APPROVED');
            const pending = requests.filter(r => r.status === 'PENDING');

            const getBarStyle = (r: VacationRequest): React.CSSProperties => {
              const start = Math.max(new Date(r.startDate).getTime(), yearStart);
              const end = Math.min(new Date(r.endDate).getTime(), yearEnd);
              const leftPct = ((start - yearStart) / (1000 * 60 * 60 * 24) / totalDays) * 100;
              const widthPct = Math.max(((end - start) / (1000 * 60 * 60 * 24) + 1) / totalDays * 100, 0.5);
              return {
                position: 'absolute', left: `${leftPct}%`, width: `${widthPct}%`,
                height: 8, borderRadius: 4, top: 0,
              };
            };

            return (
              <div>
                {/* Month labels */}
                <div style={{ display: 'flex', marginBottom: 4 }}>
                  {months.map((m, i) => (
                    <div key={i} style={{ flex: 1, fontSize: 10, color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>{m}</div>
                  ))}
                </div>
                {/* Timeline bar */}
                <div style={{ position: 'relative', height: 32, background: '#f8fafc', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  {/* Month grid lines */}
                  {months.map((_, i) => (
                    <div key={i} style={{ position: 'absolute', left: `${(i / 12) * 100}%`, top: 0, bottom: 0, width: 1, background: '#e5e7eb' }} />
                  ))}
                  {/* Today marker */}
                  {(() => {
                    const today = new Date();
                    if (today.getFullYear() === year) {
                      const todayPct = ((today.getTime() - yearStart) / (1000 * 60 * 60 * 24) / totalDays) * 100;
                      return <div style={{ position: 'absolute', left: `${todayPct}%`, top: 0, bottom: 0, width: 2, background: '#dc2626', zIndex: 2 }} />;
                    }
                    return null;
                  })()}
                  {/* Approved bars (green) */}
                  <div style={{ position: 'absolute', top: 4, left: 0, right: 0 }}>
                    {approved.map(r => (
                      <div key={r.id} style={{ ...getBarStyle(r), background: '#22c55e' }} title={`${TYPE_LABELS[r.type] || r.type}: ${new Date(r.startDate).toLocaleDateString('de-CH')} – ${new Date(r.endDate).toLocaleDateString('de-CH')} (${r.days} Tage)`} />
                    ))}
                  </div>
                  {/* Pending bars (yellow) */}
                  <div style={{ position: 'absolute', top: 18, left: 0, right: 0 }}>
                    {pending.map(r => (
                      <div key={r.id} style={{ ...getBarStyle(r), background: '#f59e0b' }} title={`Ausstehend: ${new Date(r.startDate).toLocaleDateString('de-CH')} – ${new Date(r.endDate).toLocaleDateString('de-CH')} (${r.days} Tage)`} />
                    ))}
                  </div>
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: '#22c55e' }} /> Genehmigt</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: '#f59e0b' }} /> Ausstehend</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 2, height: 10, background: '#dc2626' }} /> Heute</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

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
