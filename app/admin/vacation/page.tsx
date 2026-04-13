"use client";
import { useEffect, useState } from "react";
import './admin-vacation-mobile.css';
import { api } from "../../../src/api/client";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../../../src/auth/AuthProvider";
import { IconType } from "react-icons";
import { FiUmbrella, FiActivity, FiShield, FiDollarSign, FiFileText } from "react-icons/fi";

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

interface StatEntry {
  user: { id: string; name: string; email: string };
  days: number;
  requests: number;
  quota: number | null;
  remaining: number | null;
}

const TYPE_LABELS: Record<string, string> = {
  VACATION: "Urlaub",
  SICK: "Krankenstand",
  MILITARY_SERVICE: "Militärdienst",
  UNPAID: "Unbezahlt",
  OTHER: "Sonstiges",
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:  { bg: "#fef3c7", color: "#d97706", label: "Ausstehend" },
  APPROVED: { bg: "#dcfce7", color: "#16a34a", label: "Genehmigt" },
  REJECTED: { bg: "#fee2e2", color: "#dc2626", label: "Abgelehnt" },
};

const TYPE_ICONS: Record<string, IconType> = {
  VACATION: FiUmbrella,
  SICK: FiActivity,
  MILITARY_SERVICE: FiShield,
  UNPAID: FiDollarSign,
  OTHER: FiFileText,
};

const btnStyle = (color: string, bg: string): React.CSSProperties => ({
  background: bg, color, border: "none", borderRadius: 6,
  padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer",
  whiteSpace: "nowrap",
});

export default function AdminVacationPage() {
  const toast = useToast();
  const { user: authUser } = useAuth();
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [stats, setStats] = useState<StatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [reviewing, setReviewing] = useState<string | null>(null); // id being reviewed
  const [tab, setTab] = useState<"requests" | "stats" | "calendar">("requests");

  // Quota editing state: { [userId]: draftValue }
  const [quotaDraft, setQuotaDraft] = useState<Record<string, string>>({});
  const [quotaSaving, setQuotaSaving] = useState<string | null>(null);

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

  // Initialize quota drafts when stats load
  useEffect(() => {
    const drafts: Record<string, string> = {};
    for (const s of stats) {
      drafts[s.user.id] = s.quota != null ? String(s.quota) : "";
    }
    setQuotaDraft(drafts);
  }, [stats]);

  async function handleReview(id: string, action: "APPROVED" | "REJECTED") {
    setReviewing(id);
    try {
      const updated: any = await api.patch(`/vacation/${id}/review`, { action });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
      toast.success(action === "APPROVED" ? "Antrag genehmigt." : "Antrag abgelehnt.");
      fetchAll();
    } catch {
      toast.error("Fehler beim Aktualisieren.");
    } finally {
      setReviewing(null);
    }
  }

  async function handleSaveQuota(userId: string) {
    const val = parseInt(quotaDraft[userId] ?? "");
    if (isNaN(val) || val < 0) { toast.error("Bitte eine gültige Anzahl Tage eingeben."); return; }
    setQuotaSaving(userId);
    try {
      await api.patch(`/vacation/quotas/${userId}`, { year: parseInt(yearFilter), days: val });
      toast.success("Kontingent gespeichert.");
      fetchAll();
    } catch {
      toast.error("Fehler beim Speichern.");
    } finally {
      setQuotaSaving(null);
    }
  }

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
    <div style={{ padding: "28px 32px 40px", maxWidth: 1200, margin: "0 auto" }}>
      <div className="admin-vacation-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Urlaubsverwaltung</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#E8E4DE", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[
          { key: "requests", label: `Anträge${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
          { key: "stats", label: "Statistik & Kontingent" },
          { key: "calendar", label: "Kalenderübersicht" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            style={{
              padding: "7px 18px", borderRadius: 7, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: tab === t.key ? "#fff" : "transparent",
              color: tab === t.key ? "#1a1a1a" : "#64748b",
              boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E8E4DE", background: "#FAF9F6", fontSize: 13, color: "#1a1a1a", outline: "none", cursor: "pointer" }}>
          <option value="">Alle Status</option>
          <option value="PENDING">Ausstehend</option>
          <option value="APPROVED">Genehmigt</option>
          <option value="REJECTED">Abgelehnt</option>
        </select>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E8E4DE", background: "#FAF9F6", fontSize: 13, color: "#1a1a1a", outline: "none", cursor: "pointer" }}>
          {[2024, 2025, 2026, 2027].map(y => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>

      {/* REQUESTS TAB */}
      {tab === "requests" && (
        <div style={{ background: "#fff", border: "1px solid #E8E4DE", borderRadius: 14, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "#999" }}>Laden…</div>
          ) : requests.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "#999", fontSize: 14 }}>
              Keine Anträge gefunden.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FAF9F6" }}>
                  {["Mitarbeiter", "Typ", "Zeitraum", "Tage", "Status", "Notiz", "Aktion"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #E8E4DE" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(r => {
                  const s = STATUS_STYLE[r.status];
                  const busy = reviewing === r.id;
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid #FAF9F6" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{r.user.name}</div>
                        <div style={{ fontSize: 11, color: "#999" }}>{r.user.email}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#1a1a1a" }}>
                          {(() => { const Icon = TYPE_ICONS[r.type]; return Icon ? <Icon size={14} color="#64748b" /> : null; })()}
                          {TYPE_LABELS[r.type] || r.type}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#1a1a1a" }}>
                        <div>{new Date(r.startDate).toLocaleDateString("de-CH")}</div>
                        <div style={{ color: "#999" }}>bis {new Date(r.endDate).toLocaleDateString("de-CH")}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{r.days}</td>
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
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => handleReview(r.id, "APPROVED")}
                              disabled={busy}
                              style={{ ...btnStyle("#fff", "#16a34a"), opacity: busy ? 0.6 : 1 }}
                            >
                              ✓ Genehmigen
                            </button>
                            <button
                              onClick={() => handleReview(r.id, "REJECTED")}
                              disabled={busy}
                              style={{ ...btnStyle("#dc2626", "#fee2e2"), opacity: busy ? 0.6 : 1 }}
                            >
                              ✕ Ablehnen
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: "#999" }}>
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

      {/* STATS TAB — includes quota management */}
      {tab === "stats" && (
        <div>
          {stats.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #E8E4DE", borderRadius: 14, padding: "32px 20px", textAlign: "center", color: "#999", fontSize: 14 }}>
              Keine Daten für {yearFilter}.
            </div>
          ) : (
            <div style={{ background: "#fff", border: "1px solid #E8E4DE", borderRadius: 14, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#FAF9F6" }}>
                    {["Mitarbeiter", `Kontingent ${yearFilter} (AT)`, "Verbraucht", "Verbleibend", "Anträge"].map(h => (
                      <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #E8E4DE" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...stats].sort((a, b) => a.user.name.localeCompare(b.user.name)).map((s, i) => {
                    const remaining = s.remaining;
                    const overused = remaining != null && remaining < 0;
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #FAF9F6" }}>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{s.user.name}</div>
                          <div style={{ fontSize: 12, color: "#999" }}>{s.user.email}</div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="number"
                              min={0}
                              value={quotaDraft[s.user.id] ?? ""}
                              onChange={e => setQuotaDraft(d => ({ ...d, [s.user.id]: e.target.value }))}
                              placeholder="—"
                              style={{ width: 70, padding: "5px 8px", borderRadius: 6, border: "1px solid #E8E4DE", fontSize: 13, textAlign: "center" }}
                            />
                            <button
                              onClick={() => handleSaveQuota(s.user.id)}
                              disabled={quotaSaving === s.user.id}
                              style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#1a1a1a", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: quotaSaving === s.user.id ? 0.6 : 1 }}
                            >
                              {quotaSaving === s.user.id ? "…" : "Speichern"}
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {s.quota != null && (
                              <div style={{ flex: 1, background: "#E8E4DE", borderRadius: 20, height: 6, overflow: "hidden", maxWidth: 100 }}>
                                <div style={{ height: "100%", background: overused ? "#dc2626" : "#1a1a1a", borderRadius: 20, width: `${Math.min(100, (s.days / s.quota) * 100)}%` }} />
                              </div>
                            )}
                            <span style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>{s.days}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          {remaining != null ? (
                            <span style={{ fontSize: 15, fontWeight: 700, color: overused ? "#dc2626" : "#16a34a" }}>
                              {remaining >= 0 ? remaining : remaining} AT
                            </span>
                          ) : (
                            <span style={{ color: "#999", fontSize: 13 }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: 14, color: "#64748b" }}>{s.requests}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CALENDAR TAB */}
      {tab === "calendar" && (
        <div style={{ background: "#fff", border: "1px solid #E8E4DE", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #E8E4DE" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>Genehmigte Urlaubszeiten – {yearFilter}</span>
          </div>
          {getCalendarData().length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "#999", fontSize: 14 }}>
              Keine genehmigten Urlaubsanträge.
            </div>
          ) : (
            getCalendarData().map((u, i) => (
              <div key={i} style={{ padding: "16px 20px", borderBottom: "1px solid #FAF9F6" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>{u.name}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {u.periods.map(r => (
                    <div key={r.id} style={{
                      background: "#dbeafe", color: "#1d4ed8", borderRadius: 8, padding: "6px 14px",
                      fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
                    }}>
                      {(() => { const Icon = TYPE_ICONS[r.type]; return Icon ? <Icon size={13} /> : null; })()}
                      <span>
                        {new Date(r.startDate).toLocaleDateString("de-CH", { day: "2-digit", month: "short" })}
                        {" – "}
                        {new Date(r.endDate).toLocaleDateString("de-CH", { day: "2-digit", month: "short" })}
                      </span>
                      <span style={{ background: "#bfdbfe", borderRadius: 4, padding: "1px 6px" }}>{r.days}d</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
                  {u.periods.reduce((s, r) => s + r.days, 0)} Arbeitstage total
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
