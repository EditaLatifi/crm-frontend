"use client";
import { useEffect, useState } from 'react';
import { api } from '../../src/api/client';
import { FiPlus, FiTrash2, FiCopy, FiCheck, FiLink } from 'react-icons/fi';

export default function SharePanel({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const [shares, setShares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = () => {
    api.get(`/projects/${projectId}/shares`)
      .then(setShares)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [projectId]);

  const create = async () => {
    setSaving(true);
    try {
      await api.post(`/projects/${projectId}/shares`, form);
      setShowForm(false);
      setForm({});
      load();
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Share-Link löschen?')) return;
    await api.delete(`/shares/${id}`);
    load();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Lade...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Client Share Links ({shares.length})</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Teile den Projektstatus mit Kunden ohne Login</div>
        </div>
        {canEdit && (
          <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            <FiPlus size={14} /> Link erstellen
          </button>
        )}
      </div>

      {shares.length === 0 ? (
        <div style={{ background: 'linear-gradient(135deg,#f0f9ff,#f5f3ff)', borderRadius: 16, padding: '40px 24px', textAlign: 'center', border: '1px dashed #bfdbfe' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔗</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 6 }}>Noch keine Share-Links</div>
          <div style={{ color: '#64748b', fontSize: 14, maxWidth: 360, margin: '0 auto' }}>
            Erstelle einen Link, den Kunden aufrufen können, um den aktuellen Projektstatus zu sehen — ohne Login oder Konto.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shares.map((s: any) => {
            const expired = s.expiresAt && new Date(s.expiresAt) < new Date();
            const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${s.token}`;
            return (
              <div key={s.id} style={{ background: expired ? '#fef2f2' : '#fff', borderRadius: 12, border: `1px solid ${expired ? '#fecaca' : '#e2e8f0'}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: expired ? '#fee2e2' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiLink size={16} color={expired ? '#ef4444' : '#3b82f6'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: expired ? '#dc2626' : '#0f172a' }}>
                    {s.label || 'Share Link'}{expired ? ' (Abgelaufen)' : ''}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{url}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    Erstellt von {s.creator?.name}
                    {s.expiresAt && ` · Läuft ab: ${new Date(s.expiresAt).toLocaleDateString('de-CH')}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => copyLink(s.token)} title="Link kopieren"
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: copied === s.token ? '#f0fdf4' : '#fff', cursor: 'pointer', color: copied === s.token ? '#22c55e' : '#64748b', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}>
                    {copied === s.token ? <><FiCheck size={13} /> Kopiert</> : <><FiCopy size={13} /> Kopieren</>}
                  </button>
                  {canEdit && (
                    <button onClick={() => remove(s.id)} style={{ padding: '7px 9px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', color: '#ef4444' }}>
                      <FiTrash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Share-Link erstellen</div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Bezeichnung (optional)</label>
                <input value={form.label || ''} placeholder="z.B. Für Bauherrschaft Müller" onChange={e => setForm((x: any) => ({ ...x, label: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Ablaufdatum (optional)</label>
                <input type="date" value={form.expiresAt || ''} onChange={e => setForm((x: any) => ({ ...x, expiresAt: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#374151', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>Abbrechen</button>
              <button onClick={create} disabled={saving} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#1a1a1a', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Erstelle...' : 'Link erstellen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
