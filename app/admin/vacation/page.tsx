"use client";
import { useEffect, useState } from "react";
import './admin-vacation-mobile.css';
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
  user: { id: string; name: string; email: string };
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

const TYPE_ICONS: Record<string, string> = {
  VACATION: "🏖️",
  SICK: "🤒",
  UNPAID: "💸",
  OTHER: "📝",
};

export default function AdminVacationPage() {
  const toast = useToast();
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [reviewModal, setReviewModal] = useState<VacationRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"requests" | "stats" | "calendar">("requests");

  const fetchAll = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (yearFilter) params.set("year", yearFilter);
    Promise.all([
      api.get(`/vacation?${params}`),
      api.get(`/vacation/stats?year=${yearFilter}`),
    ]).then(([reqs, st]: any) => {
      setRequests(Array.isArray(reqs) ? reqs : []);
      setStats(Array.isArray(st) ? st : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [statusFilter, yearFilter]);

  async function handleReview(action: "APPROVED" | "REJECTED") {
    if (!reviewModal) return;
    setSaving(true);
    try {
      const updated: any = await api.patch(`/vacation/${reviewModal.id}/review`, { action, adminNote });
      setRequests((prev) => prev.map((r) => r.id === updated.id ? updated : r));
      toast.success(action === "APPROVED" ? "Antrag genehmigt." : "Antrag abgelehnt.");
      setReviewModal(null);
      setAdminNote("");
      fetchAll();
    } catch {
      toast.error("Fehler beim Aktualisieren.");
    } finally {
      setSaving(false);
    }
  }

  // Group requests by user for calendar view
  function getCalendarData() {
    const users: Record<string, { name: string; periods: VacationRequest[] }> = {};
    for (const r of requests.filter(r => r.status === "APPROVED")) {
      if (!users[r.user.id]) users[r.user.id] = { name: r.user.name, periods: [] };
      users[r.user.id].periods.push(r);
    }
    return Object.values(users);
  }

  const pendingCount = requests.filter(r => r.status === "PENDING").length;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div className="admin-vacation-header" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: 0 }}>Urlaubsverwaltung</h1>
        <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>Übersicht und Genehmigung aller Urlaubsanträge.</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#f1f5f9", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[
          { key: "requests", label: `Anträge${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
          { key: "stats", label: "Statistik" },
          { key: "calendar", label: "Kalenderübersicht" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{
              padding: "7px 18px", borderRadius: 7, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: tab === t.key ? "#fff" : "transparent",
              color: tab === t.key ? "#1e293b" : "#64748b",
              boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 13 }}>
          <option value="">Alle Status</option>
          <option value="PENDING">Ausstehend</option>
          <option value="APPROVED">Genehmigt</option>
          <option value="REJECTED">Abgelehnt</option>
        </select>
        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 13 }}>
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>

      {/* REQUESTS TAB */}
      {tab === "requests" && (
        <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Laden…</div>
          ) : requests.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
              Keine Anträge gefunden.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Mitarbeiter", "Typ", "Zeitraum", "Tage", "Status", "Notiz", "Aktion"].map((h) => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const s = STATUS_STYLE[r.status];
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{r.user.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.user.email}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>
                        {TYPE_ICONS[r.type]} {TYPE_LABELS[r.type] || r.type}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#1e293b" }}>
                        <div>{new Date(r.startDate).toLocaleDateString("de-CH")}</div>
                        <div style={{ color: "#94a3b8" }}>bis {new Date(r.endDate).toLocaleDateString("de-CH")}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: "#2563eb" }}>
                        {r.days}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, borderRadius: 20, padding: "3px 10px" }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b", maxWidth: 200 }}>
                        {r.note && <div style={{ fontStyle: "italic" }}>"{r.note}"</div>}
                        {r.adminNote && <div style={{ color: r.status === "APPROVED" ? "#16a34a" : "#dc2626", marginTop: 2 }}>{r.adminNote}</div>}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {r.status === "PENDING" ? (
                          <button
                            onClick={() => { setReviewModal(r); setAdminNote(""); }}
                            style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                          >
                            Bearbeiten
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            {r.reviewedBy?.name}<br />
                            {r.reviewedAt && new Date(r.reviewedAt).toLocaleDateString("de-CH")}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* STATS TAB */}
      {tab === "stats" && (
        <div>
          {stats.length === 0 ? (
            <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "32px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
              Keine genehmigten Urlaubstage für {yearFilter}.
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Mitarbeiter", "Genehmigte Tage", "Anträge", "Durchschnitt / Antrag"].map((h) => (
                      <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...stats].sort((a, b) => b.days - a.days).map((s, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{s.user.name}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{s.user.email}</div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 20, height: 8, overflow: "hidden", maxWidth: 120 }}>
                            <div style={{ height: "100%", background: "#2563eb", borderRadius: 20, width: `${Math.min(100, (s.days / 30) * 100)}%` }} />
                          </div>
                          <span style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{s.days}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px", fontSize: 14, color: "#64748b" }}>{s.requests}</td>
                      <td style={{ padding: "14px 20px", fontSize: 14, color: "#64748b" }}>
                        {s.requests > 0 ? (s.days / s.requests).toFixed(1) : "—"} Tage
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CALENDAR TAB */}
      {tab === "calendar" && (
        <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Genehmigte Urlaubszeiten – {yearFilter}</span>
          </div>
          {getCalendarData().length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
              Keine genehmigten Urlaubsanträge.
            </div>
          ) : (
            getCalendarData().map((u, i) => (
              <div key={i} style={{ padding: "16px 20px", borderBottom: "1px solid #f8fafc" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>{u.name}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {u.periods.map((r) => (
                    <div key={r.id} style={{
                      background: "#dbeafe", color: "#1d4ed8", borderRadius: 8, padding: "6px 14px",
                      fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <span>{TYPE_ICONS[r.type]}</span>
                      <span>
                        {new Date(r.startDate).toLocaleDateString("de-CH", { day: "2-digit", month: "short" })}
                        {" – "}
                        {new Date(r.endDate).toLocaleDateString("de-CH", { day: "2-digit", month: "short" })}
                      </span>
                      <span style={{ background: "#bfdbfe", borderRadius: 4, padding: "1px 6px" }}>{r.days}d</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                  {u.periods.reduce((s, r) => s + r.days, 0)} Arbeitstage total
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Review Modal */}
      <Modal open={!!reviewModal} onClose={() => setReviewModal(null)} title="Antrag bearbeiten">
        {reviewModal && (
          <div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                {TYPE_ICONS[reviewModal.type]} {TYPE_LABELS[reviewModal.type]} — {reviewModal.user.name}
              </div>
              <div style={{ fontSize: 13, color: "#64748b" }}>
                {new Date(reviewModal.startDate).toLocaleDateString("de-CH")}
                {" bis "}
                {new Date(reviewModal.endDate).toLocaleDateString("de-CH")}
                {" · "}
                <b style={{ color: "#2563eb" }}>{reviewModal.days} Arbeitstage</b>
              </div>
              {reviewModal.note && (
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, fontStyle: "italic" }}>"{reviewModal.note}"</div>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
                Admin-Notiz (optional)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                placeholder="Kommentar für den Mitarbeiter…"
                style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setReviewModal(null)}
                style={{ background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 7, padding: "9px 18px", fontWeight: 600, cursor: "pointer" }}>
                Abbrechen
              </button>
              <button onClick={() => handleReview("REJECTED")} disabled={saving}
                style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 7, padding: "9px 18px", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                Ablehnen
              </button>
              <button onClick={() => handleReview("APPROVED")} disabled={saving}
                style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 7, padding: "9px 18px", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                ✓ Genehmigen
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
