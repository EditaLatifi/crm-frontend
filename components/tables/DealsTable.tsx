
"use client";
import { useEffect, useState } from 'react';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
import DealForm from '../forms/DealForm';
import './deals-table-desktop.css';

export default function DealsTable() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDeal, setEditDeal] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchDeals = () => {
    setLoading(true);
    fetch(`${API_URL}/deals`)
      .then(async res => {
        try {
          const data = await res.json();
          console.log('Fetched deals:', data);
          setDeals(Array.isArray(data) ? data : []);
        } catch (e) {
          setDeals([]);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Diesen Deal wirklich löschen?')) return;
    await fetch(`${API_URL}/deals/${id}`, { method: 'DELETE' });
    fetchDeals();
  };

  const handleEdit = (deal: any) => {
    setEditDeal(deal);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (data: any) => {
    await fetch(`${API_URL}/deals/${editDeal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
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
            <th style={{ fontWeight: 600, color: '#222', fontSize: 15, padding: '12px 8px', border: 'none', textAlign: 'left' }}>Wahrscheinlichkeit</th>
            <th style={{ fontWeight: 600, color: '#222', fontSize: 15, padding: '12px 8px', border: 'none', textAlign: 'left' }}>Score</th>
            <th style={{ fontWeight: 600, color: '#222', fontSize: 15, padding: '12px 8px', border: 'none', textAlign: 'left' }}>Besitzer</th>
            <th style={{ fontWeight: 600, color: '#222', fontSize: 15, padding: '12px 8px', border: 'none', textAlign: 'left' }}>Erwartets Enddatum</th>
            <th style={{ fontWeight: 600, color: '#222', fontSize: 15, padding: '12px 8px', border: 'none', textAlign: 'left' }}>Aktione</th>
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
              <td style={{ padding: '10px 8px', border: 'none', color: '#444' }} data-label="Amount">{d.amount} {d.currency}</td>
              <td style={{ padding: '10px 8px', border: 'none', color: '#444' }} data-label="Probability">{d.probability}%</td>
              <td style={{ padding: '10px 8px', border: 'none', color: '#444' }} data-label="Score">{d.dealScore}</td>
              <td style={{ padding: '10px 8px', border: 'none', color: '#888', fontSize: 14 }} data-label="Owner">{d.owner?.name || d.ownerUserId}</td>
              <td style={{ padding: '10px 8px', border: 'none', color: '#888', fontSize: 14 }} data-label="Expected Close">{d.expectedCloseDate ? new Date(d.expectedCloseDate).toLocaleDateString() : ''}</td>
              <td style={{ padding: '10px 8px', border: 'none' }} data-label="Actions">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => handleEdit(d)}
                    style={{
                      minWidth: 90,
                      background: '#f4f5f7',
                      color: '#0052cc',
                      border: 'none',
                      borderRadius: 4,
                      padding: '4px 0',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: 14,
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = '#e1e7f0')}
                    onMouseOut={e => (e.currentTarget.style.background = '#f4f5f7')}
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    style={{
                      minWidth: 90,
                      background: '#ff4d4f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '4px 0',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: 14,
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = '#d9363e')}
                    onMouseOut={e => (e.currentTarget.style.background = '#ff4d4f')}
                  >
                    Löschen
                  </button>
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
