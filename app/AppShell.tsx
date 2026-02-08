"use client";

import Sidebar from "../components/ui/Sidebar";
import { usePathname } from "next/navigation";
import ProtectedRoute from "../src/routes/ProtectedRoute";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import "./responsive.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  if (isLogin) {
    return <>{children}</>;
  }
  return (
    <ProtectedRoute>
      {/* Burger menu for mobile/tablet */}
      <button className="burger-menu" aria-label="Open sidebar" onClick={() => setSidebarOpen(true)}>
        <FiMenu size={28} color="#1e293b" />
      </button>
      {/* Sidebar for desktop */}
      <div className="sidebar-desktop">
        <Sidebar />
      </div>
      {/* Sidebar for mobile/tablet */}
      <div className={`sidebar-mobile${sidebarOpen ? " open" : ""}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <main className="main-content">{children}</main>
    </ProtectedRoute>
  );
}
