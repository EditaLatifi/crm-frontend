"use client";
import { useEffect, useState } from 'react';
import { api } from '../../src/api/client';
import { VENDOR_TYPE_LABELS } from '../permits/permitConfig';
import { FiPlus, FiX, FiPhone, FiMail, FiStar } from 'react-icons/fi';

export default function VendorPanel({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const [assigned, setAssigned] = useState<any[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [phase, setPhase] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [a, all] = await Promise.all([
      api.get(`/projects/${projectId}/suppliers`),
      api.get('/accounts?type=SUPPLIER'),
    ]);
    setAssigned(Array.isArray(a) ? a : []);
    setAllSuppliers(Array.isArray(all) ? all : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [projectId]);

  const assignedIds = new Set(assigned.map((a: any) => a.accountId));
  const available = allSuppliers.filter((s: any) => !assignedIds.has(s.id));

  const assign = async () => {
    if (!selectedAccountId) return;
    setSaving(true);
    try {
      await api.post(`/projects/${projectId}/suppliers/${selectedAccountId}`, { phase });
      setShowAdd(false);
      setSelectedAccountId('');
      setPhase('');
      load();
    } finally { setSaving(false); }
  };

  const remove = async (accountId: string) => {
    if (!confirm('Lieferant vom Projekt entfernen?')) return;
    await api.delete(`/projects/${projectId}/suppliers/${accountId}`);
    load();
  };

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Lade...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Lieferanten ({assigned.length})</div>
        {canEdit && (
          <button onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563eb,#6366f1)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            <FiPlus size={14} /> Lieferant zuweisen
          </button>
        )}
      </div>

      {assigned.length === 0 ? (
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '40px 24px', textAlign: 'center', border: '1px dashed #e2e8f0' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏗️</div>
          <div style={{ color: '#64748b', fontSize: 14 }}>Keine Lieferanten zugewiesen</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
          {assigned.map((a: any) => {
            const acc = a.account;
            return (
              <div key={a.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px', position: 'relative' }}>
                {canEdit && (
                  <button onClick={() => remove(acc.id)} style={{ position: 'absolute', top: 10, right: 10, padding: '4px', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>
                    <FiX size={14} />
                  </button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏢</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{acc.name}</div>
                    {acc.vendorType && <div style={{ fontSize: 11, color: '#64748b' }}>{VENDOR_TYPE_LABELS[acc.vendorType] || acc.vendorType}</div>}
                  </div>
                </div>
                {acc.rating && (
                  <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                    {[1,2,3,4,5].map(i => <FiStar key={i} size={12} fill={i <= acc.rating ? '#f59e0b' : 'none'} color={i <= acc.rating ? '#f59e0b' : '#cbd5e1'} />)}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {acc.contactPerson && <div style={{ fontSize: 12, color: '#64748b' }}><span style={{ fontWeight: 600 }}>Kontakt:</span> {acc.contactPerson}</div>}
                  {acc.phone && <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}><FiPhone size={11} /> {acc.phone}</div>}
                  {acc.email && <div style={{ fontSize: 12, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 5 }}><FiMail size={11} /> {acc.email}</div>}
                  {a.phase && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Phase: {a.phase}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Lieferant zuweisen</div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Firma (Lieferant)</label>
                <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }}>
                  <option value="">Lieferant wählen...</option>
                  {available.map((s: any) => <option key={s.id} value={s.id}>{s.name}{s.vendorType ? ` (${VENDOR_TYPE_LABELS[s.vendorType] || s.vendorType})` : ''}</option>)}
                </select>
                {available.length === 0 && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Alle Lieferanten bereits zugewiesen oder noch keine Firmen vom Typ Lieferant erfasst.</p>}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Phase (optional)</label>
                <input value={phase} placeholder="z.B. Ausführungsplanung" onChange={e => setPhase(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
              <button onClick={assign} disabled={saving || !selectedAccountId} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563eb,#6366f1)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: saving || !selectedAccountId ? 0.7 : 1 }}>
                {saving ? 'Zuweisen...' : 'Zuweisen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
