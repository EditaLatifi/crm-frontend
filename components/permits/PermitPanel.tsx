"use client";
import { useEffect, useState } from 'react';
import { api } from '../../src/api/client';
import { PERMIT_STATUS_LABELS, PERMIT_STATUS_COLORS } from './permitConfig';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const STATUSES = ['VORBEREITUNG','EINGEREICHT','IN_PRUEFUNG','NACHFORDERUNG','BEWILLIGT','ABGELEHNT','ZURUECKGEZOGEN'];

function fmt(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function PermitPanel({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const [permits, setPermits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = () => {
    api.get(`/projects/${projectId}/permits`)
      .then(setPermits)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [projectId]);

  const openCreate = () => {
    setForm({ status: 'VORBEREITUNG' });
    setEditItem(null);
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setForm({
      title: p.title, authority: p.authority, referenceNumber: p.referenceNumber,
      status: p.status, submittedAt: p.submittedAt?.slice(0, 10),
      expectedDecisionAt: p.expectedDecisionAt?.slice(0, 10),
      notes: p.notes, historyNote: '',
    });
    setEditItem(p);
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await api.patch(`/permits/${editItem.id}`, form);
      } else {
        await api.post(`/projects/${projectId}/permits`, form);
      }
      setShowForm(false);
      load();
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Baubewilligung löschen?')) return;
    await api.delete(`/permits/${id}`);
    load();
  };

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Lade...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Baubewilligungen ({permits.length})</div>
        {canEdit && (
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            <FiPlus size={14} /> Neue Bewilligung
          </button>
        )}
      </div>

      {permits.length === 0 ? (
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '40px 24px', textAlign: 'center', border: '1px dashed #e2e8f0' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <div style={{ color: '#64748b', fontSize: 14 }}>Noch keine Baubewilligungen erfasst</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {permits.map((p: any) => {
            const color = PERMIT_STATUS_COLORS[p.status] || '#94a3b8';
            const isExpanded = expanded === p.id;
            const isOverdue = p.expectedDecisionAt && new Date(p.expectedDecisionAt) < new Date() && !['BEWILLIGT','ABGELEHNT','ZURUECKGEZOGEN'].includes(p.status);

            return (
              <div key={p.id} style={{ background: '#fff', borderRadius: 12, border: `1px solid #e2e8f0`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : p.id)}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {p.title}
                      {isOverdue && <span style={{ fontSize: 11, background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Überfällig</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{p.authority || 'Keine Behörde'}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: color + '18', color }}>
                    {PERMIT_STATUS_LABELS[p.status]}
                  </span>
                  {canEdit && (
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(p)} style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }}><FiEdit2 size={13} /></button>
                      <button onClick={() => remove(p.id)} style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', color: '#ef4444' }}><FiTrash2 size={13} /></button>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginTop: 14 }}>
                      {p.referenceNumber && <div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Referenznummer</div><div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{p.referenceNumber}</div></div>}
                      <div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Eingereicht</div><div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{fmt(p.submittedAt)}</div></div>
                      <div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Entscheid erwartet</div><div style={{ fontSize: 13, color: isOverdue ? '#dc2626' : '#374151', marginTop: 2, fontWeight: isOverdue ? 600 : 400 }}>{fmt(p.expectedDecisionAt)}</div></div>
                      {p.decidedAt && <div><div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Entschieden am</div><div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{fmt(p.decidedAt)}</div></div>}
                    </div>
                    {p.notes && <div style={{ marginTop: 12, fontSize: 13, color: '#64748b', background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>{p.notes}</div>}
                    {p.history?.length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>Verlauf</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {p.history.map((h: any) => (
                            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
                              <span style={{ color: PERMIT_STATUS_COLORS[h.toStatus], fontWeight: 600 }}>{PERMIT_STATUS_LABELS[h.toStatus]}</span>
                              {h.notes && <span>· {h.notes}</span>}
                              <span style={{ marginLeft: 'auto' }}>{fmt(h.createdAt)} · {h.actor?.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
              {editItem ? 'Baubewilligung bearbeiten' : 'Neue Baubewilligung'}
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Titel *', key: 'title', type: 'text', placeholder: 'z.B. Baubewilligung Neubau EFH' },
                { label: 'Behörde', key: 'authority', type: 'text', placeholder: 'z.B. Gemeinde Zürich' },
                { label: 'Referenznummer', key: 'referenceNumber', type: 'text', placeholder: 'z.B. BG-2024-001' },
                { label: 'Eingereicht am', key: 'submittedAt', type: 'date' },
                { label: 'Entscheid erwartet', key: 'expectedDecisionAt', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} value={form[f.key] || ''} placeholder={f.placeholder || ''} onChange={e => setForm((x: any) => ({ ...x, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Status</label>
                <select value={form.status || 'VORBEREITUNG'} onChange={e => setForm((x: any) => ({ ...x, status: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }}>
                  {STATUSES.map(s => <option key={s} value={s}>{PERMIT_STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              {editItem && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Notiz zur Statusänderung</label>
                  <input value={form.historyNote || ''} onChange={e => setForm((x: any) => ({ ...x, historyNote: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }} />
                </div>
              )}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Notizen</label>
                <textarea value={form.notes || ''} rows={3} onChange={e => setForm((x: any) => ({ ...x, notes: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
              <button onClick={save} disabled={saving || !form.title} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: saving || !form.title ? 0.7 : 1 }}>
                {saving ? 'Speichern...' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
