"use client";
import { useState, useEffect } from 'react';
import { api } from '../../src/api/client';
import {
  FiTag, FiMapPin, FiDollarSign, FiCalendar,
  FiUser, FiFileText, FiAlertCircle,
} from 'react-icons/fi';

const PROJECT_TYPES = [
  { value: 'ARCHITECTURE',            label: '🏛️  Architektur' },
  { value: 'INTERIOR_DESIGN',         label: '🛋️  Innenarchitektur' },
  { value: 'CONSTRUCTION_MANAGEMENT', label: '🏗️  Bauleitung' },
  { value: 'VISUALIZATION',           label: '🎨  Visualisierung' },
  { value: 'REAL_ESTATE',             label: '🏠  Immobilien' },
  { value: 'DIGITIZATION',            label: '💻  Digitalisierung' },
];

const PROJECT_STATUSES = [
  { value: 'ACTIVE',    label: '● Aktiv',           color: '#22c55e' },
  { value: 'ON_HOLD',   label: '● Pausiert',        color: '#f59e0b' },
  { value: 'COMPLETED', label: '● Abgeschlossen',   color: '#6366f1' },
  { value: 'CANCELLED', label: '● Storniert',       color: '#ef4444' },
];

type Props = {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  onCancel?: () => void;
};

export default function ProjectForm({ onSubmit, initialData, onCancel }: Props) {
  const [form, setForm] = useState({
    name:            initialData?.name || '',
    description:     initialData?.description || '',
    type:            initialData?.type || 'ARCHITECTURE',
    status:          initialData?.status || 'ACTIVE',
    address:         initialData?.address || '',
    budget:          initialData?.budget || '',
    budgetHours:     initialData?.budgetHours || '',
    currency:        initialData?.currency || 'CHF',
    startDate:       initialData?.startDate       ? initialData.startDate.slice(0, 10)       : '',
    expectedEndDate: initialData?.expectedEndDate ? initialData.expectedEndDate.slice(0, 10) : '',
    notes:           initialData?.notes || '',
    accountId:       initialData?.accountId || '',
    ownerUserId:     initialData?.ownerUserId || initialData?.owner?.id || '',
  });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [users,    setUsers]    = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    api.get('/accounts').then((d: any) => setAccounts(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/users').then((d: any) => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Projektname ist erforderlich'); return; }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        budget:          form.budget ? Number(form.budget) : undefined,
        budgetHours:     form.budgetHours ? Number(form.budgetHours) : undefined,
        accountId:       form.accountId || undefined,
        ownerUserId:     form.ownerUserId || undefined,
        startDate:       form.startDate || undefined,
        expectedEndDate: form.expectedEndDate || undefined,
      });
    } catch (e: any) {
      setError(e.message || 'Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  /* ── shared styles ─────────────────────────────────────────── */
  const input: React.CSSProperties = {
    width: '100%', padding: '10px 13px',
    borderRadius: 9, border: '1.5px solid #e2e8f0',
    fontSize: 13.5, color: '#1e293b', background: '#fff',
    boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };
  const inputWithIcon: React.CSSProperties = { ...input, paddingLeft: 36 };
  const label: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 700,
    color: '#374151', marginBottom: 6, letterSpacing: '0.01em',
  };
  const sectionTitle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    marginBottom: 14, marginTop: 4,
    display: 'flex', alignItems: 'center', gap: 7,
  };
  const wrap = (icon: React.ReactNode, field: React.ReactNode) => (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}>
        {icon}
      </div>
      {field}
    </div>
  );

  const onFocus  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#3b82f6';
    e.target.style.boxShadow   = '0 0 0 3px rgba(59,130,246,0.10)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.boxShadow   = 'none';
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          background: '#fef2f2', color: '#dc2626', borderRadius: 9,
          padding: '11px 14px', fontSize: 13, marginBottom: 20,
          border: '1px solid #fecaca',
        }}>
          <FiAlertCircle size={15} />
          {error}
        </div>
      )}

      {/* ── Section 1: Grundinfo ──────────────────────────────── */}
      <div style={sectionTitle}>
        <FiTag size={12} />
        Grundinformationen
      </div>

      {/* Name */}
      <div style={{ marginBottom: 14 }}>
        <label style={label}>Projektname <span style={{ color: '#ef4444' }}>*</span></label>
        {wrap(
          <FiTag size={13} />,
          <input
            style={inputWithIcon} value={form.name}
            onChange={e => set('name', e.target.value)}
            onFocus={onFocus} onBlur={onBlur}
            placeholder="z.B. Umbau EFH Zug" required
          />
        )}
      </div>

      {/* Type + Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={label}>Projekttyp</label>
          <select style={input} value={form.type} onChange={e => set('type', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
            {PROJECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Status</label>
          <select style={input} value={form.status} onChange={e => set('status', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
            {PROJECT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 22 }}>
        <label style={label}>Beschreibung</label>
        <textarea
          style={{ ...input, resize: 'vertical', paddingTop: 10, lineHeight: 1.5 }}
          rows={2} value={form.description}
          onChange={e => set('description', e.target.value)}
          onFocus={onFocus} onBlur={onBlur}
          placeholder="Kurze Projektbeschreibung…"
        />
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: 18 }} />

      {/* ── Section 2: Standort & Budget ─────────────────────── */}
      <div style={sectionTitle}>
        <FiMapPin size={12} />
        Standort &amp; Budget
      </div>

      {/* Address */}
      <div style={{ marginBottom: 14 }}>
        <label style={label}>Adresse / Standort</label>
        {wrap(
          <FiMapPin size={13} />,
          <input
            style={inputWithIcon} value={form.address}
            onChange={e => set('address', e.target.value)}
            onFocus={onFocus} onBlur={onBlur}
            placeholder="Musterstrasse 1, 6300 Zug"
          />
        )}
      </div>

      {/* Budget + Currency + Budget Hours */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 22 }}>
        <div>
          <label style={label}>Budget (CHF)</label>
          {wrap(
            <FiDollarSign size={13} />,
            <input
              style={inputWithIcon} type="number" min="0" value={form.budget}
              onChange={e => set('budget', e.target.value)}
              onFocus={onFocus} onBlur={onBlur}
              placeholder="150 000"
            />
          )}
        </div>
        <div>
          <label style={label}>Währung</label>
          <select style={input} value={form.currency} onChange={e => set('currency', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
            <option>CHF</option>
          </select>
        </div>
        <div>
          <label style={label}>Stundenkontingent</label>
          <input
            style={input} type="number" min="0" step="0.5" value={form.budgetHours}
            onChange={e => set('budgetHours', e.target.value)}
            onFocus={onFocus} onBlur={onBlur}
            placeholder="500"
          />
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: 18 }} />

      {/* ── Section 3: Zeitplan ──────────────────────────────── */}
      <div style={sectionTitle}>
        <FiCalendar size={12} />
        Zeitplan
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
        <div>
          <label style={label}>Startdatum</label>
          {wrap(
            <FiCalendar size={13} />,
            <input
              style={inputWithIcon} type="date" value={form.startDate}
              onChange={e => set('startDate', e.target.value)}
              onFocus={onFocus} onBlur={onBlur}
            />
          )}
        </div>
        <div>
          <label style={label}>Voraussichtliches Ende</label>
          {wrap(
            <FiCalendar size={13} />,
            <input
              style={inputWithIcon} type="date" value={form.expectedEndDate}
              onChange={e => set('expectedEndDate', e.target.value)}
              onFocus={onFocus} onBlur={onBlur}
            />
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: 18 }} />

      {/* ── Section 4: Zuweisung ─────────────────────────────── */}
      <div style={sectionTitle}>
        <FiUser size={12} />
        Zuweisung
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
        <div>
          <label style={label}>Kunde / Firma</label>
          <select style={input} value={form.accountId} onChange={e => set('accountId', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
            <option value="">— Kein Kunde —</option>
            {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Verantwortlich</label>
          <select style={input} value={form.ownerUserId} onChange={e => set('ownerUserId', e.target.value)} onFocus={onFocus} onBlur={onBlur}>
            <option value="">— Automatisch (ich) —</option>
            {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #f1f5f9', marginBottom: 18 }} />

      {/* ── Section 5: Notizen ───────────────────────────────── */}
      <div style={sectionTitle}>
        <FiFileText size={12} />
        Interne Notizen
      </div>

      <div style={{ marginBottom: 28 }}>
        <textarea
          style={{ ...input, resize: 'vertical', lineHeight: 1.5 }}
          rows={2} value={form.notes}
          onChange={e => set('notes', e.target.value)}
          onFocus={onFocus} onBlur={onBlur}
          placeholder="Interne Bemerkungen zum Projekt…"
        />
      </div>

      {/* ── Actions ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none',
            background: loading ? '#999' : '#1a1a1a',
            color: '#fff', fontWeight: 600, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {loading
            ? '⏳ Speichern…'
            : initialData ? '✓ Aktualisieren' : '+ Projekt erstellen'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '12px 20px', borderRadius: 10,
              border: '1px solid #E8E4DE', background: '#fff',
              color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#cbd5e1';
              (e.currentTarget as HTMLElement).style.background = '#f8fafc';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
              (e.currentTarget as HTMLElement).style.background = '#fff';
            }}
          >
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}
