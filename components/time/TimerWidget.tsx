"use client";
import { useState } from "react";
import { FiClock } from "react-icons/fi";
import LogTimeQuickModal from "./LogTimeQuickModal";
import { useAuth, isExternRole } from "../../src/auth/AuthProvider";

// Floating time-entry control. The live "Timer starten" stopwatch was removed by request —
// time is now logged manually via the "Zeit erfassen" modal (single, reliable path).
export default function TimerWidget() {
  const { user } = useAuth();
  // External clients can't log time — don't show them an internal time control.
  const isExtern = isExternRole(user?.role);
  const [manualOpen, setManualOpen] = useState(false);

  if (isExtern) return null;

  const fab: React.CSSProperties = {
    background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 28,
    padding: "12px 20px", display: "flex", alignItems: "center", gap: 8,
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
  };

  return (
    <>
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
        <button onClick={() => setManualOpen(true)} style={fab} title="Zeit manuell erfassen">
          <FiClock size={15} /> Zeit erfassen
        </button>
      </div>

      <LogTimeQuickModal open={manualOpen} onClose={() => setManualOpen(false)} />
    </>
  );
}
