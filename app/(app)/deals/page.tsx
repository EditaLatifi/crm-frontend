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
    <div className="deals-page-container">
      {/* Header */}
      <div className="deals-header-row">
        <h1 className="deals-title">Deals</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: 8, border: '1px solid #E8E4DE', overflow: 'hidden' }}>
            <button onClick={() => setView('kanban')} style={{ padding: '8px 16px', border: 'none', background: view === 'kanban' ? '#1a1a1a' : '#fff', color: view === 'kanban' ? '#fff' : '#666', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Kanban</button>
            <button onClick={() => setView('table')} style={{ padding: '8px 16px', border: 'none', background: view === 'table' ? '#1a1a1a' : '#fff', color: view === 'table' ? '#fff' : '#666', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Tabelle</button>
          </div>
          <button className="deals-new-btn" onClick={() => setModalOpen(true)}>
            + Neuer Deal
          </button>
        </div>
      </div>

      {/* Main view */}
      <div className="deals-section">
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
      <div className="deals-analytics-grid">
        <div className="deals-analytics-card">
          <DealsAnalytics />
        </div>
        <div className="deals-analytics-card">
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
