"use client";
import DealsTable from '../../../components/tables/DealsTable';
import DealsAnalytics from '../../../components/charts/DealsAnalytics';
import DealsKanbanBoard from '../../../components/deals/DealsKanbanBoard';
import DealInsightsWidget from '../../../components/deals/DealInsightsWidget';
import Modal from '../../../components/ui/Modal';
import DealForm from '../../../components/forms/DealForm';
import { useState } from 'react';
import { api } from '../../../src/api/client';
import './deals-desktop.css';
import './responsive.css';

type ViewMode = 'kanban' | 'table';

export default function DealsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<any | null>(null);
  const [dealsKey, setDealsKey] = useState(0);
  const [view, setView] = useState<ViewMode>('kanban');

  const handleCreate = async (data: any) => {
    await api.post('/deals', data);
    setModalOpen(false);
    setDealsKey((k) => k + 1);
  };

  const handleEditSubmit = async (data: any) => {
    if (!editDeal) return;
    await api.patch(`/deals/${editDeal.id}`, data);
    setEditDeal(null);
    setDealsKey((k) => k + 1);
  };

  return (
    <div className="deals-page-container" style={{ background: '#f4f6fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="deals-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 className="deals-title" style={{ margin: 0 }}>Deals</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
            {(['kanban', 'table'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none',
                  background: view === v ? '#fff' : 'transparent',
                  color: view === v ? '#2563eb' : '#64748b',
                  fontWeight: view === v ? 700 : 500,
                  fontSize: 13, cursor: 'pointer',
                  boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {v === 'kanban' ? '⬜ Kanban' : '☰ Tabelle'}
              </button>
            ))}
          </div>
          <button className="deals-new-btn" onClick={() => setModalOpen(true)}>
            + Neuer Deal
          </button>
        </div>
      </div>

      {/* Main view */}
      <div className="deals-section" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 28, marginBottom: 24 }}>
        {view === 'kanban' ? (
          <DealsKanbanBoard
            key={dealsKey}
            onEdit={(deal) => setEditDeal(deal)}
            onRefresh={() => setDealsKey((k) => k + 1)}
          />
        ) : (
          <DealsTable key={dealsKey} />
        )}
      </div>

      {/* Analytics + Insights */}
      <div className="deals-analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="deals-analytics-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 28 }}>
          <DealsAnalytics />
        </div>
        <div className="deals-analytics-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 28 }}>
          <DealInsightsWidget />
        </div>
      </div>

      {/* Create modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Neuer Deal">
        <DealForm onSubmit={handleCreate} />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editDeal} onClose={() => setEditDeal(null)} title="Deal bearbeiten">
        <DealForm onSubmit={handleEditSubmit} initialData={editDeal} />
        <button
          onClick={() => setEditDeal(null)}
          style={{ marginTop: 12, background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 7, padding: '8px 18px', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}
        >
          Abbrechen
        </button>
      </Modal>
    </div>
  );
}
