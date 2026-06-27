"use client";
import { useState, useEffect, useRef } from "react";
import { FiClock, FiPlay, FiSquare } from "react-icons/fi";
import LogTimeQuickModal from "./LogTimeQuickModal";
import { api } from "../../src/api/client";
import { useToast } from "../ui/Toast";
import { useAuth, isExternRole } from "../../src/auth/AuthProvider";

type Project = { id: string; name: string };
type Phase = { id: string; name: string; order: number; status?: string };

function fmt(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function TimerWidget() {
  const { user } = useAuth();
  const toast = useToast();
  // External clients can't log time — don't show them an internal time clock.
  const isExtern = isExternRole(user?.role);

  const [manualOpen, setManualOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [needReason, setNeedReason] = useState(false);
  const [reason, setReason] = useState("");

  // Start-picker state
  const [projects, setProjects] = useState<Project[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [projectId, setProjectId] = useState("");
  const [projectPhaseId, setProjectPhaseId] = useState("");

  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  // On mount: pick up any timer already running on the server (e.g. started on another device).
  useEffect(() => {
    if (isExtern) return;
    api.get("/time-entries/timer/status").then((s: any) => {
      if (s?.running) {
        setRunning(true);
        setElapsed(s.elapsedSeconds || 0);
        setLabel(s.taskTitle || s.accountName || "Läuft");
      }
    }).catch(() => {});
  }, [isExtern]);

  // Tick once per second while a timer is running.
  useEffect(() => {
    if (!running) { if (tick.current) clearInterval(tick.current); return; }
    tick.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { if (tick.current) clearInterval(tick.current); };
  }, [running]);

  // Load projects when the start picker opens.
  useEffect(() => {
    if (!pickerOpen) return;
    api.get("/projects").then((res: any) => {
      const d = res?.data ?? (Array.isArray(res) ? res : []);
      setProjects(d.map((p: any) => ({ id: p.id, name: p.name })));
    }).catch(() => {});
  }, [pickerOpen]);

  // Load phases for the chosen project and default to the active (IN_PROGRESS) one.
  useEffect(() => {
    if (!projectId) { setPhases([]); setProjectPhaseId(""); return; }
    api.get(`/projects/${projectId}`).then((d: any) => {
      const list: Phase[] = Array.isArray(d?.phases) ? d.phases : [];
      setPhases(list);
      const active = list.find(p => p.status === "IN_PROGRESS") || list[0];
      setProjectPhaseId(active ? active.id : "");
    }).catch(() => setPhases([]));
  }, [projectId]);

  if (isExtern) return null;

  const startTimer = async () => {
    if (!projectId) { toast.error("Bitte ein Projekt wählen."); return; }
    setBusy(true);
    try {
      // Backend derives the account from the project; phase is optional but pre-selected.
      await api.post("/time-entries/timer/start", { projectId, projectPhaseId: projectPhaseId || undefined });
      setLabel(projects.find(p => p.id === projectId)?.name || "Läuft");
      setElapsed(0);
      setRunning(true);
      setPickerOpen(false);
      setProjectId(""); setProjectPhaseId("");
      toast.success("Timer gestartet.");
    } catch (err: any) {
      toast.error(err?.message || "Timer konnte nicht gestartet werden.");
    } finally { setBusy(false); }
  };

  const stopTimer = async (overBudgetReason?: string) => {
    setBusy(true);
    try {
      const res: any = await api.post("/time-entries/timer/stop", overBudgetReason ? { overBudgetReason } : {});
      setRunning(false); setElapsed(0); setNeedReason(false); setReason("");
      if (res?.kontingentWarning) toast.warning(res.kontingentWarning);
      else toast.success("Zeit erfasst.");
    } catch (err: any) {
      const msg = err?.message || "";
      // Over-budget phases require a Begründung before the entry can be booked. Reveal the reason field
      // instead of leaving the user stuck on a Stoppen button that keeps failing.
      if (/begründung|budget/i.test(msg)) {
        setNeedReason(true);
        toast.warning("Budget überschritten — bitte kurz begründen, dann stoppen.");
      } else {
        toast.error(msg || "Timer konnte nicht gestoppt werden.");
      }
      // Re-sync with the server in case the timer state drifted.
      api.get("/time-entries/timer/status").then((s: any) => { if (!s?.running) { setRunning(false); setElapsed(0); setNeedReason(false); } }).catch(() => {});
    } finally { setBusy(false); }
  };

  const discardTimer = async () => {
    setBusy(true);
    try {
      await api.delete("/time-entries/timer");
      setRunning(false); setElapsed(0); setNeedReason(false); setReason("");
      toast.success("Timer verworfen.");
    } catch (err: any) {
      toast.error(err?.message || "Timer konnte nicht verworfen werden.");
    } finally { setBusy(false); }
  };

  const fab: React.CSSProperties = {
    background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 28,
    padding: "12px 20px", display: "flex", alignItems: "center", gap: 8,
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
  };

  return (
    <>
      {/* Bottom-right floating control */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
        {running ? (
          // Live running timer — shows ticking elapsed time + Stop (and an over-budget reason fallback).
          <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#1a1a1a", color: "#fff", borderRadius: 16, padding: "12px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.35)", maxWidth: 290 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444", animation: "tw-pulse 1.4s infinite", flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmt(elapsed)}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
              </div>
              {!needReason && (
                <button onClick={() => stopTimer()} disabled={busy} title="Timer stoppen & Zeit buchen"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ef4444", color: "#fff", border: "none", borderRadius: 20, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
                  <FiSquare size={13} /> Stoppen
                </button>
              )}
            </div>
            {needReason && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11, color: "#fca5a5" }}>Budget überschritten — Begründung erforderlich:</div>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder="z.B. Planänderung durch Kunden"
                  style={{ width: "100%", borderRadius: 8, border: "1px solid #475569", background: "#0f172a", color: "#fff", fontSize: 12, padding: "6px 8px", resize: "vertical", boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => stopTimer(reason.trim())} disabled={busy || !reason.trim()}
                    style={{ flex: 1, background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: (busy || !reason.trim()) ? 0.6 : 1 }}>
                    Mit Begründung stoppen
                  </button>
                  <button onClick={discardTimer} disabled={busy} title="Timer verwerfen (keine Zeit buchen)"
                    style={{ background: "transparent", color: "#cbd5e1", border: "1px solid #475569", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Verwerfen
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <button onClick={() => setPickerOpen(true)} style={{ ...fab, background: "#fff", color: "#1a1a1a", border: "1px solid #E8E4DE", padding: "10px 18px", fontSize: 12 }} title="Live-Timer starten">
              <FiPlay size={14} /> Timer starten
            </button>
            <button onClick={() => setManualOpen(true)} style={fab} title="Zeit manuell erfassen">
              <FiClock size={15} /> Zeit erfassen
            </button>
          </>
        )}
      </div>

      {/* Start picker */}
      {pickerOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 420, padding: 24, boxShadow: "0 20px 50px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <FiPlay size={17} color="#1a1a1a" />
              <span style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>Timer starten</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Projekt *</label>
              <select value={projectId} onChange={e => setProjectId(e.target.value)} style={selStyle}>
                <option value="">— Projekt wählen —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Phase</label>
              <select value={projectPhaseId} onChange={e => setProjectPhaseId(e.target.value)} style={selStyle} disabled={!projectId}>
                <option value="">Allgemein (keine bestimmte Phase)</option>
                {phases.slice().sort((a, b) => a.order - b.order).map(p => (
                  <option key={p.id} value={p.id}>{String(p.order).padStart(2, "0")} - {p.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => { setPickerOpen(false); setProjectId(""); setProjectPhaseId(""); }}
                style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #E8E4DE", background: "#fff", color: "#666", fontSize: 13, cursor: "pointer" }}>
                Abbrechen
              </button>
              <button onClick={startTimer} disabled={busy || !projectId}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "none", background: "#1a1a1a", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: (busy || !projectId) ? 0.6 : 1 }}>
                <FiPlay size={13} /> Starten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual entry (unchanged) */}
      <LogTimeQuickModal open={manualOpen} onClose={() => setManualOpen(false)} />

      <style>{`@keyframes tw-pulse{0%{box-shadow:0 0 0 0 rgba(239,68,68,0.6)}70%{box-shadow:0 0 0 7px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}`}</style>
    </>
  );
}

const selStyle: React.CSSProperties = {
  width: "100%", padding: "9px 11px", borderRadius: 8, border: "1.5px solid #e5e7eb",
  fontSize: 13, background: "#fff", color: "#1e293b",
};
