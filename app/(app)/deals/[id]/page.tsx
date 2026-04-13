"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, fetchWithAuth } from "../../../../src/api/client";
import { formatCurrency } from "../../../../src/lib/formatCurrency";
import { SIA_PHASES as SIA_PHASES_FULL } from "../../../../src/lib/siaPhases";
import { FiArrowLeft, FiEdit2, FiDollarSign, FiCalendar, FiUser, FiTag, FiPaperclip, FiMessageSquare, FiClock, FiDownload, FiTrash2, FiUpload } from "react-icons/fi";
import FollowUpBadge from "../../../../components/ui/FollowUpBadge";

/* ─── SIA Leistungsphasen ─── */
const SIA_PHASES = [
  { group: '1 — Strategische Planung', items: [{ nr: 11, name: 'Bedürfnisformulierung & Lösungsstrategien' }] },
  { group: '2 — Vorstudien', items: [{ nr: 21, name: 'Machbarkeitsstudie' }, { nr: 22, name: 'Auswahlverfahren' }] },
  { group: '3 — Projektierung', items: [{ nr: 31, name: 'Vorprojekt' }, { nr: 32, name: 'Bauprojekt' }, { nr: 33, name: 'Bewilligungsverfahren' }] },
  { group: '4 — Ausschreibung', items: [{ nr: 41, name: 'Ausschreibung & Vergabe' }] },
  { group: '5 — Realisierung', items: [{ nr: 51, name: 'Ausführungsplanung' }, { nr: 52, name: 'Ausführung' }, { nr: 53, name: 'Inbetriebnahme & Abschluss' }] },
  { group: '6 — Bewirtschaftung', items: [{ nr: 61, name: 'Betrieb & Unterhalt' }] },
];

const ALL_PHASE_NRS = SIA_PHASES.flatMap(g => g.items.map(i => i.nr));
const PHASE_LABEL: Record<number, string> = {};
SIA_PHASES.forEach(g => g.items.forEach(i => { PHASE_LABEL[i.nr] = `${i.nr}`; }));

const ALLOWED_TYPES = [
  'application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/octet-stream', // for DWG/DXF
];
const ALLOWED_EXT = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.dwg', '.dxf'];
const MAX_SIZE = 50 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STAGE_BADGE: Record<string, { bg: string; color: string }> = {
  won: { bg: '#dcfce7', color: '#16a34a' },
  lost: { bg: '#fee2e2', color: '#dc2626' },
  default: { bg: '#eff6ff', color: '#1a1a1a' },
};

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [deal, setDeal] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editVal, setEditVal] = useState<any>("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'attachments' | 'phases'>('comments');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dealTasks, setDealTasks] = useState<any[]>([]);

  const fetchAll = useCallback(async () => {
    setLoadError(null);
    let dealData: any;
    try {
      dealData = await api.get(`/deals/${params.id}`);
    } catch (err: any) {
      console.error('[DealDetail] failed to load deal', params.id, err);
      if (err?.status === 404) { router.replace('/deals'); return; }
      setLoadError(err?.message || 'Deal konnte nicht geladen werden.');
      setLoading(false);
      return;
    }
    const [notesData, attachData, stagesData, tasksData] = await Promise.all([
      api.get(`/deals/${params.id}/notes`).catch((e) => { console.warn('[DealDetail] notes failed', e); return []; }),
      api.get(`/deals/${params.id}/attachments`).catch((e) => { console.warn('[DealDetail] attachments failed', e); return []; }),
      api.get('/deals/deal-stages').catch((e) => { console.warn('[DealDetail] deal-stages failed', e); return []; }),
      api.get('/tasks').catch((e) => { console.warn('[DealDetail] tasks failed', e); return []; }),
    ]);
    setDeal(dealData);
    setNotes(Array.isArray(notesData) ? notesData : []);
    setAttachments(Array.isArray(attachData) ? attachData : []);
    setStages(Array.isArray(stagesData) ? stagesData.sort((a: any, b: any) => a.order - b.order) : []);
    setDealTasks((Array.isArray(tasksData) ? tasksData : []).filter((t: any) => t.dealId === params.id));
    setLoading(false);
  }, [params.id, router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const selectedPhases: number[] = Array.isArray(deal?.phases) ? deal.phases : [];

  async function togglePhase(nr: number) {
    const current = [...selectedPhases];
    const idx = current.indexOf(nr);
    if (idx >= 0) current.splice(idx, 1); else current.push(nr);
    current.sort((a, b) => a - b);
    setSaving(true);
    try {
      await api.patch(`/deals/${params.id}`, { phases: current });
      setDeal((d: any) => ({ ...d, phases: current }));
    } catch {}
    setSaving(false);
  }

  async function handleStageChange(toStageId: string) {
    setSaving(true);
    try { await api.post(`/deals/${params.id}/change-stage`, { toStageId }); await fetchAll(); } catch {}
    setSaving(false);
  }

  async function saveField(field: string, value: any) {
    setSaving(true);
    try { await api.patch(`/deals/${params.id}`, { [field]: value }); await fetchAll(); } catch {}
    setEditingField(null); setSaving(false);
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await api.post(`/deals/${params.id}/notes`, { content: noteText, dealId: params.id });
      setNoteText("");
      const d = await api.get(`/deals/${params.id}/notes`);
      setNotes(Array.isArray(d) ? d : []);
    } catch {}
    setSaving(false);
  }

  async function handleFileUpload(files: FileList | File[]) {
    const fileArr = Array.from(files);
    for (const file of fileArr) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) { alert(`Typ nicht erlaubt: ${ext}`); continue; }
      if (file.size > MAX_SIZE) { alert(`Datei zu gross (max. 50 MB): ${file.name}`); continue; }
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        await api.upload(`/deals/${params.id}/upload`, formData);
        const d = await api.get(`/deals/${params.id}/attachments`);
        setAttachments(Array.isArray(d) ? d : []);
      } catch { alert(`Upload fehlgeschlagen: ${file.name}`); }
      setUploading(false);
    }
  }

  async function deleteAttachment(id: string) {
    if (!confirm('Anhang wirklich löschen?')) return;
    try {
      await api.delete(`/deals/attachments/${id}`);
      setAttachments(prev => prev.filter(a => a.id !== id));
    } catch { alert('Anhang konnte nicht gelöscht werden.'); }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: 28, height: 28, border: '3px solid #e5e7eb', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (loadError) return (
    <div style={{ padding: '24px 32px', maxWidth: 720, margin: '0 auto' }}>
      <Link href="/deals" style={{ display: 'inline-flex', alignItems: 'center', color: '#64748b', textDecoration: 'none', fontSize: 13, gap: 4, marginBottom: 16 }}>
        <FiArrowLeft size={16} /> Zurück zu Deals
      </Link>
      <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 14, padding: '20px 24px', color: '#991b1b' }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Deal konnte nicht geladen werden</div>
        <div style={{ fontSize: 14, marginBottom: 12 }}>{loadError}</div>
        <button onClick={() => { setLoading(true); fetchAll(); }} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Erneut versuchen</button>
      </div>
    </div>
  );
  if (!deal) return null;

  const currentStage = stages.find((s: any) => s.id === deal.stageId);
  const stageBadge = currentStage?.isWon ? STAGE_BADGE.won : currentStage?.isLost ? STAGE_BADGE.lost : STAGE_BADGE.default;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <Link href="/deals" style={{ display: 'flex', alignItems: 'center', color: '#64748b', textDecoration: 'none', fontSize: 13, gap: 4 }}>
          <FiArrowLeft size={16} /> Zurück zu Deals
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* ─── Left: main content ─── */}
        <div>
          {/* Title card */}
          <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                {editingField === 'name' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={editVal} onChange={e => setEditVal(e.target.value)} style={{ flex: 1, fontSize: 22, fontWeight: 800, color: '#1e293b', border: '1.5px solid #1a1a1a', borderRadius: 8, padding: '4px 10px' }} autoFocus />
                    <button onClick={() => saveField('name', editVal)} disabled={saving} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 7, padding: '0 14px', cursor: 'pointer', fontWeight: 600 }}>Speichern</button>
                    <button onClick={() => setEditingField(null)} style={{ background: '#E8E4DE', color: '#64748b', border: 'none', borderRadius: 7, padding: '0 12px', cursor: 'pointer' }}>✕</button>
                  </div>
                ) : (
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    {deal.name}
                    <button onClick={() => { setEditingField('name'); setEditVal(deal.name); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}><FiEdit2 size={16} /></button>
                  </h1>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ ...stageBadge, borderRadius: 8, padding: '5px 14px', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>{currentStage?.name || deal.stageId}</span>
                <FollowUpBadge entityType="deal" entityId={params.id} followUpDate={deal.followUpDate} onUpdated={fetchAll} />
              </div>
            </div>

            {/* Phase progress bar */}
            {selectedPhases.length > 0 && (() => {
              const tasksByPhase: Record<string, any[]> = {};
              dealTasks.forEach((t: any) => { if (t.phase) { (tasksByPhase[t.phase] ??= []).push(t); } });
              const phaseData = selectedPhases.map(nr => {
                const code = String(nr);
                const pt = tasksByPhase[code] || [];
                const status = getPhaseStatus(pt);
                const label = SIA_PHASES.flatMap(g => g.items).find(i => i.nr === nr);
                return { nr, code, status, name: label?.name || `Phase ${nr}`, tasks: pt.length };
              });
              const doneCount = phaseData.filter(p => p.status === 'done').length;
              const inProgressCount = phaseData.filter(p => p.status === 'in_progress').length;
              return (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phasen-Fortschritt</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      {doneCount}/{phaseData.length} abgeschlossen{inProgressCount > 0 ? ` · ${inProgressCount} in Arbeit` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 3, borderRadius: 8, overflow: 'hidden' }}>
                    {phaseData.map(p => {
                      const bg = p.status === 'done' ? '#16a34a' : p.status === 'in_progress' ? '#eab308' : '#E8E4DE';
                      return (
                        <div key={p.nr} title={`${p.nr} ${p.name} — ${STATUS_CFG[p.status].label}`}
                          style={{ flex: 1, height: 8, background: bg, borderRadius: 2, transition: 'background 0.3s' }} />
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                    {phaseData.map(p => {
                      const cfg = STATUS_CFG[p.status];
                      return (
                        <span key={p.nr} style={{ fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, borderRadius: 5, padding: '2px 7px', whiteSpace: 'nowrap' }}>
                          {p.nr}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Fields grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Betrag', field: 'amount', icon: <FiDollarSign size={14} />, display: formatCurrency(deal.amount ?? 0, deal.currency || 'CHF'), type: 'number' },
                { label: 'Erw. Abschlussdatum', field: 'expectedCloseDate', icon: <FiCalendar size={14} />, display: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString('de-CH') : '—', type: 'date' },
              ].map(item => (
                <div key={item.field} style={{ background: '#FAF9F6', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{item.icon} {item.label}</div>
                  {editingField === item.field ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input type={item.type} value={editVal} onChange={e => setEditVal(e.target.value)} style={{ flex: 1, fontSize: 14, border: '1.5px solid #1a1a1a', borderRadius: 6, padding: '4px 8px' }} autoFocus />
                      <button onClick={() => saveField(item.field, editVal)} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, padding: '0 10px', cursor: 'pointer', fontSize: 12 }}>✓</button>
                      <button onClick={() => setEditingField(null)} style={{ background: '#E8E4DE', border: 'none', borderRadius: 6, padding: '0 8px', cursor: 'pointer', fontSize: 12 }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{item.display}</span>
                      <button onClick={() => { setEditingField(item.field); setEditVal(item.field === 'expectedCloseDate' ? (deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '') : deal[item.field]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 2 }}><FiEdit2 size={13} /></button>
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
              {stages.map((s: any) => {
                const active = s.id === deal.stageId;
                const color = s.isWon ? '#16a34a' : s.isLost ? '#dc2626' : '#1a1a1a';
                return (
                  <button key={s.id} onClick={() => !active && handleStageChange(s.id)} disabled={active || saving}
                    style={{ padding: '7px 14px', borderRadius: 8, border: active ? `2px solid ${color}` : '1.5px solid #e5e7eb', background: active ? `${color}12` : '#FAF9F6', color: active ? color : '#64748b', fontWeight: active ? 700 : 500, fontSize: 12, cursor: active ? 'default' : 'pointer' }}>
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Tabs: Kommentare / Anhänge / Leistungsphasen ─── */}
          <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
              {([
                ['comments', <FiMessageSquare size={14} key="c" />, `Kommentare (${notes.length})`],
                ['attachments', <FiPaperclip size={14} key="a" />, `Anhänge (${attachments.length})`],
                ['phases', <FiTag size={14} key="p" />, `Leistungsphasen (${selectedPhases.length})`],
              ] as [string, any, string][]).map(([tab, icon, label]) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)}
                  style={{ flex: 1, padding: '14px 16px', border: 'none', background: activeTab === tab ? '#fff' : '#FAF9F6', color: activeTab === tab ? '#1a1a1a' : '#64748b', fontWeight: activeTab === tab ? 700 : 500, fontSize: 13, cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid #1a1a1a' : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {icon} {label}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* ── KOMMENTARE TAB ── */}
              {activeTab === 'comments' && (
                <div>
                  <form onSubmit={addNote} style={{ marginBottom: 20 }}>
                    <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Kommentar eingeben..."
                      style={{ width: '100%', minHeight: 80, borderRadius: 9, border: '1.5px solid #e5e7eb', padding: '10px 14px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    <button type="submit" disabled={!noteText.trim() || saving}
                      style={{ marginTop: 8, background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: noteText.trim() ? 'pointer' : 'not-allowed', opacity: noteText.trim() ? 1 : 0.5 }}>
                      Kommentar hinzufügen
                    </button>
                  </form>
                  {notes.length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Noch keine Kommentare.</div>
                  ) : notes.map(n => (
                    <div key={n.id} style={{ background: '#FAF9F6', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a1a1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                          {(n.createdBy?.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{n.createdBy?.name || 'Unbekannt'}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>{new Date(n.createdAt).toLocaleString('de-CH')}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.5 }}>{n.content}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── ANHÄNGE TAB ── */}
              {activeTab === 'attachments' && (
                <div>
                  {/* Drag & Drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files); }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragOver ? '#1a1a1a' : '#d1d5db'}`,
                      borderRadius: 12, padding: '28px 20px', textAlign: 'center',
                      cursor: 'pointer', marginBottom: 20, transition: 'border-color 0.2s',
                      background: dragOver ? '#eff6ff' : '#fafafa',
                    }}
                  >
                    <input ref={fileInputRef} type="file" multiple accept={ALLOWED_EXT.join(',')} style={{ display: 'none' }}
                      onChange={e => { if (e.target.files?.length) { handleFileUpload(e.target.files); e.target.value = ''; } }} />
                    <FiUpload size={24} color={dragOver ? '#1a1a1a' : '#94a3b8'} />
                    <div style={{ fontSize: 14, fontWeight: 600, color: dragOver ? '#1a1a1a' : '#64748b', marginTop: 8 }}>
                      {uploading ? 'Wird hochgeladen…' : 'Dateien hierher ziehen oder klicken'}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                      PDF, DWG, DXF, Bilder, Office · max. 50 MB
                    </div>
                  </div>

                  {attachments.length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Noch keine Anhänge.</div>
                  ) : attachments.map(a => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#FAF9F6', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', marginBottom: 8 }}>
                      <FiPaperclip size={16} color="#64748b" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{a.filename}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                          {a.uploadedBy?.name || '—'} · {new Date(a.createdAt).toLocaleDateString('de-CH')}
                          {a.size ? ` · ${formatSize(a.size)}` : ''}
                        </div>
                      </div>
                      <a href={a.url} target="_blank" rel="noopener noreferrer" download
                        style={{ background: '#eff6ff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#1a1a1a', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <FiDownload size={14} />
                      </a>
                      <button onClick={() => deleteAttachment(a.id)}
                        style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── LEISTUNGSPHASEN TAB ── */}
              {activeTab === 'phases' && (
                <div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                    Relevante SIA-Leistungsphasen für diesen Deal auswählen:
                  </div>
                  {SIA_PHASES.map(group => (
                    <div key={group.group} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                        {group.group}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {group.items.map(item => {
                          const checked = selectedPhases.includes(item.nr);
                          return (
                            <label key={item.nr} style={{
                              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                              borderRadius: 8, cursor: 'pointer', fontSize: 13,
                              border: checked ? '2px solid #7c3aed' : '1.5px solid #e5e7eb',
                              background: checked ? '#f3e8ff' : '#fff',
                              color: checked ? '#7c3aed' : '#374151',
                              fontWeight: checked ? 700 : 500,
                            }}>
                              <input type="checkbox" checked={checked} onChange={() => togglePhase(item.nr)}
                                style={{ accentColor: '#7c3aed', width: 16, height: 16 }} />
                              <span style={{ fontWeight: 800, fontSize: 14 }}>{item.nr}</span>
                              <span>{item.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Phase budget overview */}
                  {/* Phase budget overview — uses deal.phaseBudgets (phase-level) + task actual hours */}
                  {selectedPhases.length > 0 && <PhaseOverview deal={deal} tasks={dealTasks} selectedPhases={selectedPhases} onBudgetSave={async (budgets: any) => {
                    await api.patch(`/deals/${params.id}`, { phaseBudgets: budgets });
                    setDeal((d: any) => ({ ...d, phaseBudgets: budgets }));
                  }} />}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Right sidebar ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Deal-Info</div>
            {[
              { label: 'Erstellt am', value: deal.createdAt ? new Date(deal.createdAt).toLocaleDateString('de-CH') : '—', icon: <FiCalendar size={13} /> },
              { label: 'Zuletzt geändert', value: deal.updatedAt ? new Date(deal.updatedAt).toLocaleDateString('de-CH') : '—', icon: <FiCalendar size={13} /> },
              { label: 'Besitzer', value: deal.owner?.name || deal.ownerUserId || '—', icon: <FiUser size={13} /> },
              { label: 'Erstellt von', value: deal.creator?.name || deal.createdByUserId || '—', icon: <FiUser size={13} /> },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #E8E4DE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>{item.icon} {item.label}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{item.value}</span>
              </div>
            ))}
          </div>

          {deal.account && (
            <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Verknüpftes Konto</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{deal.account.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{deal.account.type}</div>
              <Link href="/accounts" style={{ fontSize: 12, color: '#1a1a1a', textDecoration: 'none', fontWeight: 600 }}>Konto anzeigen →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════ Phase Overview Table ══════════ */
const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Ausstehend',      color: '#64748b', bg: '#E8E4DE' },
  in_progress: { label: 'In Bearbeitung',  color: '#d97706', bg: '#fef3c7' },
  done:        { label: 'Abgeschlossen',   color: '#16a34a', bg: '#dcfce7' },
};

function getPhaseStatus(phaseTasks: any[]): string {
  if (phaseTasks.length === 0) return 'pending';
  const allDone = phaseTasks.every((t: any) => t.status === 'DONE');
  if (allDone) return 'done';
  const hasTime = phaseTasks.some((t: any) => {
    const entries = t.timeEntries || [];
    return entries.reduce((s: number, e: any) => s + (e.durationMinutes || 0), 0) > 0;
  });
  return hasTime || phaseTasks.some((t: any) => t.status === 'IN_PROGRESS') ? 'in_progress' : 'pending';
}

function PhaseOverview({ deal, tasks, selectedPhases, onBudgetSave }: {
  deal: any; tasks: any[]; selectedPhases: number[];
  onBudgetSave: (budgets: any) => Promise<void>;
}) {
  const budgets: Record<string, number> = deal.phaseBudgets && typeof deal.phaseBudgets === 'object' ? deal.phaseBudgets : {};
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingPhase, setSavingPhase] = useState<string | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const selectedSet = new Set(selectedPhases.map(String));

  useEffect(() => {
    const d: Record<string, string> = {};
    for (const code of Object.keys(budgets)) d[code] = String(budgets[code]);
    setDrafts(d);
  }, [deal.phaseBudgets]);

  async function saveBudget(code: string) {
    const val = parseFloat(drafts[code] ?? '');
    const nb = { ...budgets };
    if (isNaN(val) || val <= 0) delete nb[code]; else nb[code] = val;
    setSavingPhase(code);
    await onBudgetSave(nb);
    setSavingPhase(null);
  }

  // Build phase data: group tasks by phase code, collect assignees + hours
  const tasksByPhase: Record<string, any[]> = {};
  tasks.forEach((t: any) => { if (t.phase) { (tasksByPhase[t.phase] ??= []).push(t); } });

  // Build rows from SIA structure (using shared SIA_PHASES_FULL which has code/name/sub)
  type Row = { code: string; name: string; isSub: boolean; isSelected: boolean };
  const rows: Row[] = [];
  SIA_PHASES_FULL.forEach(main => {
    const mainSelected = selectedSet.has(main.code);
    rows.push({ code: main.code, name: main.name, isSub: false, isSelected: mainSelected });
    main.sub.forEach(sub => {
      rows.push({ code: sub.code, name: sub.name, isSub: true, isSelected: mainSelected });
    });
  });

  // Totals
  let totalBudget = 0, totalUsed = 0;

  const thS: React.CSSProperties = { padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e5e7eb', textAlign: 'left', background: '#FAF9F6', whiteSpace: 'nowrap' };
  const tdS: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid #E8E4DE', fontSize: 12 };

  return (
    <div style={{ marginTop: 24, borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 14 }}>Phasen-Übersicht</div>
      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thS}>Phase</th>
              <th style={thS}>Mitarbeiter</th>
              <th style={thS}>Budget (h)</th>
              <th style={thS}>Effektiv (h)</th>
              <th style={thS}>Verbleibend (h)</th>
              <th style={thS}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.filter(r => r.isSelected).map(row => {
              const pt = tasksByPhase[row.code] || [];
              const budget = budgets[row.code] ?? 0;
              const used = pt.reduce((s: number, t: any) => s + (t.timeEntries || []).reduce((ss: number, e: any) => ss + (e.durationMinutes || 0), 0) / 60, 0);
              const remaining = budget > 0 ? budget - used : 0;
              const over = budget > 0 && used > budget;
              const status = getPhaseStatus(pt);
              const sCfg = STATUS_CFG[status];

              totalBudget += budget;
              totalUsed += used;

              // Collect unique assignees
              const assigneeMap: Record<string, string> = {};
              pt.forEach((t: any) => {
                if (t.assignee) assigneeMap[t.assignee.id] = t.assignee.name;
                if (Array.isArray(t.assigneeIds)) t.assigneeIds.forEach((id: string) => { if (!assigneeMap[id]) assigneeMap[id] = id; });
              });
              const assignees = Object.values(assigneeMap);

              const isExpanded = expandedPhase === row.code;

              return (
                <React.Fragment key={row.code}>
                  <tr
                    onClick={() => setExpandedPhase(isExpanded ? null : row.code)}
                    style={{ cursor: 'pointer', background: isExpanded ? '#eff6ff' : row.isSub ? '#fafafa' : '#fff' }}
                  >
                    <td style={{ ...tdS, fontWeight: row.isSub ? 500 : 700, color: '#1e293b', paddingLeft: row.isSub ? 28 : 12 }}>
                      <span style={{ color: '#7c3aed', marginRight: 6 }}>{row.code}</span>
                      {row.name}
                      {pt.length > 0 && <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 6 }}>({pt.length})</span>}
                    </td>
                    <td style={tdS}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {assignees.slice(0, 3).map((n, i) => (
                          <span key={i} style={{ fontSize: 10, background: '#eff6ff', color: '#1a1a1a', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>{n.split(' ')[0]}</span>
                        ))}
                        {assignees.length > 3 && <span style={{ fontSize: 10, color: '#94a3b8' }}>+{assignees.length - 3}</span>}
                        {assignees.length === 0 && <span style={{ color: '#cbd5e1', fontSize: 11 }}>—</span>}
                      </div>
                    </td>
                    <td style={tdS}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input type="number" min="0" step="0.5" value={drafts[row.code] ?? ''} placeholder="—"
                          onChange={e => { e.stopPropagation(); setDrafts(d => ({ ...d, [row.code]: e.target.value })); }}
                          onClick={e => e.stopPropagation()}
                          style={{ width: 50, padding: '2px 4px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 11, textAlign: 'center' }} />
                        <button onClick={e => { e.stopPropagation(); saveBudget(row.code); }}
                          disabled={savingPhase === row.code}
                          style={{ padding: '1px 6px', borderRadius: 3, border: 'none', background: '#1a1a1a', color: '#fff', fontSize: 10, cursor: 'pointer' }}>
                          {savingPhase === row.code ? '…' : '✓'}
                        </button>
                      </div>
                    </td>
                    <td style={{ ...tdS, fontWeight: 600, color: over ? '#dc2626' : '#1e293b' }}>{used.toFixed(1)}</td>
                    <td style={{ ...tdS, fontWeight: 600, color: over ? '#dc2626' : remaining > 0 ? '#16a34a' : '#64748b' }}>
                      {budget > 0 ? remaining.toFixed(1) : '—'}
                      {over && <span style={{ marginLeft: 4, fontSize: 9, fontWeight: 700, color: '#dc2626', background: '#fee2e2', borderRadius: 3, padding: '0px 4px' }}>!</span>}
                    </td>
                    <td style={tdS}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: sCfg.color, background: sCfg.bg, borderRadius: 10, padding: '2px 8px', whiteSpace: 'nowrap' }}>{sCfg.label}</span>
                    </td>
                  </tr>
                  {/* Expanded: show tasks for this phase */}
                  {isExpanded && pt.length > 0 && pt.map((t: any) => {
                    const tUsed = (t.timeEntries || []).reduce((s: number, e: any) => s + (e.durationMinutes || 0), 0) / 60;
                    return (
                      <tr key={t.id} style={{ background: '#f0f7ff' }}>
                        <td style={{ ...tdS, paddingLeft: row.isSub ? 44 : 32, fontSize: 12 }} colSpan={2}>
                          <Link href={`/tasks/${t.id}`} style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 600 }}>{t.title}</Link>
                          <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 8 }}>{t.assignee?.name || ''}</span>
                        </td>
                        <td style={{ ...tdS, fontSize: 11 }}>{t.budgetHours ?? '—'}</td>
                        <td style={{ ...tdS, fontSize: 11, fontWeight: 600 }}>{tUsed.toFixed(1)}</td>
                        <td style={{ ...tdS, fontSize: 11 }}>{t.budgetHours ? (t.budgetHours - tUsed).toFixed(1) : '—'}</td>
                        <td style={tdS}>
                          <span style={{ fontSize: 9, fontWeight: 600, color: STATUS_CFG[t.status === 'DONE' ? 'done' : t.status === 'IN_PROGRESS' ? 'in_progress' : 'pending'].color, background: STATUS_CFG[t.status === 'DONE' ? 'done' : t.status === 'IN_PROGRESS' ? 'in_progress' : 'pending'].bg, borderRadius: 8, padding: '1px 6px' }}>
                            {t.status === 'DONE' ? 'Erledigt' : t.status === 'IN_PROGRESS' ? 'In Arbeit' : 'Offen'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {isExpanded && pt.length === 0 && (
                    <tr style={{ background: '#f0f7ff' }}>
                      <td colSpan={6} style={{ ...tdS, textAlign: 'center', color: '#94a3b8', fontSize: 11, paddingLeft: 32 }}>Keine Tasks für diese Phase</td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {/* Unselected phases greyed out */}
            {rows.filter(r => !r.isSelected && !r.isSub).map(row => (
              <tr key={row.code} style={{ opacity: 0.4 }}>
                <td style={{ ...tdS, color: '#94a3b8', paddingLeft: 12 }}><span style={{ color: '#cbd5e1', marginRight: 6 }}>{row.code}</span>{row.name}</td>
                <td style={tdS}>—</td><td style={tdS}>—</td><td style={tdS}>—</td><td style={tdS}>—</td>
                <td style={tdS}><span style={{ fontSize: 10, color: '#cbd5e1' }}>Nicht ausgewählt</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#FAF9F6', fontWeight: 700 }}>
              <td style={{ ...tdS, fontWeight: 700, color: '#1e293b', borderTop: '2px solid #e5e7eb' }} colSpan={2}>Gesamtsumme</td>
              <td style={{ ...tdS, fontWeight: 700, color: '#1e293b', borderTop: '2px solid #e5e7eb' }}>{totalBudget.toFixed(1)}</td>
              <td style={{ ...tdS, fontWeight: 700, color: totalUsed > totalBudget && totalBudget > 0 ? '#dc2626' : '#1e293b', borderTop: '2px solid #e5e7eb' }}>{totalUsed.toFixed(1)}</td>
              <td style={{ ...tdS, fontWeight: 700, color: totalBudget > 0 && totalUsed > totalBudget ? '#dc2626' : '#16a34a', borderTop: '2px solid #e5e7eb' }}>
                {totalBudget > 0 ? (totalBudget - totalUsed).toFixed(1) : '—'}
              </td>
              <td style={{ ...tdS, borderTop: '2px solid #e5e7eb' }}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
