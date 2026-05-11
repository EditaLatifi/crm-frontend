"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "../../../src/api/client";
import Link from "next/link";

interface Activity {
  id: string;
  actorUserId: string;
  actorUser?: { name: string };
  entityType: string;
  entityId: string;
  action: string;
  payloadJson: any;
  createdAt: string;
}

interface ActivityResponse {
  data: Activity[];
  total: number;
  page: number;
  pageSize: number;
}

const ENTITY_TYPE_OPTIONS = [
  { value: "", label: "Alle" },
  { value: "Account", label: "Account" },
  { value: "Contact", label: "Contact" },
  { value: "Deal", label: "Deal" },
  { value: "Project", label: "Project" },
  { value: "Task", label: "Task" },
];

const ACTION_OPTIONS = [
  { value: "", label: "Alle" },
  { value: "CREATE", label: "CREATE" },
  { value: "UPDATE", label: "UPDATE" },
  { value: "DELETE", label: "DELETE" },
  { value: "change_stage", label: "change_stage" },
  { value: "PHASE_CREATE", label: "PHASE_CREATE" },
  { value: "PHASE_UPDATE", label: "PHASE_UPDATE" },
];

const ACTION_BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  CREATE:       { bg: "#dcfce7", color: "#16a34a" },
  UPDATE:       { bg: "#dbeafe", color: "#2563eb" },
  DELETE:       { bg: "#fee2e2", color: "#dc2626" },
  change_stage: { bg: "#f3f4f6", color: "#6b7280" },
  PHASE_CREATE: { bg: "#f3f4f6", color: "#6b7280" },
  PHASE_UPDATE: { bg: "#f3f4f6", color: "#6b7280" },
};

const ENTITY_ROUTES: Record<string, string> = {
  Account: "/accounts",
  Contact: "/contacts",
  Deal:    "/deals",
  Project: "/projects",
  Task:    "/tasks",
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getDescription(activity: Activity): string {
  const payload = typeof activity.payloadJson === "string"
    ? (() => { try { return JSON.parse(activity.payloadJson); } catch { return null; } })()
    : activity.payloadJson;

  if (payload?.name) return payload.name;
  if (payload?.title) return payload.title;
  if (payload?.subject) return payload.subject;
  return "";
}

const PAGE_SIZE = 25;

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #E8E4DE",
  fontSize: 13,
  background: "#fff",
  color: "#1a1a1a",
  outline: "none",
  minWidth: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#999",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 4,
};

export default function ActivityPage() {
  const [data, setData] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        pageSize: String(PAGE_SIZE),
      });
      if (entityType) params.set("entityType", entityType);
      if (action) params.set("action", action);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res: ActivityResponse = await api.get(`/activity?${params.toString()}`);
      setData(res.data || []);
      setTotal(res.total || 0);
      setPage(res.page || p);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [entityType, action, dateFrom, dateTo]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const resetFilters = () => {
    setEntityType("");
    setAction("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: 0, marginBottom: 4 }}>
          Aktivit&auml;tsprotokoll
        </h1>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
          &Uuml;bersicht aller Aktionen im System
        </p>
      </div>

      {/* Filter bar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "flex-end",
        padding: "16px 20px",
        background: "#FAF9F6",
        borderRadius: 12,
        border: "1px solid #E8E4DE",
        marginBottom: 24,
      }}>
        {/* Entity type */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={labelStyle}>Typ</span>
          <select
            value={entityType}
            onChange={e => setEntityType(e.target.value)}
            style={{ ...inputStyle, minWidth: 130 }}
          >
            {ENTITY_TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Action */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={labelStyle}>Aktion</span>
          <select
            value={action}
            onChange={e => setAction(e.target.value)}
            style={{ ...inputStyle, minWidth: 150 }}
          >
            {ACTION_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={labelStyle}>Von</span>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Date to */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={labelStyle}>Bis</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Reset */}
        <button
          onClick={resetFilters}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #E8E4DE",
            background: "#fff",
            color: "#666",
            fontSize: 13,
            cursor: "pointer",
            fontWeight: 500,
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f5f5f5"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
        >
          Zur&uuml;cksetzen
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div style={{
            width: 32,
            height: 32,
            border: "3px solid #E8E4DE",
            borderTopColor: "#1a1a1a",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Empty state */}
      {!loading && data.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#999",
          fontSize: 14,
        }}>
          Keine Aktivit&auml;ten gefunden.
        </div>
      )}

      {/* Activity list */}
      {!loading && data.length > 0 && (
        <div style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #E8E4DE",
          overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#FAF9F6", borderBottom: "1px solid #E8E4DE" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Zeitpunkt</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Benutzer</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Aktion</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Objekt</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Beschreibung</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a, i) => {
                const badge = ACTION_BADGE_STYLES[a.action] || { bg: "#f3f4f6", color: "#6b7280" };
                const route = ENTITY_ROUTES[a.entityType];
                const desc = getDescription(a);

                return (
                  <tr
                    key={a.id}
                    style={{
                      borderBottom: i < data.length - 1 ? "1px solid #F0ECE6" : "none",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FAFAF8"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <td style={{ padding: "12px 16px", color: "#555", whiteSpace: "nowrap" }}>
                      {formatDateTime(a.createdAt)}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#333", fontWeight: 500 }}>
                      {a.actorUser?.name || "\u2013"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        background: badge.bg,
                        color: badge.color,
                      }}>
                        {a.action}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {route ? (
                        <Link
                          href={`${route}/${a.entityId}`}
                          style={{
                            color: "#2563eb",
                            textDecoration: "none",
                            fontWeight: 500,
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}
                        >
                          {a.entityType}
                        </Link>
                      ) : (
                        <span style={{ color: "#333" }}>{a.entityType}</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#666", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {desc || "\u2013"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
          fontSize: 13,
          color: "#666",
        }}>
          <span>
            Seite {page} von {totalPages} &middot; {total} Eintr&auml;ge
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              disabled={page <= 1}
              onClick={() => fetchData(page - 1)}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: "1px solid #E8E4DE",
                background: page <= 1 ? "#f5f5f5" : "#1a1a1a",
                color: page <= 1 ? "#ccc" : "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: page <= 1 ? "default" : "pointer",
              }}
            >
              Zur&uuml;ck
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => fetchData(page + 1)}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: "1px solid #E8E4DE",
                background: page >= totalPages ? "#f5f5f5" : "#1a1a1a",
                color: page >= totalPages ? "#ccc" : "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: page >= totalPages ? "default" : "pointer",
              }}
            >
              Weiter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
