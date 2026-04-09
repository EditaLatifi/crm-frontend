"use client";

import Sidebar from "../components/ui/Sidebar";
import { usePathname } from "next/navigation";
import ProtectedRoute from "../src/routes/ProtectedRoute";
import { useState, useEffect } from "react";
import { FiMenu, FiSearch, FiPlus } from "react-icons/fi";
import GlobalSearch from "../components/ui/GlobalSearch";
import NotificationBell from "../components/ui/NotificationBell";
import { ping } from "../src/api/client";
import "./responsive.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const isShare = pathname?.startsWith("/share/");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    ping();
    const interval = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

  if (isLogin || isShare) {
    return <>{children}</>;
  }
  return (
    <ProtectedRoute>
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}

      {/* Top bar — clean minimal */}
      <div className="topbar" style={{
        position: "fixed", top: 0, right: 0, height: 48,
        background: "#FAF9F6", borderBottom: "1px solid #E8E4DE",
        display: "flex", alignItems: "center",
        padding: "0 20px", zIndex: 20, gap: 12,
      }}>
        {/* Breadcrumb area */}
        <span style={{ fontSize: 13, color: "#999", fontWeight: 400 }}>
          {pathname?.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" / ") || "Dashboard"}
        </span>

        {/* Burger menu — mobile only */}
        <button className="burger-menu" aria-label="Open sidebar" onClick={() => setSidebarOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", alignItems: "center", padding: 4, marginLeft: "auto" }}>
          <FiMenu size={20} color="#333" />
        </button>

        {/* Right side */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "#fff",
              border: "1px solid #E8E4DE", borderRadius: 8, padding: "6px 12px",
              fontSize: 13, color: "#999", cursor: "pointer",
            }}
          >
            <FiSearch size={13} />
            <span>Suchen...</span>
            <kbd className="search-kbd-hint" style={{ marginLeft: 8, background: "#f5f5f0", border: "1px solid #e0ddd6", borderRadius: 4, padding: "1px 5px", fontSize: 10, color: "#999" }}>
              ⌘K
            </kbd>
          </button>
          <NotificationBell />
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

      {/* Main content — cream background */}
      <main className="main-content" style={{
        paddingTop: 66,
        background: "#FAF9F6",
        minHeight: "100vh",
      }}>{children}</main>
    </ProtectedRoute>
  );
}
