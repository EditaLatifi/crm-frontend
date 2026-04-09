"use client";
import React, { useState } from 'react';
import { api } from '../../src/api/client';

type DealFormProps = {
  onSubmit: (data: any) => void;
  initialData?: any;
};

const errStyle: React.CSSProperties = { color: '#dc2626', fontSize: 12, marginTop: 3 };
const inputStyle = (hasErr: boolean): React.CSSProperties => ({
  width: '100%', padding: 8, borderRadius: 4,
  border: `1px solid ${hasErr ? '#dc2626' : '#ccc'}`,
  outline: 'none',
});

export default function DealForm({ onSubmit, initialData }: DealFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [currency, setCurrency] = useState(initialData?.currency || 'CHF');
  const [expectedCloseDate, setExpectedCloseDate] = useState(initialData?.expectedCloseDate ? initialData.expectedCloseDate.slice(0, 10) : '');
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>(
    initialData?.customFields ? Object.entries(initialData.customFields).map(([key, value]) => ({ key, value: String(value) })) : []
  );
  const [accountId, setAccountId] = useState(initialData?.accountId || '');
  const [stageId, setStageId] = useState(initialData?.stageId || '');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    api.get('/accounts')
      .then((data: any) => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => setAccounts([]));
    api.get('/deals/deal-stages')
      .then((data: any) => setStages(Array.isArray(data) ? data : []))
      .catch(() => setStages([]));
  }, []);

  const handleCustomFieldChange = (idx: number, field: 'key' | 'value', val: string) => {
    setCustomFields(fields => fields.map((f, i) => i === idx ? { ...f, [field]: val } : f));
  };
  const handleAddCustomField = () => setCustomFields(fields => [...fields, { key: '', value: '' }]);
  const handleRemoveCustomField = (idx: number) => setCustomFields(fields => fields.filter((_, i) => i !== idx));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name ist erforderlich';
    else if (name.trim().length < 2) e.name = 'Name muss mindestens 2 Zeichen haben';
    if (!accountId) e.accountId = 'Konto ist erforderlich';
    if (!stageId) e.stageId = 'Phase ist erforderlich';
    if (amount === '' || amount === null) e.amount = 'Betrag ist erforderlich';
    else if (isNaN(parseFloat(String(amount))) || parseFloat(String(amount)) < 0) e.amount = 'Betrag muss eine positive Zahl sein';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const customFieldsObj = customFields.reduce((acc, { key, value }) => key ? { ...acc, [key]: value } : acc, {} as Record<string, string>);
      await Promise.resolve(onSubmit({
        name: name.trim(),
        accountId,
        stageId,
        amount: parseFloat(String(amount)),
        currency,
        expectedCloseDate: expectedCloseDate || undefined,
        customFields: customFieldsObj,
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: 16 }}>
        <label>Name *</label><br />
        <input value={name} onChange={e => setName(e.target.value)} style={inputStyle(!!errors.name)} />
        {errors.name && <div style={errStyle}>{errors.name}</div>}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Konto *</label><br />
        <select value={accountId} onChange={e => setAccountId(e.target.value)} style={inputStyle(!!errors.accountId)}>
          <option value="">Konto auswählen</option>
          {accounts.map((a: any) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        {errors.accountId && <div style={errStyle}>{errors.accountId}</div>}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Phase *</label><br />
        <select value={stageId} onChange={e => setStageId(e.target.value)} style={inputStyle(!!errors.stageId)}>
          <option value="">Phase auswählen</option>
          {stages.map((s: any) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {errors.stageId && <div style={errStyle}>{errors.stageId}</div>}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Betrag *</label><br />
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" min={0} value={amount} onChange={e => setAmount(e.target.value)} style={{ ...inputStyle(!!errors.amount), flex: 1 }} />
          <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ ...inputStyle(false), width: 80, flex: 'none' }}>
            <option>CHF</option>
          </select>
        </div>
        {errors.amount && <div style={errStyle}>{errors.amount}</div>}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Erwartetes Enddatum</label><br />
        <input type="date" value={expectedCloseDate} onChange={e => setExpectedCloseDate(e.target.value)} style={inputStyle(false)} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Benutzerdefinierte Felder</label>
        {customFields.map((f, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 4, marginTop: 4 }}>
            <input placeholder="Schlüssel" value={f.key} onChange={e => handleCustomFieldChange(idx, 'key', e.target.value)} style={{ width: 100, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
            <input placeholder="Wert" value={f.value} onChange={e => handleCustomFieldChange(idx, 'value', e.target.value)} style={{ width: 160, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
            <button type="button" onClick={() => handleRemoveCustomField(idx)} style={{ background: '#eee', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>Entfernen</button>
          </div>
        ))}
        <button type="button" onClick={handleAddCustomField} style={{ background: '#FAF9F6', color: '#1a1a1a', border: '1px solid #E8E4DE', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', marginTop: 4, fontSize: 13 }}>+ Feld hinzufügen</button>
      </div>
      <button type="submit" disabled={saving} style={{ background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontSize: 14 }}>
        {saving ? 'Speichern…' : 'Speichern'}
      </button>
    </form>
  );
}
