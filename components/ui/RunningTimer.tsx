"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../src/auth/AuthProvider";
import { api } from "../../src/api/client";
import { FiClock, FiSquare, FiPlay, FiX } from "react-icons/fi";

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function RunningTimer() {
  const { user } = useAuth();
  const [status, setStatus] = useState<{
    running: boolean;
    elapsedSeconds?: number;
    accountName?: string;
    taskTitle?: string | null;
  }>({ running: false });
  const [elapsed, setElapsed] = useState(0);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [showStartForm, setShowStartForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [description, setDescription] = useState("");
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.get('/time-entries/timer/status');
      setStatus(data);
      if (data.running) setElapsed(data.elapsedSeconds || 0);
    } catch (err: any) {
      // Not logged in yet or network error — silently ignore
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus, user]);

  // Tick locally every second when running
  useEffect(() => {
    if (!status.running) return;
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(tick);
  }, [status.running]);

  // Close form when clicking outside
  useEffect(() => {
    if (!showStartForm) return;
    function handleClick(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setShowStartForm(false);
        setError(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showStartForm]);

  // Fetch accounts when form opens
  useEffect(() => {
    if (!showStartForm) return;
    api.get('/accounts')
      .then((data: any) => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => setAccounts([]));
  }, [showStartForm]);

  async function handleStart() {
    if (!selectedAccount) { setError("Bitte ein Konto auswählen."); return; }
    setStarting(true);
    setError(null);
    try {
      await api.post('/time-entries/timer/start', { accountId: selectedAccount, description });
      setShowStartForm(false);
      setSelectedAccount("");
      setDescription("");
      await fetchStatus();
    } catch (err: any) {
      setError(err?.message || "Timer konnte nicht gestartet werden.");
    } finally {
      setStarting(false);
    }
  }

  async function handleStop() {
    setStopping(true);
    try {
      await api.post('/time-entries/timer/stop');
      setStatus({ running: false });
      setElapsed(0);
    } catch (err: any) {
      // Timer already stopped or error — reset anyway
      setStatus({ running: false });
      setElapsed(0);
    } finally {
      setStopping(false);
    }
  }

  async function handleDiscard() {
    if (!confirm('Timer verwerfen? Die Zeit wird nicht gespeichert.')) return;
    setDiscarding(true);
    try {
      await api.delete('/time-entries/timer');
    } catch {}
    setStatus({ running: false });
    setElapsed(0);
    setDiscarding(false);
  }

  if (!user) return null;

  if (status.running) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10, background: "#eff6ff",
        border: "1.5px solid #bfdbfe", borderRadius: 10, padding: "6px 14px",
        fontSize: 13, fontWeight: 600, color: "#1d4ed8",
        boxShadow: "0 1px 4px rgba(37,99,235,0.10)",
      }}>
        <FiClock size={15} style={{ color: "#2563eb", animation: "timerPulse 1.5s infinite" }} />
        <span style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.05em" }}>
          {formatElapsed(elapsed)}
        </span>
        {status.accountName && (
          <span style={{ color: "#64748b", fontWeight: 400, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {status.accountName}
          </span>
        )}
        <button
          onClick={handleStop}
          disabled={stopping || discarding}
          style={{
            background: "#ef4444", color: "#fff", border: "none", borderRadius: 6,
            padding: "3px 10px", cursor: (stopping || discarding) ? "not-allowed" : "pointer",
            fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 4,
            opacity: (stopping || discarding) ? 0.6 : 1,
          }}
        >
          <FiSquare size={11} />
          {stopping ? "..." : "Stopp"}
        </button>
        {elapsed > 8 * 3600 && (
          <button
            onClick={handleDiscard}
            disabled={discarding || stopping}
            title="Timer verwerfen (Zeit nicht speichern)"
            style={{
              background: "transparent", color: "#94a3b8", border: "1px solid #e2e8f0",
              borderRadius: 6, padding: "3px 8px", cursor: "pointer",
              fontSize: 11, display: "flex", alignItems: "center", gap: 3,
              opacity: (discarding || stopping) ? 0.5 : 1,
            }}
          >
            <FiX size={11} />
            {discarding ? "..." : "Verwerfen"}
          </button>
        )}
        <style>{`@keyframes timerPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }} ref={formRef}>
      <button
        onClick={() => { setShowStartForm((v) => !v); setError(null); }}
        style={{
          display: "flex", alignItems: "center", gap: 6, background: "transparent",
          border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "6px 14px",
          fontSize: 13, fontWeight: 500, color: "#6b7280", cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#2563eb"; (e.currentTarget as HTMLElement).style.color = "#2563eb"; }}
        onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}
      >
        <FiPlay size={13} />
        Timer starten
      </button>

      {showStartForm && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff",
          border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, minWidth: 290,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 200,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Timer starten</span>
            <button onClick={() => setShowStartForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 2, display: "flex" }}>
              <FiX size={15} />
            </button>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "7px 10px", fontSize: 12, color: "#dc2626", marginBottom: 10 }}>
              {error}
            </div>
          )}

          <select
            value={selectedAccount}
            onChange={(e) => { setSelectedAccount(e.target.value); setError(null); }}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1.5px solid #e5e7eb", fontSize: 13, marginBottom: 8, background: "#f8fafc", boxSizing: "border-box" }}
          >
            <option value="">Konto auswählen *</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          {accounts.length === 0 && (
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: -4, marginBottom: 8 }}>
              Keine Konten gefunden – prüfe deine Verbindung.
            </div>
          )}

          <input
            placeholder="Beschreibung (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleStart(); }}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1.5px solid #e5e7eb", fontSize: 13, marginBottom: 10, background: "#f8fafc", boxSizing: "border-box" }}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleStart}
              disabled={starting || !selectedAccount}
              style={{
                flex: 1, background: "#2563eb", color: "#fff", border: "none", borderRadius: 7,
                padding: "8px 0", fontWeight: 600, fontSize: 13,
                cursor: (starting || !selectedAccount) ? "not-allowed" : "pointer",
                opacity: (starting || !selectedAccount) ? 0.5 : 1,
              }}
            >
              {starting ? "Startet..." : "Starten"}
            </button>
            <button
              onClick={() => { setShowStartForm(false); setError(null); }}
              style={{ flex: 1, background: "#f1f5f9", color: "#64748b", border: "none", borderRadius: 7, padding: "8px 0", fontWeight: 500, fontSize: 13, cursor: "pointer" }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
