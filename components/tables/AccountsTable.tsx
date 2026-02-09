"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiActivity, FiEdit2, FiTrash2 } from "react-icons/fi";

import { api } from "../../src/api/client";
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
            <span style={{ fontWeight: 400 }}>{acc.ownerUserId || "-"}</span>
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

type Props = {
  search?: string;
  typeFilter?: string;
  ownerFilter?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string; // e.g. "createdAt-desc"
  tagFilter?: string;
};

function AccountsTable({
  search = "",
  typeFilter = "",
  ownerFilter = "",
  dateFrom = "",
  dateTo = "",
  sortBy = "createdAt-desc",
  tagFilter = "",
}: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [activityAccountId, setActivityAccountId] = useState<string | null>(null);

  // Load accounts
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/accounts");
        const data = (res?.data ?? res) as any;

        // Support both array response or {data: []}
        const list: Account[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        if (alive) setAccounts(list);
      } catch {
        if (alive) setAccounts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
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
      alert("Error updating account");
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
    } catch {
      alert("Error deleting account");
    }
  };

  async function handleBulkDelete() {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} accounts?`)) return;

    for (const id of selected) {
      // best-effort: keep going even if one fails
      try {
        await api.delete(`/accounts/${id}`);
      } catch {}
    }

    setAccounts((prev) => prev.filter((a) => !selected.includes(a.id)));
    setSelected([]);
  }

  function handleBulkAssign() {
    // Keep it compiling + safe: you can replace with your real UI later.
    alert("Assign Owner: implement your UI here (e.g., open a modal)");
  }

  function handleBulkType() {
    alert("Change Type: implement your UI here (e.g., open a modal)");
  }

  /* ---------------------------------------------
     Render
  --------------------------------------------- */

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          className="accounts-export-btn"
          style={{
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 4,
            border: "1px solid #2563eb",
            background: "#2563eb",
            color: "#fff",
            padding: "6px 14px",
            cursor: "pointer",
            height: 32,
            boxShadow: "none",
            opacity: loading ? 0.6 : 1,
          }}
          onClick={handleExportCSV}
          disabled={loading}
        >
          CSV exportieren
        </button>

        <label
          className="accounts-import-label"
          style={{
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 4,
            border: "1px solid #36a2eb",
            background: "#fff",
            color: "#36a2eb",
            padding: "6px 14px",
            cursor: "pointer",
            height: 32,
            display: "flex",
            alignItems: "center",
            boxShadow: "none",
            opacity: loading ? 0.6 : 1,
          }}
        >
          CSV importieren
          <input
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleImportCSV}
            disabled={loading}
          />
        </label>
      </div>

      {selected.length > 0 && (
        <div
          className="accounts-bulk-bar"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "#f4f5f7",
            borderBottom: "1.5px solid #b3bac5",
            padding: 12,
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <span style={{ fontWeight: 600 }}>{selected.length} selected</span>

          <div className="accounts-bulk-buttons" style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleBulkDelete}
              style={{
                background: "#fff0f0",
                color: "#d32f2f",
                border: "1.5px solid #d32f2f",
                borderRadius: 6,
                padding: "6px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Delete
            </button>

            <button
              onClick={handleBulkAssign}
              style={{
                background: "#e9f2ff",
                color: "#0052cc",
                border: "1.5px solid #0052cc",
                borderRadius: 6,
                padding: "6px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Assign Owner
            </button>

            <button
              onClick={handleBulkType}
              style={{
                background: "#f4f5f7",
                color: "#222",
                border: "1.5px solid #b3bac5",
                borderRadius: 6,
                padding: "6px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Change Type
            </button>

            <button
              onClick={() => setSelected([])}
              style={{
                marginLeft: 8,
                background: "#fff",
                color: "#0052cc",
                border: "1.5px solid #b3bac5",
                borderRadius: 6,
                padding: "6px 16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: "#666", fontSize: 13 }}>Loading accounts…</div>
      ) : (
        <div
          className="accounts-table-section"
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          {grouped.map((col) => {
            const allIds = col.accounts.map((acc) => acc.id);
            const allSelected = allIds.length > 0 && allIds.every((id) => selected.includes(id));

            return (
              <div
                key={col.type}
                className="accounts-table-col"
                style={{ flex: "1 1 280px", minWidth: 280, maxWidth: 380 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: 0.2,
                      color: "#2563eb",
                      textTransform: "uppercase",
                      background: "#f6f7f9",
                      borderRadius: 4,
                      padding: "4px 0",
                      flex: 1,
                      border: "1px solid #d1d5db",
                    }}
                  >
                    {col.type}
                  </div>

                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(allIds, e.target.checked)}
                    style={{ marginLeft: 6, width: 16, height: 16 }}
                    title="Select all in column"
                  />
                </div>

                {col.accounts.length === 0 && (
                  <div
                    style={{
                      color: "#bbb",
                      textAlign: "center",
                      fontStyle: "italic",
                      margin: "24px 0",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      opacity: 0.8,
                    }}
                  >
                    <span style={{ fontSize: 32, opacity: 0.5 }}>🗂️</span>
                    <span>Keine Accounts</span>
                  </div>
                )}

                {col.accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="account-card"
                    style={{
                      marginBottom: 10,
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: 8,
                    }}
                  >
                    <InlineEditableAccountCard
                      acc={acc}
                      selected={selected.includes(acc.id)}
                      onSelect={(checked) => handleSelect(acc.id, checked)}
                      onInlinePatch={(patch) =>
                        setAccounts((accs) =>
                          accs.map((a) => (a.id === acc.id ? { ...a, ...patch } : a))
                        )
                      }
                      getTags={getTags}
                      onOpenEditModal={handleOpenEditModal}
                      onDelete={handleDelete}
                      onShowActivity={(id) => setActivityAccountId(id)}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

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
