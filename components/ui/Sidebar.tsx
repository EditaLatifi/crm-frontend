"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from '../../src/auth/AuthProvider';
import { useEffect, useState } from "react";
import { api } from '../../src/api/client';
import {
  FiGrid, FiUsers, FiUser, FiBriefcase, FiCheckSquare,
  FiClock, FiBarChart2, FiLogOut, FiX,
  FiCalendar, FiLayers, FiUmbrella,
} from "react-icons/fi";

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: FiGrid, countKey: null },
      { href: "/accounts", label: "Firmen", icon: FiUsers, countKey: "accounts" },
      { href: "/contacts", label: "Kontakte", icon: FiUser, countKey: "contacts" },
      { href: "/deals", label: "Deals", icon: FiBriefcase, countKey: "deals" },
      { href: "/projects", label: "Projekte", icon: FiLayers, countKey: "projects" },
      { href: "/tasks", label: "Aufgaben", icon: FiCheckSquare, countKey: "tasks" },
    ],
  },
  {
    label: "Auswertungen",
    items: [
      { href: "/time", label: "Zeiterfassung", icon: FiClock, countKey: null },
      { href: "/vacation", label: "Urlaub", icon: FiUmbrella, countKey: null },
      { href: "/reports", label: "Berichte", icon: FiBarChart2, countKey: null },
      { href: "/calendar", label: "Kalender", icon: FiCalendar, countKey: null },
    ],
  },
  {
    label: "Verwaltung",
    admin: true,
    items: [
      { href: "/users", label: "Benutzer", icon: FiUsers, countKey: null, admin: true },
      { href: "/admin/vacation", label: "Urlaubsanträge", icon: FiUmbrella, countKey: null, admin: true },
    ],
  },
];

export default function Sidebar({ className = "", onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Check sessionStorage cache first to avoid refetching on every navigation
    const cached = sessionStorage.getItem('sidebar-counts');
    if (cached) {
      try { setCounts(JSON.parse(cached)); } catch {}
    }
    // Fetch fresh counts in background
    const timer = setTimeout(() => {
      Promise.all([
        api.get('/accounts').then((d: any) => ({ key: 'accounts', count: Array.isArray(d) ? d.length : 0 })).catch(() => ({ key: 'accounts', count: 0 })),
        api.get('/contacts').then((d: any) => ({ key: 'contacts', count: Array.isArray(d) ? d.length : 0 })).catch(() => ({ key: 'contacts', count: 0 })),
        api.get('/deals').then((d: any) => ({ key: 'deals', count: Array.isArray(d) ? d.length : 0 })).catch(() => ({ key: 'deals', count: 0 })),
        api.get('/projects').then((d: any) => ({ key: 'projects', count: Array.isArray(d) ? d.length : 0 })).catch(() => ({ key: 'projects', count: 0 })),
        api.get('/tasks').then((d: any) => ({ key: 'tasks', count: Array.isArray(d) ? d.length : 0 })).catch(() => ({ key: 'tasks', count: 0 })),
      ]).then(results => {
        const c: Record<string, number> = {};
        results.forEach(r => { c[r.key] = r.count; });
        setCounts(c);
        sessionStorage.setItem('sidebar-counts', JSON.stringify(c));
      });
    }, 500); // Delay sidebar counts so dashboard API calls get priority
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
    if (onClose) onClose();
  };

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div
      className={className}
      style={{
        width: 220,
        background: "#FAF9F6",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
        fontFamily: "'Inter', system-ui, sans-serif",
        borderRight: "1px solid #E8E4DE",
      }}
    >
      {/* Logo */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px 20px 18px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 9, color: "#fff", letterSpacing: "0.5px" }}>IP3</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", letterSpacing: "0.3px" }}>IP3 CRM</span>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", padding: 4, display: "flex" }}>
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Nav groups */}
      <nav style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "4px 10px" }}>
        {NAV_GROUPS.map((group, gi) => {
          const visibleItems = group.items.filter((item: any) => !item.admin || isAdmin);
          if (group.admin && !isAdmin) return null;
          if (visibleItems.length === 0) return null;

          return (
            <div key={gi} style={{ marginBottom: 8 }}>
              {group.label && (
                <div style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  padding: "18px 10px 6px",
                }}>
                  {group.label}
                </div>
              )}
              {visibleItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                const count = item.countKey ? counts[item.countKey] : null;
                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: "none" }} onClick={onClose}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      marginBottom: 2,
                      background: isActive ? "#1a1a1a" : "transparent",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#F0ECE6"; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <Icon size={16} color={isActive ? "#fff" : "#555"} style={{ flexShrink: 0 }} />
                      <span style={{
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "#fff" : "#333",
                        flex: 1,
                      }}>
                        {item.label}
                      </span>
                      {count != null && count > 0 && (
                        <span style={{
                          fontSize: 12, fontWeight: 500, color: isActive ? "rgba(255,255,255,0.7)" : "#999",
                          minWidth: 20, textAlign: "right",
                        }}>
                          {count}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User section */}
      <div style={{
        borderTop: "1px solid #E8E4DE",
        padding: "16px 14px",
        paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Link href="/profile" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "#e8a838",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || user?.email || "Profil"}
              </div>
              <div style={{ fontSize: 11, color: "#999" }}>
                {user?.role === "ADMIN" ? "Admin / Management" : "Mitarbeiter"}
              </div>
            </div>
          </Link>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            padding: "7px 10px", borderRadius: 7, border: "none",
            background: "transparent", color: "#999", fontSize: 12,
            cursor: "pointer", transition: "color 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#999"; }}
        >
          <FiLogOut size={14} />
          Abmelden
        </button>
      </div>
    </div>
  );
}
