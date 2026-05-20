"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import './contact-id-mobile.css';
import Link from "next/link";
import { api } from "../../../../src/api/client";
import { formatCurrency } from "../../../../src/lib/formatCurrency";
import Modal from "../../../../components/ui/Modal";
import { useToast } from "../../../../components/ui/Toast";
import ActivityTimeline from "../../../../components/contacts/ActivityTimeline";
import FollowUpBadge from "../../../../components/ui/FollowUpBadge";
import FollowUpSection from "../../../../components/followups/FollowUpSection";
import EmailDialog from "../../../../components/ui/EmailDialog";
import { FiMail } from "react-icons/fi";

export default function ContactDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", title: "", accountId: "" });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [linkedDeals, setLinkedDeals] = useState<any[]>([]);
  const [emailOpen, setEmailOpen] = useState(false);
  const toast = useToast();

  const fetchContact = () => {
    api.get(`/contacts/${id}`)
      .then(data => { setContact(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchContact(); }, [id]);

  useEffect(() => {
    api.get('/accounts').then((d: any) => setAccounts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (contact?.accountId) {
      api.get('/deals').then((res: any) => {
        const deals = res?.data ?? (Array.isArray(res) ? res : []);
        setLinkedDeals(deals.filter((d: any) => d.accountId === contact.accountId));
      }).catch(() => {});
    }
  }, [contact?.accountId]);

  const openEdit = () => {
    setEditForm({
      name: contact?.name || "",
      email: contact?.email || "",
      phone: contact?.phone || "",
      title: contact?.title || "",
      accountId: contact?.accountId || "",
    });
    setEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/contacts/${id}`, editForm);
      setEditOpen(false);
      fetchContact();
      toast.success("Kontakt gespeichert.");
    } catch {
      toast.error("Kontakt konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div style={{ width: 28, height: 28, border: "3px solid #e5e7eb", borderTopColor: "#1a1a1a", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!contact) return <div style={{ padding: 32, color: "#ef4444" }}>Kontakt nicht gefunden.</div>;

  const initials = contact.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ padding: "28px 32px", maxWidth: 900, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div className="contact-breadcrumb" style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
        <Link href={contact.account?.id ? `/accounts/${contact.account.id}` : '/accounts'} style={{ color: "#1a1a1a", textDecoration: "none", fontWeight: 600 }}>Firmen</Link>
        <span style={{ margin: "0 6px" }}>{' › '}</span>
        {contact.account?.id ? (
          <Link href={`/accounts/${contact.account.id}`} style={{ color: "#1a1a1a", textDecoration: "none", fontWeight: 600 }}>{contact.account?.name || '—'}</Link>
        ) : (
          <span style={{ color: "#1a1a1a", fontWeight: 600 }}>{contact.account?.name || '—'}</span>
        )}
        <span style={{ margin: "0 6px" }}>{' › '}</span>
        <Link href="/contacts" style={{ color: "#1a1a1a", textDecoration: "none", fontWeight: 600 }}>Kontakte</Link>
        <span style={{ margin: "0 6px" }}>{' › '}</span>
        <span style={{ color: "#1e293b" }}>{contact.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e8a838", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 20 }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: 0 }}>{contact.name}</h1>
            {contact.title && <div style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}>{contact.title}</div>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {contact.email && (
            <button
              onClick={() => setEmailOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: "#1a1a1a", border: "1.5px solid #1a1a1a", borderRadius: 8, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              <FiMail size={13} /> E-Mail
            </button>
          )}
          <button onClick={openEdit} style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Bearbeiten
          </button>
        </div>
      </div>

      <EmailDialog
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        defaultTo={contact.email || ""}
        defaultSubject={`Re: ${contact.name}`}
        entityType="Contact"
        entityId={id}
        accountId={contact.accountId || undefined}
        contactId={id}
      />

      {/* Info card */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #e5e7eb", padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px" }}>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>E-Mail</div>
            <div style={{ fontSize: 14, color: "#1e293b" }}>
              {contact.email ? <a href={`mailto:${contact.email}`} style={{ color: "#1a1a1a", textDecoration: "none" }}>{contact.email}</a> : <span style={{ color: "#cbd5e1" }}>—</span>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Telefon</div>
            <div style={{ fontSize: 14, color: "#1e293b" }}>
              {contact.phone ? <a href={`tel:${contact.phone}`} style={{ color: "#1a1a1a", textDecoration: "none" }}>{contact.phone}</a> : <span style={{ color: "#cbd5e1" }}>—</span>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Firma/Konto</div>
            <div style={{ fontSize: 14, color: "#1e293b" }}>
              {contact.account
                ? <Link href={`/accounts/${contact.account.id}`} style={{ color: "#1a1a1a", textDecoration: "none", fontWeight: 600 }}>{contact.account.name}</Link>
                : <span style={{ color: "#cbd5e1" }}>—</span>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Erstellt</div>
            <div style={{ fontSize: 14, color: "#1e293b" }}>
              {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString("de-CH") : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Verknüpfte Deals */}
      {contact.accountId && linkedDeals.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #e5e7eb", padding: "18px 24px", marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>Verknüpfte Deals</div>
          {linkedDeals.map((d: any) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
              <Link href={`/deals/${d.id}`} style={{ color: "#1a1a1a", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                {d.name || "Unbenannter Deal"}
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {d.stage?.name && (
                  <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "2px 8px" }}>
                    {d.stage.name}
                  </span>
                )}
                {d.amount != null && (
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                    {formatCurrency(d.amount)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Follow-ups */}
      <FollowUpSection entityType="Contact" entityId={id} />

      {/* Unified Timeline (Notes + E-Mails — Aktivitäten ausgeblendet) */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #e5e7eb", padding: "18px 24px", marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>Notizen & E-Mails</div>
        <ActivityTimeline contactId={id} accountId={contact.accountId} hideActivity />
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Kontakt bearbeiten">
        <form onSubmit={handleSave}>
          {[
            { label: "Name", key: "name", type: "text", required: true },
            { label: "E-Mail", key: "email", type: "email", required: true },
            { label: "Telefon", key: "phone", type: "text", required: false },
            { label: "Position / Titel", key: "title", type: "text", required: false },
          ].map(({ label, key, type, required }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>{label}</label>
              <input
                type={type}
                required={required}
                value={editForm[key as keyof typeof editForm]}
                onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Firma/Konto</label>
            <select
              value={editForm.accountId}
              onChange={e => setEditForm(f => ({ ...f, accountId: e.target.value }))}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 7, border: "1.5px solid #d1d5db", fontSize: 14, boxSizing: "border-box", background: "#fff", color: "#1e293b" }}
            >
              <option value="">Keine Firma</option>
              {accounts.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button type="button" onClick={() => setEditOpen(false)} style={{ background: "#E8E4DE", color: "#64748b", border: "none", borderRadius: 7, padding: "8px 18px", fontWeight: 600, cursor: "pointer" }}>
              Abbrechen
            </button>
            <button type="submit" disabled={saving} style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Speichern..." : "Speichern"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
