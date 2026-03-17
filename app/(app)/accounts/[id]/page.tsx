"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { api } from "../../../../src/api/client";
import Modal from "../../../../components/ui/Modal";
import AccountEditForm from "../../../../components/forms/AccountEditForm";
import { useToast } from "../../../../components/ui/Toast";
import QuickNotes from "../../../../components/ui/QuickNotes";
import EmailLog from "../../../../components/ui/EmailLog";

export default function AccountDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const fetchAccount = () => {
    api.get(`/accounts/${id}`)
      .then(data => { setAccount(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchAccount(); }, [id]);

  const handleEdit = async (data: any) => {
    try {
      await api.patch(`/accounts/${id}`, data);
      setEditOpen(false);
      fetchAccount();
      toast.success("Konto gespeichert.");
    } catch {
      toast.error("Konto konnte nicht gespeichert werden.");
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div style={{ width: 28, height: 28, border: "3px solid #e5e7eb", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!account) return <div style={{ padding: 32, color: "#ef4444" }}>Konto nicht gefunden.</div>;

  const TYPE_LABELS: Record<string, string> = { CLIENT: "Kunde", POTENTIAL_CLIENT: "Potenzieller Kunde", PARTNER: "Partner" };
  const TYPE_COLORS: Record<string, string> = { CLIENT: "#2563eb", POTENTIAL_CLIENT: "#f59e0b", PARTNER: "#7c3aed" };
  const typeColor = TYPE_COLORS[account.type] || "#64748b";

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
        <Link href="/accounts" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>Konten</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: "#1e293b" }}>{account.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: 0 }}>{account.name}</h1>
            <span style={{ fontSize: 12, fontWeight: 700, color: typeColor, background: `${typeColor}14`, borderRadius: 20, padding: "3px 10px" }}>
              {TYPE_LABELS[account.type] || account.type}
            </span>
          </div>
          {account.owner && (
            <div style={{ fontSize: 13, color: "#64748b" }}>Verantwortlich: <b>{account.owner.name}</b></div>
          )}
        </div>
        <button onClick={() => setEditOpen(true)} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          Bearbeiten
        </button>
      </div>

      {/* Main layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Contacts */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Kontakte</span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{account.contacts?.length || 0} gesamt</span>
            </div>
            {!account.contacts?.length ? (
              <div style={{ padding: "24px 20px", color: "#94a3b8", fontSize: 13 }}>Keine Kontakte verknüpft.</div>
            ) : (
              <div>
                {account.contacts.map((c: any) => (
                  <Link key={c.id} href={`/contacts/${c.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid #f8fafc" }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {c.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{c.title || c.email}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Deals */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Deals</span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{account.deals?.length || 0} gesamt</span>
            </div>
            {!account.deals?.length ? (
              <div style={{ padding: "24px 20px", color: "#94a3b8", fontSize: 13 }}>Keine Deals verknüpft.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Name", "Phase", "Betrag", "Wahrschl."].map(h => (
                      <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {account.deals.map((d: any) => {
                    const stageColor = d.stage?.isWon ? "#16a34a" : d.stage?.isLost ? "#dc2626" : "#2563eb";
                    return (
                      <tr key={d.id}>
                        <td style={{ padding: "11px 20px", fontSize: 13 }}>
                          <Link href={`/deals/${d.id}`} style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>{d.name}</Link>
                        </td>
                        <td style={{ padding: "11px 20px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: stageColor, background: `${stageColor}14`, borderRadius: 20, padding: "2px 9px" }}>{d.stage?.name}</span>
                        </td>
                        <td style={{ padding: "11px 20px", fontSize: 13, color: "#1e293b" }}>{d.amount?.toLocaleString("de-CH")} {d.currency}</td>
                        <td style={{ padding: "11px 20px", fontSize: 13, color: "#64748b" }}>{d.probability}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Email Log */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #e5e7eb", padding: "18px 20px" }}>
            <EmailLog entityType="account" entityId={id} />
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #e5e7eb", padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Details</div>
            {[
              { label: "Adresse", value: account.address },
              { label: "Telefon", value: account.phone ? <a href={`tel:${account.phone}`} style={{ color: "#2563eb", textDecoration: "none" }}>{account.phone}</a> : null },
              { label: "E-Mail", value: account.email ? <a href={`mailto:${account.email}`} style={{ color: "#2563eb", textDecoration: "none" }}>{account.email}</a> : null },
              { label: "Erstellt", value: account.createdAt ? new Date(account.createdAt).toLocaleDateString("de-CH") : null },
            ].map(({ label, value }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, color: "#1e293b" }}>{value || <span style={{ color: "#cbd5e1" }}>—</span>}</div>
              </div>
            ))}
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>Notizen</div>
              <QuickNotes entityType="account" entityId={id} initialNotes={account.notes || ""} />
            </div>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Konto bearbeiten">
        {editOpen && <AccountEditForm initialData={account} onSubmit={handleEdit} onCancel={() => setEditOpen(false)} />}
      </Modal>
    </div>
  );
}
