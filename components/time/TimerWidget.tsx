"use client";
import { useState } from "react";
import { FiClock } from "react-icons/fi";
import LogTimeQuickModal from "./LogTimeQuickModal";

export default function TimerWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "#1a1a1a",
          color: "#fff",
          border: "none",
          borderRadius: 28,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
          zIndex: 9999,
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.45)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.35)"; }}
      >
        <FiClock size={15} />
        Zeit buchen
      </button>
      <LogTimeQuickModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
