"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, isAdminRole, isManagerRole, isInternalRole } from '../../src/auth/AuthProvider';
import { useEffect, useState } from "react";
import { api } from '../../src/api/client';
import {
  FiGrid, FiUsers, FiUser, FiBriefcase, FiCheckSquare,
  FiClock, FiBarChart2, FiLogOut, FiX,
  FiCalendar, FiLayers, FiUmbrella,
  FiDollarSign, FiTrendingUp, FiCopy, FiList,
} from "react-icons/fi";

// minRole: minimum role level to see item
// 'all' = everyone, 'internal' = not EXTERN, 'manager' = ADMIN+PROJEKTLEITER, 'admin' = ADMIN only
type MinRole = 'all' | 'internal' | 'manager' | 'admin';

const NAV_GROUPS: { label: string | null; minRole?: MinRole; items: { href: string; label: string; icon: any; countKey: string | null; minRole?: MinRole; hideForAdmin?: boolean }[] }[] = [
  {
    label: null,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: FiGrid, countKey: null },
      { href: "/accounts", label: "Firmen", icon: FiUsers, countKey: "accounts", minRole: "internal" },
      { href: "/contacts", label: "Kontakte", icon: FiUser, countKey: "contacts", minRole: "internal" },
      { href: "/deals", label: "Deals", icon: FiBriefcase, countKey: "deals", minRole: "manager" },
      { href: "/projects", label: "Projekte", icon: FiLayers, countKey: "projects" },
      { href: "/tasks", label: "Aufgaben", icon: FiCheckSquare, countKey: "tasks" },
    ],
  },
  {
    label: "Auswertungen",
    items: [
      { href: "/time", label: "Zeiterfassung", icon: FiClock, countKey: null },
      { href: "/reports", label: "Berichte", icon: FiBarChart2, countKey: null, minRole: "manager" },
      { href: "/vacation", label: "Urlaub", icon: FiUmbrella, countKey: null, hideForAdmin: true, minRole: "internal" },
      { href: "/calendar", label: "Kalender", icon: FiCalendar, countKey: null },
    ],
  },
  {
    label: "Verwaltung",
    minRole: "admin",
    items: [
      { href: "/users", label: "Benutzer", icon: FiUsers, countKey: null, minRole: "admin" },
      { href: "/admin/milestones", label: "Bauschritte", icon: FiTrendingUp, countKey: null, minRole: "admin" },
      { href: "/admin/templates", label: "Projektvorlagen", icon: FiCopy, countKey: null, minRole: "admin" },
      { href: "/admin/vacation", label: "Urlaubsanträge", icon: FiUmbrella, countKey: null, minRole: "admin" },
      { href: "/activity", label: "Aktivitätsprotokoll", icon: FiList, countKey: null, minRole: "admin" },
    ],
  },
];

export default function Sidebar({ className = "", onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { user, logout } = useAuth();
  const role = user?.role;
  const isAdmin = isAdminRole(role);

  function hasMinRole(minRole?: MinRole): boolean {
    if (!minRole || minRole === 'all') return true;
    if (minRole === 'admin') return isAdminRole(role);
    if (minRole === 'manager') return isManagerRole(role);
    if (minRole === 'internal') return isInternalRole(role);
    return true;
  }
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Check sessionStorage cache first to avoid refetching on every navigation
    const cached = sessionStorage.getItem('sidebar-counts');
    if (cached) {
      try { setCounts(JSON.parse(cached)); } catch {}
    }
    // Fetch counts via efficient /search/counts endpoint (single query, no full entity loads)
    const timer = setTimeout(() => {
      api.get('/search/counts').then((c: any) => {
        if (c && typeof c === 'object') {
          setCounts(c);
          sessionStorage.setItem('sidebar-counts', JSON.stringify(c));
        }
      }).catch(() => {});
    }, 500);
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
          if (group.minRole && !hasMinRole(group.minRole)) return null;
          const visibleItems = group.items.filter((item: any) => hasMinRole(item.minRole) && (!item.hideForAdmin || !isAdmin));
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
                {{ ADMIN: 'Admin / Management', PROJEKTLEITER: 'Projektleiter', MITARBEITER: 'Mitarbeiter', EXTERN: 'Extern', USER: 'Mitarbeiter' }[user?.role || 'USER'] || user?.role}
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
