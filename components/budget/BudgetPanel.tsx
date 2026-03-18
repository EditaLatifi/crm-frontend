"use client";
import { useEffect, useState } from 'react';
import { api } from '../../src/api/client';
import { BUDGET_CATEGORY_LABELS } from '../permits/permitConfig';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const CATEGORIES = ['HONORARE','ROHBAU','ELEKTRO','SANITAER','HEIZUNG','FASSADE','DACH','INNENAUSBAU','UMGEBUNG','RESERVE','SONSTIGES'];

function chf(n: number, currency = 'CHF') {
  return n.toLocaleString('de-CH', { style: 'currency', currency, minimumFractionDigits: 0 });
}

export default function BudgetPanel({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [i, s] = await Promise.all([
      api.get(`/projects/${projectId}/budget`),
      api.get(`/projects/${projectId}/budget/summary`),
    ]);
    setItems(i);
    setSummary(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, [projectId]);

  const openCreate = () => { setForm({ category: 'SONSTIGES', estimatedCost: '' }); setEditItem(null); setShowForm(true); };
  const openEdit = (i: any) => {
    setForm({ category: i.category, description: i.description, estimatedCost: i.estimatedCost, actualCost: i.actualCost ?? '', phase: i.phase, notes: i.notes });
    setEditItem(i); setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editItem) await api.patch(`/projects/${projectId}/budget/${editItem.id}`, form);
      else await api.post(`/projects/${projectId}/budget`, form);
      setShowForm(false);
      load();
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Budgetposten löschen?')) return;
    await api.delete(`/projects/${projectId}/budget/${id}`);
    load();
  };

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Lade...</div>;

  const currency = summary?.currency || 'CHF';
  const pct = summary?.totalBudget > 0 ? Math.round((summary.totalActual / summary.totalBudget) * 100) : 0;
  const overBudget = summary?.remaining < 0;

  return (
    <div>
      {/* Summary cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Gesamtbudget', value: chf(summary.totalBudget, currency), color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Geplant', value: chf(summary.totalEstimated, currency), color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Verbraucht', value: chf(summary.totalActual, currency), color: '#ef4444', bg: '#fef2f2' },
            { label: 'Verbleibend', value: chf(summary.remaining, currency), color: overBudget ? '#dc2626' : '#22c55e', bg: overBudget ? '#fef2f2' : '#f0fdf4' },
          ].map(c => (
            <div key={c.label} style={{ background: c.bg, borderRadius: 12, padding: '14px 16px', border: `1px solid ${c.color}22` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Budget bar */}
      {summary?.totalBudget > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
            <span>Budgetausnutzung</span>
            <span style={{ fontWeight: 700, color: overBudget ? '#dc2626' : '#374151' }}>{pct}%</span>
          </div>
          <div style={{ height: 10, background: '#f1f5f9', borderRadius: 99 }}>
            <div style={{ height: '100%', borderRadius: 99, background: overBudget ? '#ef4444' : pct > 80 ? '#f59e0b' : '#22c55e', width: `${Math.min(pct, 100)}%`, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Budgetposten ({items.length})</div>
        {canEdit && (
          <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563eb,#6366f1)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            <FiPlus size={14} /> Posten hinzufügen
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '40px 24px', textAlign: 'center', border: '1px dashed #e2e8f0' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
          <div style={{ color: '#64748b', fontSize: 14 }}>Noch keine Budgetposten erfasst</div>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                {['Kategorie','Beschreibung','Geplant','Effektiv','Phase'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700, color: '#64748b', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
                {canEdit && <th style={{ padding: '10px 14px' }} />}
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontSize: 13 }}>
                    <span style={{ background: '#f1f5f9', color: '#374151', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                      {BUDGET_CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151', maxWidth: 200 }}>{item.description}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{chf(item.estimatedCost, currency)}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', color: item.actualCost > item.estimatedCost ? '#dc2626' : '#22c55e' }}>
                    {item.actualCost != null ? chf(item.actualCost, currency) : <span style={{ color: '#94a3b8' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748b' }}>{item.phase || '—'}</td>
                  {canEdit && (
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(item)} style={{ padding: '4px 7px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }}><FiEdit2 size={12} /></button>
                        <button onClick={() => remove(item.id)} style={{ padding: '4px 7px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', color: '#ef4444' }}><FiTrash2 size={12} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 16, color: '#0f172a' }}>
              {editItem ? 'Budgetposten bearbeiten' : 'Neuer Budgetposten'}
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Kategorie</label>
                <select value={form.category || 'SONSTIGES'} onChange={e => setForm((x: any) => ({ ...x, category: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{BUDGET_CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              {[
                { label: 'Beschreibung *', key: 'description', type: 'text' },
                { label: 'Geplante Kosten (CHF)', key: 'estimatedCost', type: 'number' },
                { label: 'Effektive Kosten (CHF)', key: 'actualCost', type: 'number' },
                { label: 'Phase', key: 'phase', type: 'text', placeholder: 'z.B. Vorprojekt' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} value={form[f.key] ?? ''} placeholder={f.placeholder || ''} onChange={e => setForm((x: any) => ({ ...x, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
              <button onClick={save} disabled={saving || !form.description} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563eb,#6366f1)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: saving || !form.description ? 0.7 : 1 }}>
                {saving ? 'Speichern...' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
