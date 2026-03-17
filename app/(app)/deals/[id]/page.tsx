"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../src/api/client";
import { FiArrowLeft, FiEdit2, FiDollarSign, FiCalendar, FiUser, FiTag, FiPaperclip, FiMessageSquare, FiClock } from "react-icons/fi";
import FollowUpBadge from "../../../../components/ui/FollowUpBadge";

const STAGE_BADGE: Record<string, { bg: string; color: string }> = {
  won: { bg: '#dcfce7', color: '#16a34a' },
  lost: { bg: '#fee2e2', color: '#dc2626' },
  default: { bg: '#eff6ff', color: '#2563eb' },
};

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [deal, setDeal] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [attachUrl, setAttachUrl] = useState("");
  const [attachName, setAttachName] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editVal, setEditVal] = useState<any>("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'attachments'>('notes');

  const fetchAll = useCallback(async () => {
    try {
      const [dealData, notesData, attachData, stagesData] = await Promise.all([
        api.get(`/deals/${params.id}`),
        api.get(`/deals/${params.id}/notes`),
        api.get(`/deals/${params.id}/attachments`),
        api.get('/deals/deal-stages'),
      ]);
      setDeal(dealData);
      setNotes(Array.isArray(notesData) ? notesData : []);
      setAttachments(Array.isArray(attachData) ? attachData : []);
      setStages(Array.isArray(stagesData) ? stagesData.sort((a: any, b: any) => a.order - b.order) : []);
    } catch { router.replace('/deals'); }
    setLoading(false);
  }, [params.id, router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleStageChange(toStageId: string) {
    setSaving(true);
    try {
      await api.post(`/deals/${params.id}/change-stage`, { toStageId });
      await fetchAll();
    } catch {}
    setSaving(false);
  }

  async function saveField(field: string, value: any) {
    setSaving(true);
    try {
      await api.patch(`/deals/${params.id}`, { [field]: value });
      await fetchAll();
    } catch {}
    setEditingField(null);
    setSaving(false);
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await api.post(`/deals/${params.id}/notes`, { content: noteText, dealId: params.id });
      setNoteText("");
      const notesData = await api.get(`/deals/${params.id}/notes`);
      setNotes(Array.isArray(notesData) ? notesData : []);
    } catch {}
    setSaving(false);
  }

  async function addAttachment(e: React.FormEvent) {
    e.preventDefault();
    if (!attachUrl.trim() || !attachName.trim()) return;
    setSaving(true);
    try {
      await api.post(`/deals/${params.id}/attachments`, { url: attachUrl, filename: attachName, dealId: params.id });
      setAttachUrl(""); setAttachName("");
      const attData = await api.get(`/deals/${params.id}/attachments`);
      setAttachments(Array.isArray(attData) ? attData : []);
    } catch {}
    setSaving(false);
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: 28, height: 28, border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!deal) return null;

  const currentStage = stages.find((s) => s.id === deal.stageId);
  const stageBadge = currentStage?.isWon ? STAGE_BADGE.won : currentStage?.isLost ? STAGE_BADGE.lost : STAGE_BADGE.default;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <Link href="/deals" style={{ display: 'flex', alignItems: 'center', color: '#64748b', textDecoration: 'none', fontSize: 13, gap: 4 }}>
          <FiArrowLeft size={16} /> Zurück zu Deals
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left: main info */}
        <div>
          {/* Deal title card */}
          <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                {editingField === 'name' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={editVal} onChange={(e) => setEditVal(e.target.value)}
                      style={{ flex: 1, fontSize: 22, fontWeight: 800, color: '#1e293b', border: '1.5px solid #2563eb', borderRadius: 8, padding: '4px 10px' }} autoFocus />
                    <button onClick={() => saveField('name', editVal)} disabled={saving}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 7, padding: '0 14px', cursor: 'pointer', fontWeight: 600 }}>
                      Speichern
                    </button>
                    <button onClick={() => setEditingField(null)}
                      style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 7, padding: '0 12px', cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    {deal.name}
                    <button onClick={() => { setEditingField('name'); setEditVal(deal.name); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
                      <FiEdit2 size={16} />
                    </button>
                  </h1>
                )}
              </div>
              {/* Stage badge + follow-up */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ ...stageBadge, borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
                  {currentStage?.name || deal.stageId}
                </span>
                <FollowUpBadge entityType="deal" entityId={params.id} followUpDate={deal.followUpDate} onUpdated={fetchAll} />
              </div>
            </div>

            {/* Fields grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Betrag', field: 'amount', icon: <FiDollarSign size={14} />, display: `${deal.amount?.toLocaleString('de-CH')} ${deal.currency}`, type: 'number' },
                { label: 'Wahrscheinlichkeit', field: 'probability', icon: <FiTag size={14} />, display: `${deal.probability}%`, type: 'number' },
                { label: 'Erw. Abschlussdatum', field: 'expectedCloseDate', icon: <FiCalendar size={14} />, display: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString('de-CH') : '—', type: 'date' },
                { label: 'Deal-Score', field: 'dealScore', icon: <FiTag size={14} />, display: deal.dealScore, type: null },
              ].map((item) => (
                <div key={item.field} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    {item.icon} {item.label}
                  </div>
                  {editingField === item.field && item.type ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input type={item.type} value={editVal} onChange={(e) => setEditVal(e.target.value)}
                        style={{ flex: 1, fontSize: 14, border: '1.5px solid #2563eb', borderRadius: 6, padding: '4px 8px' }} autoFocus />
                      <button onClick={() => saveField(item.field, editVal)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '0 10px', cursor: 'pointer', fontSize: 12 }}>✓</button>
                      <button onClick={() => setEditingField(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '0 8px', cursor: 'pointer', fontSize: 12 }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{item.display}</span>
                      {item.type && (
                        <button onClick={() => { setEditingField(item.field); setEditVal(item.field === 'expectedCloseDate' ? (deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '') : deal[item.field]); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 2 }}>
                          <FiEdit2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stage pipeline */}
          <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Phase verschieben</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {stages.map((s) => {
                const active = s.id === deal.stageId;
                const color = s.isWon ? '#16a34a' : s.isLost ? '#dc2626' : '#2563eb';
                return (
                  <button key={s.id} onClick={() => !active && handleStageChange(s.id)} disabled={active || saving}
                    style={{ padding: '7px 14px', borderRadius: 8, border: active ? `2px solid ${color}` : '1.5px solid #e5e7eb', background: active ? `${color}12` : '#f8fafc', color: active ? color : '#64748b', fontWeight: active ? 700 : 500, fontSize: 12, cursor: active ? 'default' : 'pointer', transition: 'all 0.15s' }}>
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes & Attachments tabs */}
          <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
              {[['notes', <FiMessageSquare size={14} />, `Notizen (${notes.length})`], ['attachments', <FiPaperclip size={14} />, `Anhänge (${attachments.length})`]].map(([tab, icon, label]) => (
                <button key={tab as string} onClick={() => setActiveTab(tab as any)}
                  style={{ flex: 1, padding: '14px 16px', border: 'none', background: activeTab === tab ? '#fff' : '#f8fafc', color: activeTab === tab ? '#2563eb' : '#64748b', fontWeight: activeTab === tab ? 700 : 500, fontSize: 13, cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {icon as any} {label as string}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px 24px' }}>
              {activeTab === 'notes' && (
                <div>
                  <form onSubmit={addNote} style={{ marginBottom: 20 }}>
                    <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Neue Notiz eingeben..."
                      style={{ width: '100%', minHeight: 80, borderRadius: 9, border: '1.5px solid #e5e7eb', padding: '10px 14px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    <button type="submit" disabled={!noteText.trim() || saving}
                      style={{ marginTop: 8, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: noteText.trim() ? 'pointer' : 'not-allowed', opacity: noteText.trim() ? 1 : 0.5 }}>
                      Notiz hinzufügen
                    </button>
                  </form>
                  {notes.length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Noch keine Notizen.</div>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', marginBottom: 10 }}>
                        <div style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.5 }}>{n.content}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiClock size={11} /> {new Date(n.createdAt).toLocaleString('de-CH')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'attachments' && (
                <div>
                  <form onSubmit={addAttachment} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 20 }}>
                    <input value={attachName} onChange={(e) => setAttachName(e.target.value)} placeholder="Dateiname"
                      style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13 }} />
                    <input value={attachUrl} onChange={(e) => setAttachUrl(e.target.value)} placeholder="URL"
                      style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13 }} />
                    <button type="submit" disabled={!attachUrl.trim() || !attachName.trim() || saving}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: (attachUrl.trim() && attachName.trim()) ? 1 : 0.5 }}>
                      + Hinzufügen
                    </button>
                  </form>
                  {attachments.length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Noch keine Anhänge.</div>
                  ) : (
                    attachments.map((a) => (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', marginBottom: 8 }}>
                        <FiPaperclip size={16} color="#64748b" />
                        <div style={{ flex: 1 }}>
                          <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, fontSize: 13, color: '#2563eb', textDecoration: 'none' }}>{a.filename}</a>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{new Date(a.createdAt).toLocaleDateString('de-CH')}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar: account + meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Meta */}
          <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Deal-Info</div>
            {[
              { label: 'Erstellt am', value: deal.createdAt ? new Date(deal.createdAt).toLocaleDateString('de-CH') : '—', icon: <FiCalendar size={13} /> },
              { label: 'Zuletzt geändert', value: deal.updatedAt ? new Date(deal.updatedAt).toLocaleDateString('de-CH') : '—', icon: <FiCalendar size={13} /> },
              { label: 'Besitzer', value: deal.owner?.name || deal.ownerUserId || '—', icon: <FiUser size={13} /> },
              { label: 'Erstellt von', value: deal.creator?.name || deal.createdByUserId || '—', icon: <FiUser size={13} /> },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>{item.icon} {item.label}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Account */}
          {deal.account && (
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Verknüpftes Konto</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{deal.account.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{deal.account.type}</div>
              <Link href="/accounts" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
                Konto anzeigen →
              </Link>
            </div>
          )}

          {/* Custom fields */}
          {deal.customFields && Object.keys(deal.customFields).length > 0 && (
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Benutzerdefinierte Felder</div>
              {Object.entries(deal.customFields).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
