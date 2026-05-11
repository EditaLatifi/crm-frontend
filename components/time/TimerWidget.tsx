"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { FiPlay, FiSquare, FiTrash2, FiClock } from "react-icons/fi";
import { api } from "../../src/api/client";
import { useToast } from "../ui/Toast";

interface TimerStatus {
  running: boolean;
  startedAt?: string;
  elapsedSeconds?: number;
  accountId?: string;
  taskId?: string;
  description?: string;
  accountName?: string;
  taskTitle?: string;
}

interface Project {
  id: string;
  name: string;
  accountId?: string;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TimerWidget() {
  const toast = useToast();
  const [status, setStatus] = useState<TimerStatus | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res: TimerStatus = await api.get("/time-entries/timer/status");
      setStatus(res);
      if (res.running && res.elapsedSeconds != null) {
        setElapsed(Math.floor(res.elapsedSeconds));
      }
    } catch {
      setStatus({ running: false });
    }
  }, []);

  // poll status on mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // tick every second while running
  useEffect(() => {
    clearTick();
    if (status?.running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return clearTick;
  }, [status?.running, clearTick]);

  const loadProjects = async () => {
    try {
      const res = await api.get("/projects");
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setProjects(list);
    } catch {
      setProjects([]);
    }
  };

  const handleStart = async () => {
    if (!selectedProject) return;
    const proj = projects.find((p) => p.id === selectedProject);
    if (!proj?.accountId) {
      toast.error("Projekt hat kein verknüpftes Konto.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/time-entries/timer/start", {
        accountId: proj.accountId,
        projectId: selectedProject,
        description: description || undefined,
      });
      setShowForm(false);
      setDescription("");
      setSelectedProject("");
      await fetchStatus();
    } catch {
      toast.error("Timer konnte nicht gestartet werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await api.post("/time-entries/timer/stop");
      toast.success("Zeiteintrag gespeichert.");
      clearTick();
      setElapsed(0);
      setStatus({ running: false });
      // Refresh time page if currently viewing it
      if (window.location.pathname.startsWith("/time")) {
        window.location.reload();
      }
    } catch {
      toast.error("Timer konnte nicht gestoppt werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = async () => {
    if (!window.confirm("Timer verwerfen ohne zu speichern?")) return;
    setLoading(true);
    try {
      await api.delete("/time-entries/timer");
      toast.info("Timer verworfen.");
      clearTick();
      setElapsed(0);
      setStatus({ running: false });
    } catch {
      toast.error("Timer konnte nicht verworfen werden.");
    } finally {
      setLoading(false);
    }
  };

  const openForm = () => {
    setShowForm(true);
    loadProjects();
  };

  if (!status) return null;

  const pill: React.CSSProperties = {
    position: "fixed",
    bottom: 24,
    right: 24,
    background: "#1a1a1a",
    color: "#fff",
    borderRadius: 28,
    padding: "10px 18px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontFamily: "inherit",
    fontSize: 14,
    boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
    zIndex: 9999,
  };

  const btn: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    padding: 6,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
  };

  const inputStyle: React.CSSProperties = {
    background: "#2a2a2a",
    border: "1px solid #444",
    borderRadius: 6,
    color: "#fff",
    padding: "6px 10px",
    fontSize: 13,
    width: "100%",
    outline: "none",
  };

  if (status.running) {
    return (
      <div style={pill}>
        <FiClock size={16} style={{ color: "#4ade80" }} />
        <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
          {formatTime(elapsed)}
        </span>
        {status.description && (
          <span style={{ opacity: 0.7, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {status.description}
          </span>
        )}
        <button style={{ ...btn, color: "#f87171" }} onClick={handleStop} disabled={loading} title="Stop & speichern">
          <FiSquare size={16} />
        </button>
        <button style={{ ...btn, color: "#888" }} onClick={handleDiscard} disabled={loading} title="Verwerfen">
          <FiTrash2 size={15} />
        </button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div style={{ ...pill, flexDirection: "column", alignItems: "stretch", gap: 8, borderRadius: 16, padding: 16, width: 260 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>Neuer Timer</span>
          <button style={btn} onClick={() => setShowForm(false)}>✕</button>
        </div>
        <select
          style={{ ...inputStyle, cursor: "pointer" }}
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">Projekt wählen…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          style={inputStyle}
          placeholder="Beschreibung (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          disabled={!selectedProject || loading}
          onClick={handleStart}
          style={{
            background: selectedProject ? "#4ade80" : "#333",
            color: selectedProject ? "#000" : "#666",
            border: "none",
            borderRadius: 8,
            padding: "8px 0",
            fontWeight: 600,
            fontSize: 13,
            cursor: selectedProject ? "pointer" : "default",
          }}
        >
          {loading ? "…" : "Timer starten"}
        </button>
      </div>
    );
  }

  return (
    <div style={pill}>
      <button style={{ ...btn, gap: 6 }} onClick={openForm}>
        <FiPlay size={15} style={{ color: "#4ade80" }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Timer starten</span>
      </button>
    </div>
  );
}
