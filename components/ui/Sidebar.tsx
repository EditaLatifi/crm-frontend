"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from '../../src/auth/AuthProvider';
import {
  FiGrid, FiUsers, FiUser, FiBriefcase, FiCheckSquare,
  FiClock, FiBarChart2, FiLogOut, FiX, FiChevronRight,
  FiActivity, FiSettings, FiCalendar, FiSun, FiLayers,
  FiTruck, FiFileText,
} from "react-icons/fi";

const NAV_GROUPS = [
  {
    label: "Hauptmenü",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: FiGrid },
      { href: "/accounts", label: "Firmen", icon: FiUsers },
      { href: "/contacts", label: "Kontakte", icon: FiUser },
      { href: "/deals", label: "Deals", icon: FiBriefcase },
      { href: "/projects", label: "Projekte", icon: FiLayers },
      { href: "/tasks", label: "Aufgaben", icon: FiCheckSquare },
      { href: "/calendar", label: "Kalender", icon: FiCalendar },
      { href: "/vacation", label: "Urlaub", icon: FiSun },
      { href: "/profile", label: "Profil", icon: FiSettings },
    ],
  },
  {
    label: "Verwaltung",
    admin: true,
    items: [
      { href: "/admin/permits", label: "Baubewilligungen", icon: FiFileText, admin: true },
      { href: "/time", label: "Zeiterfassung", icon: FiClock, admin: true },
      { href: "/admin/vacation", label: "Urlaubsverwaltung", icon: FiSun, admin: true },
      { href: "/activity", label: "Aktivitäten", icon: FiActivity, admin: true },
      { href: "/users", label: "Benutzer", icon: FiUsers, admin: true },
      { href: "/reports", label: "Berichte", icon: FiBarChart2, admin: true },
    ],
  },
];

export default function Sidebar({ className = "", onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";

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
        width: 240,
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 20px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logoip3.png" alt="Logo" style={{ height: 32, display: "block" }} />
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 4, display: "flex" }}
          >
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Nav groups */}
      <nav className="sidebar-nav" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 12px", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent" }}>
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item: any) => !item.admin || isAdmin);
          if (group.admin && !isAdmin) return null;
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "0 8px",
                marginBottom: 6,
              }}>
                {group.label}
              </div>
              {visibleItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{ textDecoration: "none" }}
                    onClick={onClose}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 10px",
                      borderRadius: 8,
                      marginBottom: 2,
                      background: isActive ? "rgba(37,99,235,0.18)" : "transparent",
                      borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <Icon
                        size={16}
                        color={isActive ? "#60a5fa" : "#cbd5e1"}
                        style={{ flexShrink: 0 }}
                      />
                      <span style={{
                        fontSize: 13.5,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "#ffffff" : "#cbd5e1",
                        flex: 1,
                      }}>
                        {item.label}
                      </span>
                      {isActive && <FiChevronRight size={13} color="#3b82f6" />}
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
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "14px 16px",
        paddingBottom: "calc(14px + env(safe-area-inset-bottom))",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}>
          <Link href="/profile" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || user?.email || "Profil"}
              </div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                {user?.role === "ADMIN" ? "Administrator" : "Benutzer"}
              </div>
            </div>
          </Link>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            borderRadius: 7,
            border: "none",
            background: "transparent",
            color: "#cbd5e1",
            fontSize: 13,
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)"; (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#cbd5e1"; }}
        >
          <FiLogOut size={15} />
          Abmelden
        </button>
      </div>
    </div>
  );
}
