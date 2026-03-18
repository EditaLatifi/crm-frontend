"use client";
import { useEffect, useState, useCallback } from 'react';
import { api } from '../../../src/api/client';
import { useAuth } from '../../../src/auth/AuthProvider';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';
import { VENDOR_TYPE_LABELS } from '../../../components/permits/permitConfig';
import { FiPlus, FiSearch, FiStar, FiPhone, FiMail, FiEdit2, FiTrash2 } from 'react-icons/fi';
import '../../(app)/projects/projects.css';

const VENDOR_TYPES = ['ARCHITEKT','BAUINGENIEUR','ELEKTRIKER','SANITAER','HEIZUNG_LUEFTUNG','MALER','ZIMMERMANN','DACHDECKER','GARTENBAU','GENERALUNTERNEHMER','SONSTIGES'];

function VendorForm({ initial, onSubmit, onCancel }: { initial?: any; onSubmit: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ type: 'SONSTIGES', ...initial });
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    setSaving(true);
    try { await onSubmit(form); } finally { setSaving(false); }
  };

  const f = (key: string, label: string, type = 'text', placeholder = '') => (
    <div key={key}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
      <input type={type} value={form[key] || ''} placeholder={placeholder} onChange={e => setForm((x: any) => ({ ...x, [key]: e.target.value }))}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Typ</label>
        <select value={form.type} onChange={e => setForm((x: any) => ({ ...x, type: e.target.value }))}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }}>
          {VENDOR_TYPES.map(t => <option key={t} value={t}>{VENDOR_TYPE_LABELS[t]}</option>)}
        </select>
      </div>
      {f('name', 'Firmenname *', 'text', 'z.B. Müller Elektro AG')}
      {f('contactName', 'Ansprechperson')}
      {f('phone', 'Telefon', 'tel', '+41 44 123 45 67')}
      {f('email', 'E-Mail', 'email')}
      {f('address', 'Adresse')}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Bewertung (1–5)</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1,2,3,4,5].map(i => (
            <button key={i} type="button" onClick={() => setForm((x: any) => ({ ...x, rating: i }))}
              style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${form.rating >= i ? '#f59e0b' : '#e2e8f0'}`, background: form.rating >= i ? '#fef3c7' : '#fff', cursor: 'pointer', fontSize: 16 }}>
              ⭐
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Notizen</label>
        <textarea value={form.notes || ''} rows={3} onChange={e => setForm((x: any) => ({ ...x, notes: e.target.value }))}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', resize: 'vertical', boxSizing: 'border-box' }} />
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button onClick={onCancel} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
        <button onClick={handle} disabled={saving || !form.name} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563eb,#6366f1)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: saving || !form.name ? 0.7 : 1 }}>
          {saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </div>
  );
}

function VendorsContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const load = useCallback(() => {
    api.get('/vendors').then((d: any) => setVendors(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = vendors.filter(v => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) &&
        !v.contactName?.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && v.type !== typeFilter) return false;
    return true;
  });

  const handleCreate = async (data: any) => {
    await api.post('/vendors', data);
    setShowForm(false);
    load();
  };

  const handleEdit = async (data: any) => {
    await api.patch(`/vendors/${editItem.id}`, data);
    setEditItem(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Lieferant löschen?')) return;
    await api.delete(`/vendors/${id}`);
    load();
  };

  return (
    <div className="proj-admin-page">
      <div className="proj-admin-header">
        <div>
          <h1 className="proj-page-title">Lieferanten & Subunternehmer</h1>
          <p className="proj-page-subtitle">{vendors.length} Einträge im Verzeichnis</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#2563eb,#6366f1)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          <FiPlus size={15} /> Neuer Eintrag
        </button>
      </div>

      {/* Filters */}
      <div className="proj-admin-filters">
        <div className="proj-filter-search" style={{ flex: 1, minWidth: 0 }}>
          <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Suche nach Name, Kontakt..."
            style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
        </div>
        <select className="proj-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">Alle Typen</option>
          {VENDOR_TYPES.map(t => <option key={t} value={t}>{VENDOR_TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 160, background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px dashed #e2e8f0', padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Keine Einträge gefunden</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
          {filtered.map((v: any) => (
            <div key={v.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#dbeafe,#e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏢</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{v.name}</div>
                    <span style={{ fontSize: 11, background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{VENDOR_TYPE_LABELS[v.type] || v.type}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button onClick={() => setEditItem(v)} style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#64748b' }}><FiEdit2 size={13} /></button>
                  {isAdmin && <button onClick={() => handleDelete(v.id)} style={{ padding: '5px 8px', borderRadius: 7, border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', color: '#ef4444' }}><FiTrash2 size={13} /></button>}
                </div>
              </div>
              {v.rating && (
                <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                  {[1,2,3,4,5].map(i => <FiStar key={i} size={13} fill={i <= v.rating ? '#f59e0b' : 'none'} color={i <= v.rating ? '#f59e0b' : '#cbd5e1'} />)}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {v.contactName && <div style={{ fontSize: 13, color: '#64748b' }}>👤 {v.contactName}</div>}
                {v.phone && <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}><FiPhone size={12} /> {v.phone}</div>}
                {v.email && <a href={`mailto:${v.email}`} style={{ fontSize: 13, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}><FiMail size={12} /> {v.email}</a>}
              </div>
              {v.projects?.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Projekte: {v.projects.length}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Neuer Lieferant</div>
            <div style={{ padding: 24 }}>
              <VendorForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Lieferant bearbeiten</div>
            <div style={{ padding: 24 }}>
              <VendorForm initial={editItem} onSubmit={handleEdit} onCancel={() => setEditItem(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorsPage() {
  return (
    <ProtectedRoute>
      <VendorsContent />
    </ProtectedRoute>
  );
}
