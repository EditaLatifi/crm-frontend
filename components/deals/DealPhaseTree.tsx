"use client";
import { useEffect, useState } from 'react';
import { api } from '../../src/api/client';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiCheck, FiDollarSign, FiCalendar, FiUser } from 'react-icons/fi';

type Payment = {
  id: string;
  label: string;
  amount?: number | null;
  percentage?: number | null;
  dueDate?: string | null;
  reminderSent?: boolean;
};

type Phase = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  order: number;
  parentId: string | null;
  hourBudget?: number | null;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  dueDate?: string | null;
  notes?: string | null;
  responsibleUserId?: string | null;
  responsible?: { id: string; name: string } | null;
  payments: Payment[];
  children?: Phase[];
};

const PHASE_STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:     { label: 'Ausstehend',     bg: '#f1f5f9', color: '#475569' },
  IN_PROGRESS: { label: 'In Bearbeitung', bg: '#dbeafe', color: '#1d4ed8' },
  COMPLETED:   { label: 'Abgeschlossen',  bg: '#dcfce7', color: '#15803d' },
  ON_HOLD:     { label: 'Pausiert',       bg: '#fef3c7', color: '#b45309' },
};

export default function DealPhaseTree({ dealId, currency, canViewPayments = true }: { dealId: string; currency: string; canViewPayments?: boolean }) {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingTopLevel, setAddingTopLevel] = useState(false);
  const [topLevelName, setTopLevelName] = useState('');
  const [topLevelCode, setTopLevelCode] = useState('');

  const reload = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/deals/${dealId}/phases`);
      setPhases(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, [dealId]);

  const addTopLevel = async () => {
    if (!topLevelName.trim()) return;
    await api.post(`/deals/${dealId}/phases`, { name: topLevelName.trim(), code: topLevelCode.trim() });
    setTopLevelName(''); setTopLevelCode(''); setAddingTopLevel(false);
    reload();
  };

  return (
    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
          Leistungsphasen mit Sub-Phasen & Zahlungsplan
        </div>
        {!addingTopLevel && (
          <button onClick={() => setAddingTopLevel(true)}
            style={btnPrimary}>
            <FiPlus size={13} /> Phase hinzufügen
          </button>
        )}
      </div>

      {addingTopLevel && (
        <div style={cardBox}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input placeholder="Code (z.B. 31)" value={topLevelCode} onChange={e => setTopLevelCode(e.target.value)} style={{ ...inputS, width: 120 }} />
            <input placeholder="Name (z.B. Vorprojekt)" value={topLevelName} onChange={e => setTopLevelName(e.target.value)} style={{ ...inputS, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addTopLevel} style={btnPrimary}><FiCheck size={13} /> Speichern</button>
            <button onClick={() => { setAddingTopLevel(false); setTopLevelName(''); setTopLevelCode(''); }} style={btnSecondary}><FiX size={13} /> Abbrechen</button>
          </div>
        </div>
      )}

      {loading && <div style={{ fontSize: 12, color: '#94a3b8' }}>Wird geladen…</div>}
      {!loading && phases.length === 0 && !addingTopLevel && (
        <div style={{ fontSize: 12, color: '#94a3b8', padding: '20px 0', textAlign: 'center' }}>
          Noch keine Leistungsphasen erfasst.
        </div>
      )}

      {phases.map(p => (
        <PhaseRow key={p.id} phase={p} currency={currency} onChange={reload} canViewPayments={canViewPayments} />
      ))}
    </div>
  );
}

function PhaseRow({ phase, currency, onChange, canViewPayments }: { phase: Phase; currency: string; onChange: () => void; canViewPayments: boolean }) {
  const [addingSub, setAddingSub] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [editing, setEditing] = useState(false);
  const statusCfg = PHASE_STATUS_LABELS[phase.status || 'PENDING'];

  return (
    <div style={{ ...cardBox, padding: 0, marginBottom: 12 }}>
      <div style={{ padding: '12px 14px', borderBottom: phase.children?.length || showPayments || editing ? '1px solid #f1f5f9' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flexWrap: 'wrap' }}>
            {phase.code && <span style={codeBadge}>{phase.code}</span>}
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{phase.name}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: statusCfg.bg, color: statusCfg.color }}>
              {statusCfg.label}
            </span>
            {phase.dueDate && (
              <span style={{ fontSize: 11, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <FiCalendar size={11} /> {new Date(phase.dueDate).toLocaleDateString('de-CH')}
              </span>
            )}
            {phase.responsible && (
              <span style={{ fontSize: 11, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <FiUser size={11} /> {phase.responsible.name}
              </span>
            )}
            {phase.hourBudget != null && (
              <span style={{ fontSize: 11, color: '#94a3b8' }}>· {phase.hourBudget}h</span>
            )}
            {(phase as any).budgetChf != null && (
              <span style={{ fontSize: 11, color: '#94a3b8' }}>· {Number((phase as any).budgetChf).toLocaleString('de-CH')} CHF</span>
            )}
            {(phase as any).offeredHours != null && (
              <span style={{ fontSize: 11, color: '#94a3b8' }}>· {(phase as any).offeredHours}h offeriert</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button title="Bearbeiten" onClick={() => setEditing(v => !v)} style={{ ...btnIcon, color: editing ? '#3b82f6' : '#64748b' }}><FiEdit2 size={13} /></button>
            <button title="Sub-Phase hinzufügen" onClick={() => setAddingSub(v => !v)} style={btnIcon}><FiPlus size={13} /></button>
            {canViewPayments && (
              <button title="Zahlungsplan" onClick={() => setShowPayments(v => !v)} style={{ ...btnIcon, color: showPayments ? '#7c3aed' : '#64748b' }}>
                <FiDollarSign size={13} />
              </button>
            )}
            <button title="Löschen" onClick={async () => {
              if (!confirm(`Phase "${phase.name}" löschen?`)) return;
              await api.delete(`/deals/phases/${phase.id}`);
              onChange();
            }} style={{ ...btnIcon, color: '#dc2626' }}><FiTrash2 size={13} /></button>
          </div>
        </div>
        {phase.notes && !editing && (
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8, fontStyle: 'italic', paddingLeft: phase.code ? 50 : 0 }}>
            {phase.notes}
          </div>
        )}
      </div>

      {editing && (
        <PhaseEditForm phase={phase} onDone={() => { setEditing(false); onChange(); }} onCancel={() => setEditing(false)} />
      )}

      {addingSub && (
        <SubPhaseAddForm parentId={phase.id} parentCode={phase.code} onDone={() => { setAddingSub(false); onChange(); }} onCancel={() => setAddingSub(false)} />
      )}

      {phase.children && phase.children.length > 0 && (
        <div style={{ padding: '6px 14px 12px 30px' }}>
          {phase.children.map(c => {
            const csCfg = PHASE_STATUS_LABELS[c.status || 'PENDING'];
            return (
              <SubPhaseRow key={c.id} phase={c} statusCfg={csCfg} onChange={onChange} />
            );
          })}
        </div>
      )}

      {showPayments && canViewPayments && (
        <PaymentList phaseId={phase.id} payments={phase.payments || []} currency={currency} onChange={onChange} />
      )}
    </div>
  );
}

function SubPhaseRow({ phase, statusCfg, onChange }: { phase: Phase; statusCfg: { label: string; bg: string; color: string }; onChange: () => void }) {
  const [editing, setEditing] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {phase.code && <span style={subCodeBadge}>{phase.code}</span>}
          <span style={{ fontSize: 13, color: '#475569' }}>{phase.name}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 4, background: statusCfg.bg, color: statusCfg.color }}>
            {statusCfg.label}
          </span>
          {phase.dueDate && (
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <FiCalendar size={10} /> {new Date(phase.dueDate).toLocaleDateString('de-CH')}
            </span>
          )}
          {phase.responsible && (
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <FiUser size={10} /> {phase.responsible.name}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button title="Bearbeiten" onClick={() => setEditing(v => !v)} style={{ ...btnIcon, padding: 4 }}><FiEdit2 size={11} /></button>
          <button title="Löschen" onClick={async () => {
            if (!confirm(`Sub-Phase "${phase.name}" löschen?`)) return;
            await api.delete(`/deals/phases/${phase.id}`);
            onChange();
          }} style={{ ...btnIcon, color: '#dc2626', padding: 4 }}><FiTrash2 size={11} /></button>
        </div>
      </div>
      {phase.description && !editing && (
        <div style={{ fontSize: 12, color: '#94a3b8', paddingLeft: 16, paddingBottom: 6 }}>{phase.description}</div>
      )}
      {editing && (
        <PhaseEditForm phase={phase} onDone={() => { setEditing(false); onChange(); }} onCancel={() => setEditing(false)} />
      )}
    </div>
  );
}

function PhaseEditForm({ phase, onDone, onCancel }: { phase: Phase; onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState(phase.name);
  const [description, setDescription] = useState(phase.description || '');
  const [status, setStatus] = useState<string>(phase.status || 'PENDING');
  const [dueDate, setDueDate] = useState(phase.dueDate ? phase.dueDate.slice(0, 10) : '');
  const [responsibleUserId, setResponsibleUserId] = useState(phase.responsibleUserId || '');
  const [notes, setNotes] = useState(phase.notes || '');
  const [hourBudget, setHourBudget] = useState<string>(phase.hourBudget != null ? String(phase.hourBudget) : '');
  const [budgetChf, setBudgetChf] = useState<string>((phase as any).budgetChf != null ? String((phase as any).budgetChf) : '');
  const [offeredHours, setOfferedHours] = useState<string>((phase as any).offeredHours != null ? String((phase as any).offeredHours) : '');
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users').then((d: any) => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const submit = async () => {
    setSaving(true);
    try {
      await api.patch(`/deals/phases/${phase.id}`, {
        name, description, status, dueDate: dueDate || null,
        responsibleUserId: responsibleUserId || null, notes,
        hourBudget: hourBudget ? Number(hourBudget) : null,
        budgetChf: budgetChf ? Number(budgetChf) : null,
        offeredHours: offeredHours ? Number(offeredHours) : null,
      });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '12px 14px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={inputS} />
      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Beschreibung" style={inputS} />
      <div style={{ display: 'flex', gap: 6 }}>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inputS, flex: 1 }}>
          <option value="PENDING">Ausstehend</option>
          <option value="IN_PROGRESS">In Bearbeitung</option>
          <option value="COMPLETED">Abgeschlossen</option>
          <option value="ON_HOLD">Pausiert</option>
        </select>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ ...inputS, flex: 1 }} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input type="number" min="0" step="0.5" value={hourBudget} onChange={e => setHourBudget(e.target.value)} placeholder="Stundenkontingent (h)" style={{ ...inputS, flex: 1 }} />
        <input type="number" min="0" step="100" value={budgetChf} onChange={e => setBudgetChf(e.target.value)} placeholder="Budget (CHF)" style={{ ...inputS, flex: 1 }} />
        <input type="number" min="0" step="0.5" value={offeredHours} onChange={e => setOfferedHours(e.target.value)} placeholder="Offerierte Std." style={{ ...inputS, flex: 1 }} />
      </div>
      <select value={responsibleUserId} onChange={e => setResponsibleUserId(e.target.value)} style={inputS}>
        <option value="">— Verantwortlich (optional) —</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notizen" rows={2} style={{ ...inputS, resize: 'vertical' }} />
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={submit} disabled={saving} style={btnPrimary}><FiCheck size={12} /> {saving ? 'Speichern…' : 'Speichern'}</button>
        <button onClick={onCancel} style={btnSecondary}><FiX size={12} /> Abbrechen</button>
      </div>
    </div>
  );
}

function SubPhaseAddForm({ parentId, parentCode, onDone, onCancel }: { parentId: string; parentCode?: string; onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [responsibleUserId, setResponsibleUserId] = useState('');
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);

  const dealId = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).pop() || '' : '';

  useEffect(() => {
    api.get('/users').then((d: any) => setUsers(Array.isArray(d) ? d : [])).catch(() => {});
    if (!parentCode) return;
    api.get(`/deals/sub-phase-templates?parentCode=${encodeURIComponent(parentCode)}`)
      .then((d: any) => {
        const seen = new Set<string>();
        const uniq = (Array.isArray(d) ? d : []).filter((t: any) => {
          const key = (t.name || '').trim().toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setSuggestions(uniq.slice(0, 6));
      })
      .catch(() => setSuggestions([]));
  }, [parentCode]);

  const submit = async (overrideName?: string) => {
    const finalName = (overrideName ?? name).trim();
    if (!finalName) return;
    setSaving(true);
    try {
      await api.post(`/deals/${dealId}/phases`, {
        parentId, name: finalName, code: code.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        responsibleUserId: responsibleUserId || undefined,
      });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '10px 14px 12px 30px', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
      {suggestions.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Vorschläge aus früheren Deals
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {suggestions.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => submit(s.name)}
                disabled={saving}
                style={{
                  fontSize: 11, padding: '3px 9px', borderRadius: 12,
                  border: '1px solid #e5e7eb', background: '#fff', color: '#475569',
                  cursor: 'pointer', fontWeight: 500,
                }}
                title={`Aus Vorlage übernehmen: ${s.name}`}
              >
                + {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <input placeholder="Code" value={code} onChange={e => setCode(e.target.value)} style={{ ...inputS, width: 100 }} />
        <input placeholder="Sub-Phase Name" value={name} onChange={e => setName(e.target.value)} style={{ ...inputS, flex: 1 }} autoFocus />
      </div>
      <input placeholder="Beschreibung (optional)" value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputS, marginBottom: 6 }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ ...inputS, flex: 1 }} />
        <select value={responsibleUserId} onChange={e => setResponsibleUserId(e.target.value)} style={{ ...inputS, flex: 1 }}>
          <option value="">— Verantwortlich —</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => submit()} disabled={saving} style={btnPrimary}><FiCheck size={12} /> {saving ? 'Speichern…' : 'Speichern'}</button>
        <button onClick={onCancel} style={btnSecondary}><FiX size={12} /> Abbrechen</button>
      </div>
    </div>
  );
}

function PaymentList({ phaseId, payments, currency, onChange }: { phaseId: string; payments: Payment[]; currency: string; onChange: () => void }) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState('');
  const [dueDate, setDueDate] = useState('');

  const submit = async () => {
    if (!label.trim()) return;
    const pctNum = percentage ? Number(percentage) : null;
    if (pctNum !== null && (pctNum < 0 || pctNum > 100)) {
      alert('Prozentsatz muss zwischen 0 und 100 liegen.');
      return;
    }
    const amtNum = amount ? Number(amount) : null;
    if (amtNum !== null && amtNum < 0) {
      alert('Betrag darf nicht negativ sein.');
      return;
    }
    await api.post(`/deals/phases/${phaseId}/payments`, {
      label: label.trim(),
      amount: amtNum,
      percentage: pctNum,
      dueDate: dueDate || null,
    });
    setLabel(''); setAmount(''); setPercentage(''); setDueDate('');
    setAdding(false);
    onChange();
  };

  return (
    <div style={{ padding: '12px 14px', background: '#fafafa' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zahlungsplan</div>
        {!adding && <button onClick={() => setAdding(true)} style={btnPrimarySm}><FiPlus size={11} /> Zahlung</button>}
      </div>

      {payments.length === 0 && !adding && (
        <div style={{ fontSize: 12, color: '#94a3b8', padding: '6px 0' }}>Noch keine Zahlungen erfasst.</div>
      )}

      {payments.map(p => (
        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{p.label}</span>
            {p.amount != null && <span style={{ color: '#475569' }}>{p.amount} {currency}</span>}
            {p.percentage != null && <span style={{ color: '#475569' }}>{p.percentage}%</span>}
            {p.dueDate && (
              <span style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <FiCalendar size={11} /> {new Date(p.dueDate).toLocaleDateString('de-CH')}
              </span>
            )}
            {p.reminderSent && <span style={{ fontSize: 10, color: '#16a34a' }}>✓ Reminder gesendet</span>}
          </div>
          <button title="Löschen" onClick={async () => {
            if (!confirm('Zahlung löschen?')) return;
            await api.delete(`/deals/payments/${p.id}`);
            onChange();
          }} style={{ ...btnIcon, color: '#dc2626' }}><FiTrash2 size={11} /></button>
        </div>
      ))}

      {adding && (
        <div style={{ marginTop: 10, padding: 10, background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          <input placeholder="Label (z.B. 1. Zahlung)" value={label} onChange={e => setLabel(e.target.value)} style={{ ...inputS, marginBottom: 6 }} autoFocus />
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input placeholder={`Betrag (${currency})`} type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ ...inputS, flex: 1 }} />
            <input placeholder="%" type="number" value={percentage} onChange={e => setPercentage(e.target.value)} style={{ ...inputS, width: 80 }} />
          </div>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ ...inputS, marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={submit} style={btnPrimary}><FiCheck size={12} /> Speichern</button>
            <button onClick={() => setAdding(false)} style={btnSecondary}><FiX size={12} /> Abbrechen</button>
          </div>
        </div>
      )}
    </div>
  );
}

const inputS: React.CSSProperties = {
  padding: '7px 10px', borderRadius: 7, border: '1px solid #e5e7eb', fontSize: 13, background: '#fff', color: '#1e293b', outline: 'none',
};
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
};
const btnPrimarySm: React.CSSProperties = { ...btnPrimary, padding: '4px 9px', fontSize: 11 };
const btnSecondary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: '#fff', color: '#64748b', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
};
const btnIcon: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 6, background: 'transparent', color: '#64748b', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer',
};
const cardBox: React.CSSProperties = {
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', marginBottom: 12,
};
const codeBadge: React.CSSProperties = {
  display: 'inline-block', padding: '2px 8px', background: '#1a1a1a', color: '#fff', fontSize: 11, fontWeight: 800, borderRadius: 5,
};
const subCodeBadge: React.CSSProperties = {
  display: 'inline-block', padding: '1px 6px', background: '#e5e7eb', color: '#475569', fontSize: 10, fontWeight: 700, borderRadius: 4,
};
