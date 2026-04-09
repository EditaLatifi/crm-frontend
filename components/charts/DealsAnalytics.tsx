"use client";
import { useEffect, useState } from "react";
import { api } from '../../src/api/client';
import { formatCHF } from '../../src/lib/formatCurrency';

export default function DealsAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/deals/analytics')
      .then((data: any) => { setAnalytics(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#999', fontSize: 13 }}>Lade Analysedaten...</div>;
  if (!analytics) return <div style={{ color: '#999', fontSize: 13 }}>Keine Analysedaten.</div>;

  const stats = [
    { label: 'Gesamtdeals', value: analytics.total, color: '#1a1a1a' },
    { label: 'Gewonnen', value: analytics.won, color: '#16a34a' },
    { label: 'Verloren', value: analytics.lost, color: '#dc2626' },
    { label: 'Gewinnrate', value: `${analytics.winRate}%`, color: '#16a34a' },
    { label: 'Verlustquote', value: `${analytics.lossRate}%`, color: '#dc2626' },
    { label: 'Avg. Dealgröße', value: formatCHF(analytics.avgDealSize ?? 0), color: '#1a1a1a' },
    { label: 'Konversion', value: `${analytics.conversionRate}%`, color: '#e8a838' },
  ];

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px' }}>Deals-Analyse</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#FAF9F6', borderRadius: 10, border: '1px solid #E8E4DE', padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
