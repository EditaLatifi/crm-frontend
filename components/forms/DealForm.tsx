"use client";
import React, { useState } from 'react';

type DealFormProps = {
  onSubmit: (data: any) => void;
  initialData?: any;
};

export default function DealForm({ onSubmit, initialData }: DealFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [currency, setCurrency] = useState(initialData?.currency || 'EUR');
  const [expectedCloseDate, setExpectedCloseDate] = useState(initialData?.expectedCloseDate ? initialData.expectedCloseDate.slice(0, 10) : '');
  const [probability, setProbability] = useState(initialData?.probability || 0);
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>(
    initialData?.customFields ? Object.entries(initialData.customFields).map(([key, value]) => ({ key, value: String(value) })) : []
  );
  const [accountId, setAccountId] = useState(initialData?.accountId || '');
  const [stageId, setStageId] = useState(initialData?.stageId || '');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/accounts`)
      .then(res => res.json())
      .then(data => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => setAccounts([]));
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/deals/deal-stages`)
      .then(res => res.json())
      .then(data => setStages(Array.isArray(data) ? data : []))
      .catch(() => setStages([]));
  }, []);

  const handleCustomFieldChange = (idx: number, field: 'key' | 'value', val: string) => {
    setCustomFields(fields => fields.map((f, i) => i === idx ? { ...f, [field]: val } : f));
  };
  const handleAddCustomField = () => setCustomFields(fields => [...fields, { key: '', value: '' }]);
  const handleRemoveCustomField = (idx: number) => setCustomFields(fields => fields.filter((_, i) => i !== idx));

  // Optionally add more fields: accountId, stageId, probability, etc.

  return (
    <form onSubmit={e => {
      e.preventDefault();
      const customFieldsObj = customFields.reduce((acc, { key, value }) => key ? { ...acc, [key]: value } : acc, {} as Record<string, string>);
      onSubmit({
        name,
        accountId,
        stageId,
        amount: parseFloat(amount),
        currency,
        expectedCloseDate,
        probability: parseInt(probability),
        customFields: customFieldsObj
      });
    }}>
                  <div style={{ marginBottom: 16 }}>
                          <div style={{ marginBottom: 16 }}>
                            <label>Konto</label><br />
                            <select value={accountId} onChange={e => setAccountId(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                              <option value="">Konto auswählen</option>
                              {accounts.map((a: any) => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ marginBottom: 16 }}>
                            <label>Phase</label><br />
                            <select value={stageId} onChange={e => setStageId(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                              <option value="">Phase auswählen</option>
                              {stages.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                    <label>Benutzerdefinierte Felder</label>
                    {customFields.map((f, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                        <input placeholder="Schlüssel" value={f.key} onChange={e => handleCustomFieldChange(idx, 'key', e.target.value)} style={{ width: 100, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                        <input placeholder="Wert" value={f.value} onChange={e => handleCustomFieldChange(idx, 'value', e.target.value)} style={{ width: 160, padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                        <button type="button" onClick={() => handleRemoveCustomField(idx)} style={{ background: '#eee', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>Entfernen</button>
                      </div>
                    ))}
                    <button type="button" onClick={handleAddCustomField} style={{ background: '#f4f5f7', color: '#0052cc', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', marginTop: 4 }}>+ Feld hinzufügen</button>
                  </div>
            <div style={{ marginBottom: 16 }}>
              <label>Wahrscheinlichkeit (%)</label><br />
              <input type="number" min={0} max={100} value={probability} onChange={e => setProbability(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
            </div>
      <div style={{ marginBottom: 16 }}>
        <label>Name</label><br />
        <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Betrag</label><br />
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Währung</label><br />
        <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
          <option value="EUR">EUR</option>
          <option value="CHF">CHF</option>
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label>Erwartets Enddatum</label><br />
        <input type="date" value={expectedCloseDate} onChange={e => setExpectedCloseDate(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
      </div>
      <button type="submit" style={{ background: '#0052cc', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>
        Speichere
      </button>
    </form>
  );
}
