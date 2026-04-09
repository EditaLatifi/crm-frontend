
"use client";
import { useEffect, useState } from 'react';
import { api } from '../../src/api/client';
import { useAuth } from '../../src/auth/AuthProvider';
import { formatCHF, formatCurrency } from '../../src/lib/formatCurrency';
import DealForm from '../forms/DealForm';
import './deals-table-desktop.css';

export default function DealsTable() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDeal, setEditDeal] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchDeals = () => {
    setLoading(true);
    api.get('/deals')
      .then(data => {
        setDeals(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => { setDeals([]); setLoading(false); });
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Diesen Deal wirklich löschen?')) return;
    await api.delete(`/deals/${id}`);
    fetchDeals();
  };

  const handleEdit = (deal: any) => {
    setEditDeal(deal);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (data: any) => {
    await api.patch(`/deals/${editDeal.id}`, data);
    setShowEditModal(false);
    setEditDeal(null);
    fetchDeals();
  };

  if (loading) return <div>Lade Deals...</div>;

  return (
    <div className="deals-table-container">
      <table className="deals-table">
        <thead>
          <tr style={{ background: '#f4f5f7', borderBottom: '1px solid #e0e0e0' }}>
            <th style={{ fontWeight: 600, color: '#222', fontSize: 15, padding: '12px 8px', border: 'none', textAlign: 'left' }}>Name</th>
            <th style={{ fontWeight: 600, color: '#222', fontSize: 15, padding: '12px 8px', border: 'none', textAlign: 'left' }}>Konto</th>
            <th style={{ fontWeight: 600, color: '#222', fontSize: 15, padding: '12px 8px', border: 'none', textAlign: 'left' }}>Phase</th>
            <th style={{ fontWeight: 600, color: '#222', fontSize: 15, padding: '12px 8px', border: 'none', textAlign: 'left' }}>Betrag</th>
            <th style={{ fontWeight: 600, color: '#222', fontSize: 15, padding: '12px 8px', border: 'none', textAlign: 'left' }}>Besitzer</th>
            <th style={{ fontWeight: 600, color: '#222', fontSize: 15, padding: '12px 8px', border: 'none', textAlign: 'left' }}>Erwartetes Enddatum</th>
            <th style={{ fontWeight: 600, color: '#222', fontSize: 15, padding: '12px 8px', border: 'none', textAlign: 'left' }}>SIA-Phasen</th>
            <th style={{ fontWeight: 600, color: '#222', fontSize: 15, padding: '12px 8px', border: 'none', textAlign: 'left' }}>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {deals.length === 0 && (
            <tr>
              <td colSpan={6} style={{ color: '#bbb', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>Keine Deals vorhanden.</td>
            </tr>
          )}
          {deals.map((d: any) => (
            <tr key={d.id} style={{ borderBottom: '1px solid #e0e0e0', background: '#fff' }}>
              <td style={{ padding: '10px 8px', border: 'none', color: '#23272f', fontWeight: 500 }} data-label="Name">{d.name}</td>
              <td style={{ padding: '10px 8px', border: 'none', color: '#444' }} data-label="Account">{d.account?.name || d.accountId}</td>
              <td style={{ padding: '10px 8px', border: 'none', color: '#444' }} data-label="Stage">{d.stage?.name || d.stageId}</td>
              <td style={{ padding: '10px 8px', border: 'none', color: '#444' }} data-label="Amount">{formatCurrency(d.amount ?? 0, d.currency || 'CHF')}</td>
              <td style={{ padding: '10px 8px', border: 'none', color: '#888', fontSize: 14 }} data-label="Owner">{d.owner?.name || d.ownerUserId}</td>
              <td style={{ padding: '10px 8px', border: 'none', color: '#888', fontSize: 14 }} data-label="Expected Close">{d.expectedCloseDate ? new Date(d.expectedCloseDate).toLocaleDateString('de-CH') : ''}</td>
              <td style={{ padding: '10px 8px', border: 'none' }} data-label="Phasen">
                {Array.isArray((d as any).phases) && (d as any).phases.length > 0 ? (
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {(d as any).phases.map((nr: number) => (
                      <span key={nr} style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', borderRadius: 4, padding: '1px 5px' }}>{nr}</span>
                    ))}
                  </div>
                ) : <span style={{ color: '#ccc' }}>—</span>}
              </td>
              <td style={{ padding: '10px 8px', border: 'none' }} data-label="Actions">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => handleEdit(d)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#666', padding: 4,
                    }}
                    title="Bearbeiten"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(d.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#dc2626', padding: 4,
                      }}
                      title="Löschen"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  )}
                </div>
                {d.customFields && Object.keys(d.customFields).length > 0 && (
                  <div style={{ marginTop: 4, fontSize: 12, color: '#888' }}>
                    {Object.entries(d.customFields).map(([k, v]) => (
                      <div key={k}><b>{k}:</b> {String(v)}</div>
                    ))}
                  </div>
                )}
                {/* Debug JSON output removed */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 320 }}>
            <h3>Deal bearbeiten</h3>
            <DealForm onSubmit={handleEditSubmit} initialData={editDeal} />
            <button onClick={() => setShowEditModal(false)} style={{ marginTop: 12, background: '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>Abbrechen</button>
          </div>
        </div>
      )}
    </div>
  );
}
