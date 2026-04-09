"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiActivity, FiEdit2, FiTrash2 } from "react-icons/fi";

import { api } from "../../src/api/client";
import { useAuth } from "../../src/auth/AuthProvider";
import { useToast } from "../ui/Toast";
import Modal from "../ui/Modal";
import AccountEditForm from "../forms/AccountEditForm";
import ActivityLog from "../activity/ActivityLog";

export interface Account {
  id: string;
  name: string;
  type: string;
  ownerUserId?: string;
  createdAt: string;
  updatedAt?: string;
  email?: string;
  notes?: string;
  address?: string;
  phone?: string;
  tags?: string[];
  status?: string;
}

/* ---------------------------------------------
   Helpers
--------------------------------------------- */

function safeToLower(v: unknown) {
  return (typeof v === "string" ? v : "").toLowerCase();
}

function buildCsv(rows: Record<string, any>[]) {
  if (!rows.length) return "";

  const headers = Array.from(
    new Set(rows.flatMap((r) => Object.keys(r)))
  ) as string[];

  const escape = (value: any) => {
    const s = value === null || value === undefined ? "" : String(value);
    // Quote if it contains comma/newline/quote
    if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];

  return lines.join("\r\n");
}

// Simple CSV parser (good enough for basic exports/imports produced by this app)
function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

/* ---------------------------------------------
   Inline card
--------------------------------------------- */

type InlineCardProps = {
  acc: Account;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onInlinePatch: (patch: Partial<Account>) => void;
  getTags: (a: Account) => string[];
  onOpenEditModal: (account: Account) => void;
  onDelete: (id: string) => void;
  onShowActivity: (id: string) => void;
  ownerName?: string;
  isAdmin?: boolean;
};

function InlineEditableAccountCard({
  acc,
  selected,
  onSelect,
  onInlinePatch,
  getTags,
  onOpenEditModal,
  onDelete,
  onShowActivity,
  ownerName,
  isAdmin,
}: InlineCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(acc.name);
  const [notes, setNotes] = useState(acc.notes || "");
  const router = useRouter();

  // Keep local fields in sync when account changes (e.g., after refresh)
  useEffect(() => {
    setName(acc.name);
    setNotes(acc.notes || "");
  }, [acc.id, acc.name, acc.notes]);

  const handleCardClick = (e: React.MouseEvent) => {
    if (editing) return;
    if ((e.target as HTMLElement).closest("button")) return;
    router.push(`/accounts/${acc.id}`);
  };

  return (
    <div
      style={{
        position: "relative",
        marginBottom: 12,
        background: selected ? "#f6f7f9" : "#fff",
        border: selected ? "2px solid #2563eb" : "1px solid #d1d5db",
        boxShadow: selected
          ? "0 4px 16px rgba(30,41,59,0.10)"
          : "0 1px 4px rgba(30,41,59,0.06)",
        transition: "box-shadow 0.18s, border 0.18s, background 0.18s",
        borderRadius: 10,
        cursor: editing ? "default" : "pointer",
        minHeight: 72,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        if (!selected)
          e.currentTarget.style.boxShadow =
            "0 12px 40px rgba(30,41,59,0.18)";
      }}
      onMouseLeave={(e) => {
        if (!selected)
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(30,41,59,0.08)";
      }}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onSelect(e.target.checked)}
        style={{
          position: "absolute",
          left: 10,
          top: 10,
          zIndex: 2,
          width: 18,
          height: 18,
        }}
        title="Account auswählen"
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 6,
          padding: "8px 12px 0 12px",
          background: "transparent",
          zIndex: 2,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onOpenEditModal(acc);
          }}
          style={{
            background: "#f6f7f9",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            padding: 4,
            cursor: "pointer",
            fontSize: 17,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#2563eb",
          }}
          title="Bearbeiten"
        >
          <FiEdit2 />
        </button>

        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (
                window.confirm(
                  "Sind Sie sicher, dass Sie diesen Account löschen möchten?"
                )
              ) {
                onDelete(acc.id);
              }
            }}
            style={{
              background: "#f6f7f9",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: 4,
              cursor: "pointer",
              fontSize: 17,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d32f2f",
            }}
            title="Löschen"
          >
            <FiTrash2 />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onShowActivity(acc.id);
          }}
          style={{
            background: "#f6f7f9",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            padding: 4,
            cursor: "pointer",
            fontSize: 17,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#2563eb",
          }}
          title="Aktivitätslog zeigen"
        >
          <FiActivity />
        </button>
      </div>

      <div
        style={{
          background: "transparent",
          borderRadius: 8,
          padding: "12px 16px",
          fontWeight: 600,
          fontSize: 15,
          color: "#23272f",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginLeft: 24,
          minHeight: 56,
          userSelect: editing ? "text" : "none",
        }}
        onDoubleClick={() => setEditing(true)}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#e9effd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 15,
            color: "#2563eb",
            marginRight: 8,
            boxShadow: "0 1px 4px #2563eb11",
          }}
        >
          {name?.[0]?.toUpperCase() || "?"}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {editing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  borderRadius: 6,
                  border: "1.5px solid #b3bac5",
                  padding: 6,
                  width: 160,
                  background: "#f8f9fb",
                  color: "#23272f",
                }}
              />
            ) : (
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#1e293b",
                  letterSpacing: "-0.5px",
                }}
              >
                {name}
              </span>
            )}

            {getTags(acc).map((tag) => (
              <span
                key={tag}
                style={{
                  marginLeft: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "#f6f7f9",
                  color:
                    tag === "VIP"
                      ? "#2563eb"
                      : tag === "Prospect"
                      ? "#36a2eb"
                      : tag === "Active"
                      ? "#22c55e"
                      : "#23272f",
                  border: "1px solid #d1d5db",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#555",
              margin: "2px 0 6px 0",
              fontWeight: 500,
            }}
          >
            Besitzer:{" "}
            <span style={{ fontWeight: 400 }}>{ownerName || "-"}</span>
          </div>

          <div style={{ fontSize: 11, color: "#888", fontWeight: 500 }}>
            Erstellt:{" "}
            <span style={{ fontWeight: 400 }}>
              {new Date(acc.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div style={{ marginTop: 4 }}>
            {editing ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  fontSize: 13,
                  borderRadius: 6,
                  border: "1.5px solid #b3bac5",
                  padding: 6,
                  width: "100%",
                  background: "#f8f9fb",
                  color: "#23272f",
                }}
              />
            ) : (
              <span style={{ fontSize: 12, color: "#666", fontWeight: 400 }}>
                {notes}
              </span>
            )}
          </div>
        </div>

        {editing ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditing(false);
              onInlinePatch({ name, notes });
            }}
            style={{
              marginLeft: 8,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "4px 10px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Speichern
          </button>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------------------------------------
   AccountsTable
--------------------------------------------- */

const TYPE_LABELS: Record<string, string> = {
  CLIENT: "Kunde",
  POTENTIAL_CLIENT: "Interessent",
  PARTNER: "Partner",
  SUPPLIER: "Lieferant",
};

type Props = {
  search?: string;
  typeFilter?: string;
  ownerFilter?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string; // e.g. "createdAt-desc"
  tagFilter?: string;
  onSortChange?: (sortBy: string) => void;
};

function AccountsTable({
  search = "",
  typeFilter = "",
  ownerFilter = "",
  dateFrom = "",
  dateTo = "",
  sortBy = "createdAt-desc",
  tagFilter = "",
  onSortChange,
}: Props) {
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [users, setUsers] = useState<{ id: string; name?: string; email?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [activityAccountId, setActivityAccountId] = useState<string | null>(null);

  // Load accounts + users
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const [res, usersRes] = await Promise.all([
          api.get("/accounts"),
          api.get("/users").catch(() => []),
        ]);
        const data = (res?.data ?? res) as any;
        const list: Account[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        if (alive) {
          setAccounts(list);
          setUsers(Array.isArray(usersRes) ? usersRes : []);
        }
      } catch {
        if (alive) setAccounts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  // Tags helper
  const getTags = (a: Account) => {
    if (Array.isArray(a.tags) && a.tags.length) return a.tags;
    if (a.status) return [a.status];
    // fallback: simple demo tags
    const n = parseInt(a.id || "0", 36);
    if (Number.isFinite(n)) return n % 3 === 0 ? ["VIP"] : n % 3 === 1 ? ["Prospect"] : ["Active"];
    return [];
  };

  // Selection helpers
  function handleSelectAll(ids: string[], checked: boolean) {
    if (checked) {
      setSelected((prev) => Array.from(new Set([...prev, ...ids])));
    } else {
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    }
  }

  function handleSelect(id: string, checked: boolean) {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((sel) => sel !== id)));
  }

  // Filtering + sorting
  const filteredAccounts = useMemo(() => {
    const q = safeToLower(search);

    let list = (Array.isArray(accounts) ? accounts : []).filter((a) => {
      const matchesSearch =
        safeToLower(a.name).includes(q) ||
        safeToLower(a.email).includes(q) ||
        safeToLower(a.ownerUserId).includes(q);

      const matchesType = !typeFilter || a.type === typeFilter;
      const matchesOwner = !ownerFilter || a.ownerUserId === ownerFilter;

      let matchesDate = true;
      if (dateFrom) matchesDate = matchesDate && new Date(a.createdAt) >= new Date(dateFrom);
      if (dateTo) matchesDate = matchesDate && new Date(a.createdAt) <= new Date(dateTo);

      const tags = getTags(a);
      const matchesTag = !tagFilter || tags.includes(tagFilter);

      return matchesSearch && matchesType && matchesOwner && matchesDate && matchesTag;
    });

    const [sortField, sortDir] = sortBy.split("-");
    list = list.slice().sort((a: any, b: any) => {
      let aVal = a?.[sortField];
      let bVal = b?.[sortField];

      if (sortField === "createdAt") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else {
        aVal = safeToLower(aVal);
        bVal = safeToLower(bVal);
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [accounts, search, typeFilter, ownerFilter, dateFrom, dateTo, sortBy, tagFilter]);

  // Group by type for columns
  const grouped = useMemo(() => {
    const types = Array.from(new Set(filteredAccounts.map((a) => a.type)));
    return types.map((type) => ({
      type,
      accounts: filteredAccounts.filter((a) => a.type === type),
    }));
  }, [filteredAccounts]);

  /* ---------------------------------------------
     Actions
  --------------------------------------------- */

  function handleExportCSV() {
    if (!filteredAccounts.length) return;

    const csv = buildCsv(filteredAccounts as any);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "accounts.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  }

  async function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = parseCsv(text);

      // Basic mapping: tries to use CSV headers if they match fields.
      // If your CSV has different headers, adjust mapping here.
      const imported: Account[] = rows
        .map((r: any) => {
          const id = r.id || crypto.randomUUID();
          const name = r.name || "";
          const type = r.type || "Client";
          const createdAt = r.createdAt || new Date().toISOString();

          if (!name) return null;

          return {
            id,
            name,
            type,
            ownerUserId: r.ownerUserId || undefined,
            createdAt,
            updatedAt: r.updatedAt || undefined,
            email: r.email || undefined,
            notes: r.notes || undefined,
            address: r.address || undefined,
            phone: r.phone || undefined,
            tags: r.tags ? String(r.tags).split("|").map((t) => t.trim()).filter(Boolean) : undefined,
            status: r.status || undefined,
          } as Account;
        })
        .filter(Boolean) as Account[];

      if (!imported.length) return;

      // Update UI immediately (fast feedback)
      setAccounts((prev) => {
        const byId = new Map(prev.map((a) => [a.id, a]));
        for (const a of imported) byId.set(a.id, { ...byId.get(a.id), ...a });
        return Array.from(byId.values());
      });

      // Optional: also persist to backend if your API supports it.
      // If your backend doesn't have a bulk endpoint, this will try one-by-one.
      for (const acc of imported) {
        try {
          await api.post("/accounts", acc);
        } catch {
          // ignore per-row errors so one bad row doesn't stop everything
        }
      }
    } finally {
      // allow importing the same file again
      e.target.value = "";
    }
  }

  const handleOpenEditModal = (account: Account) => {
    setEditAccount(account);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (data: any) => {
    if (!editAccount) return;

    try {
      const typeMap: Record<string, string> = {
        Client: "CLIENT",
        Partner: "PARTNER",
        "Potential Client": "POTENTIAL_CLIENT",
        Supplier: "SUPPLIER",
      };

      const payload: any = { ...data };
      if (typeof data.type !== "undefined" && data.type !== editAccount.type) {
        payload.type = typeMap[data.type] || data.type;
      } else {
        delete payload.type;
      }

      await api.patch(`/accounts/${editAccount.id}`, payload);

      setAccounts((accs) =>
        accs.map((a) => (a.id === editAccount.id ? { ...a, ...payload } : a))
      );
    } catch {
      toast.error("Konto konnte nicht gespeichert werden.");
    } finally {
      setEditModalOpen(false);
      setEditAccount(null);
    }
  };

  const handleDelete = async (accountId: string) => {
    try {
      await api.delete(`/accounts/${accountId}`);
      setAccounts((accs) => accs.filter((a) => a.id !== accountId));
      setSelected((prev) => prev.filter((id) => id !== accountId));
      toast.success("Konto gelöscht.");
    } catch {
      toast.error("Konto konnte nicht gelöscht werden.");
    }
  };

  async function handleBulkDelete() {
    if (!selected.length) return;
    if (!window.confirm(`${selected.length} Konten wirklich löschen?`)) return;

    for (const id of selected) {
      try { await api.delete(`/accounts/${id}`); } catch {}
    }

    setAccounts((prev) => prev.filter((a) => !selected.includes(a.id)));
    setSelected([]);
    toast.success(`${selected.length} Konten gelöscht.`);
  }

  function handleBulkAssign() {
    toast.info("Funktion demnächst verfügbar.");
  }

  function handleBulkType() {
    toast.info("Funktion demnächst verfügbar.");
  }

  /* ---------------------------------------------
     Render
  --------------------------------------------- */

  return (
    <>
      {selected.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 16px", background: "#fef2f2",
          borderBottom: "1px solid #fecaca", marginBottom: 12,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>
            {selected.length} ausgewählt
          </span>
          <button
            onClick={handleBulkDelete}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#dc2626", color: "#fff", border: "none",
              borderRadius: 7, padding: "6px 14px", fontSize: 13,
              fontWeight: 600, cursor: "pointer",
            }}
          >
            <FiTrash2 size={13} /> Ausgewählte löschen
          </button>
          <button
            onClick={() => setSelected([])}
            style={{ fontSize: 13, color: "#64748b", background: "none", border: "none", cursor: "pointer" }}
          >
            Abbrechen
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "40px 24px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Lade Firmen...</div>
      ) : filteredAccounts.length === 0 ? (
        <div style={{ padding: "40px 24px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Keine Firmen gefunden.</div>
      ) : (() => {
        const [sortField, sortDir] = sortBy.split("-");
        const handleSort = (field: string) => {
          if (!onSortChange) return;
          const newDir = sortField === field && sortDir === "asc" ? "desc" : "asc";
          onSortChange(`${field}-${newDir}`);
        };
        const SortIcon = ({ field }: { field: string }) => {
          if (sortField !== field) return <span style={{ color: "#cbd5e1", marginLeft: 4 }}>↕</span>;
          return <span style={{ color: "#2563eb", marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
        };
        const thStyle: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", background: "#f8fafc", borderBottom: "2px solid #e5e7eb", cursor: onSortChange ? "pointer" : "default", userSelect: "none", whiteSpace: "nowrap" };
        const allIds = filteredAccounts.map(a => a.id);
        const allSelected = allIds.length > 0 && allIds.every(id => selected.includes(id));
        return (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 36, cursor: "default" }}>
                    <input type="checkbox" checked={allSelected} onChange={e => handleSelectAll(allIds, e.target.checked)} style={{ width: 15, height: 15 }} />
                  </th>
                  <th style={thStyle} onClick={() => handleSort("name")}>Name <SortIcon field="name" /></th>
                  <th style={thStyle} onClick={() => handleSort("type")}>Typ <SortIcon field="type" /></th>
                  <th style={thStyle} onClick={() => handleSort("email")}>E-Mail <SortIcon field="email" /></th>
                  <th style={thStyle}>Telefon</th>
                  <th style={thStyle} onClick={() => handleSort("ownerUserId")}>Verantwortlich <SortIcon field="ownerUserId" /></th>
                  <th style={thStyle} onClick={() => handleSort("createdAt")}>Erstellt <SortIcon field="createdAt" /></th>
                  <th style={{ ...thStyle, width: 80, cursor: "default" }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map(acc => {
                  const owner = users.find(u => u.id === acc.ownerUserId);
                  const ownerName = owner?.name || owner?.email || (acc.ownerUserId ? acc.ownerUserId.slice(0, 8) + "…" : "—");
                  const typeColor: Record<string, string> = { CLIENT: "#2563eb", POTENTIAL_CLIENT: "#7c3aed", PARTNER: "#d97706", SUPPLIER: "#059669" };
                  const tc = typeColor[acc.type] || "#64748b";
                  return (
                    <tr key={acc.id}
                      style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 16px" }}>
                        <input type="checkbox" checked={selected.includes(acc.id)} onChange={e => handleSelect(acc.id, e.target.checked)} style={{ width: 15, height: 15 }} />
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <a href={`/accounts/${acc.id}`} style={{ color: "#1e293b", fontWeight: 600, textDecoration: "none" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#2563eb")}
                          onMouseLeave={e => (e.currentTarget.style.color = "#1e293b")}
                        >{acc.name}</a>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: tc, background: `${tc}14`, borderRadius: 20, padding: "2px 9px" }}>{TYPE_LABELS[acc.type] || acc.type}</span>
                      </td>
                      <td style={{ padding: "10px 16px", color: "#475569" }}>{acc.email || "—"}</td>
                      <td style={{ padding: "10px 16px", color: "#475569" }}>{acc.phone || "—"}</td>
                      <td style={{ padding: "10px 16px", color: "#475569" }}>{ownerName}</td>
                      <td style={{ padding: "10px 16px", color: "#94a3b8", fontSize: 12 }}>{acc.createdAt ? new Date(acc.createdAt).toLocaleDateString("de-CH") : "—"}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => handleOpenEditModal(acc)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 4 }} title="Bearbeiten">
                            <FiEdit2 size={14} />
                          </button>
                          {isAdmin && (
                            <button onClick={() => handleDelete(acc.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 4 }} title="Löschen">
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })()}

      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Account bearbeiten"
      >
        {editAccount && (
          <AccountEditForm
            initialData={editAccount}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditModalOpen(false)}
          />
        )}
      </Modal>

      {activityAccountId && (
        <ActivityLog
          accountId={activityAccountId}
          onClose={() => setActivityAccountId(null)}
        />
      )}
    </>
  );
}

export default AccountsTable;
