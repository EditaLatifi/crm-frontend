"use client";

import Sidebar from "../components/ui/Sidebar";
import { usePathname } from "next/navigation";
import ProtectedRoute from "../src/routes/ProtectedRoute";
import { useState, useEffect } from "react";
import { FiMenu, FiSearch } from "react-icons/fi";
import RunningTimer from "../components/ui/RunningTimer";
import GlobalSearch from "../components/ui/GlobalSearch";
import NotificationBell from "../components/ui/NotificationBell";
import { ping } from "../src/api/client";
import "./responsive.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Keep server alive — ping every 4 minutes so it never sleeps
  useEffect(() => {
    ping(); // immediate ping on mount
    const interval = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Cmd+K / Ctrl+K to open search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (isLogin) {
    return <>{children}</>;
  }
  return (
    <ProtectedRoute>
      {/* Global search modal */}
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}

      {/* Top bar (mobile + desktop) */}
      <div className="topbar" style={{
        position: "fixed", top: 0, right: 0, height: 52,
        background: "#fff", borderBottom: "1px solid #e5e7eb",
        display: "flex", alignItems: "center",
        padding: "0 16px", zIndex: 20, gap: 12,
      }}>
        {/* Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8, background: "#f8fafc",
            border: "1.5px solid #e5e7eb", borderRadius: 9, padding: "6px 14px",
            fontSize: 13, color: "#94a3b8", cursor: "pointer", flex: 1, maxWidth: 360,
            transition: "border-color 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
        >
          <FiSearch size={14} />
          <span>Suchen…</span>
          <kbd className="search-kbd-hint" style={{ marginLeft: "auto", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 5, padding: "1px 6px", fontSize: 11, color: "#64748b" }}>
            ⌘K
          </kbd>
        </button>

        {/* Burger menu — mobile/tablet only, after search */}
        <button className="burger-menu" aria-label="Open sidebar" onClick={() => setSidebarOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", alignItems: "center", padding: 4 }}>
          <FiMenu size={22} color="#1e293b" />
        </button>

        {/* Right side: notifications + timer */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <NotificationBell />
          <RunningTimer />
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="sidebar-desktop">
        <Sidebar />
      </div>
      {/* Sidebar for mobile/tablet */}
      <div className={`sidebar-mobile${sidebarOpen ? " open" : ""}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* Main content — pushed below topbar */}
      <main className="main-content" style={{ paddingTop: 52 }}>{children}</main>
    </ProtectedRoute>
  );
}
