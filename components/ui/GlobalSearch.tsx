"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../src/auth/AuthProvider";
import { api } from "../../src/api/client";
import { FiSearch, FiBriefcase, FiUsers, FiUser, FiCheckSquare } from "react-icons/fi";

interface SearchResults {
  accounts: { id: string; name: string; type: string }[];
  contacts: { id: string; name: string; email: string }[];
  deals: { id: string; name: string; amount: number; currency: string; stage?: { name: string } }[];
  tasks: { id: string; title: string; status: string; priority: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#64748b",
  IN_PROGRESS: "#2563eb",
  DONE: "#16a34a",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#94a3b8",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
};

export default function GlobalSearch({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ accounts: [], contacts: [], deals: [], tasks: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults({ accounts: [], contacts: [], deals: [], tasks: [] }); return; }
    setLoading(true);
    try {
      const data = await api.get(`/search?q=${encodeURIComponent(q)}`);
      setResults(data);
    } catch {
      setResults({ accounts: [], contacts: [], deals: [], tasks: [] });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 280);
    return () => clearTimeout(t);
  }, [query, search]);

  function navigate(path: string) {
    router.push(path);
    onClose();
  }

  const totalResults = results.accounts.length + results.contacts.length + results.deals.length + results.tasks.length;
  const hasQuery = query.trim().length >= 2;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 600, boxShadow: "0 24px 64px rgba(0,0,0,0.22)", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <FiSearch size={20} color="#94a3b8" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche nach Konten, Kontakten, Deals, Aufgaben..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 16, color: "#1e293b", background: "transparent" }}
            onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
          />
          {loading && <div style={{ width: 16, height: 16, border: "2px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
          <kbd style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 5, padding: "2px 7px", fontSize: 11, color: "#64748b" }}>Esc</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 460, overflowY: "auto" }}>
          {!hasQuery && (
            <div style={{ padding: "24px 20px", color: "#94a3b8", fontSize: 14, textAlign: "center" }}>
              Mindestens 2 Zeichen eingeben…
            </div>
          )}

          {hasQuery && totalResults === 0 && !loading && (
            <div style={{ padding: "24px 20px", color: "#94a3b8", fontSize: 14, textAlign: "center" }}>
              Keine Ergebnisse für „{query}"
            </div>
          )}

          {results.accounts.length > 0 && (
            <ResultSection title="Konten" icon={<FiBriefcase size={14} />} color="#2563eb">
              {results.accounts.map((a) => (
                <ResultRow key={a.id} onClick={() => navigate(`/accounts/${a.id}`)}>
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>{a.name}</span>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>{a.type}</span>
                </ResultRow>
              ))}
            </ResultSection>
          )}

          {results.contacts.length > 0 && (
            <ResultSection title="Kontakte" icon={<FiUser size={14} />} color="#7c3aed">
              {results.contacts.map((c) => (
                <ResultRow key={c.id} onClick={() => navigate(`/contacts/${c.id}`)}>
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>{c.name}</span>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>{c.email}</span>
                </ResultRow>
              ))}
            </ResultSection>
          )}

          {results.deals.length > 0 && (
            <ResultSection title="Deals" icon={<FiUsers size={14} />} color="#0891b2">
              {results.deals.map((d) => (
                <ResultRow key={d.id} onClick={() => navigate(`/deals/${d.id}`)}>
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>{d.name}</span>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>
                    {d.stage?.name} · {d.amount.toLocaleString()} {d.currency}
                  </span>
                </ResultRow>
              ))}
            </ResultSection>
          )}

          {results.tasks.length > 0 && (
            <ResultSection title="Aufgaben" icon={<FiCheckSquare size={14} />} color="#16a34a">
              {results.tasks.map((t) => (
                <ResultRow key={t.id} onClick={() => navigate(`/tasks/${t.id}`)}>
                  <span style={{ fontWeight: 600, color: "#1e293b" }}>{t.title}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLORS[t.status] || "#64748b", background: "#f8fafc", borderRadius: 4, padding: "1px 6px" }}>{t.status}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: PRIORITY_COLORS[t.priority] || "#64748b", background: "#f8fafc", borderRadius: 4, padding: "1px 6px" }}>{t.priority}</span>
                  </div>
                </ResultRow>
              ))}
            </ResultSection>
          )}
        </div>

        <div style={{ padding: "10px 20px", borderTop: "1px solid #f1f5f9", color: "#94a3b8", fontSize: 11, display: "flex", justifyContent: "space-between" }}>
          <span>↵ Auswählen</span>
          <span>Esc Schließen</span>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ResultSection({ title, icon, color, children }: { title: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px 4px", fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

function ResultRow({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 20px", cursor: "pointer",
        background: hovered ? "#f8fafc" : "transparent",
        transition: "background 0.1s",
      }}
    >
      {children}
    </div>
  );
}
