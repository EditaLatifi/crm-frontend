"use client";
import DealsTable from '../../../components/tables/DealsTable';
import DealsAnalytics from '../../../components/charts/DealsAnalytics';
import Link from 'next/link';
import Modal from '../../../components/ui/Modal';
import DealForm from '../../../components/forms/DealForm';
import React, { useState } from 'react';
import './deals-desktop.css';

export default function DealsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const handleCreate = async (data: any) => {
    await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setModalOpen(false);
    // Optionally trigger a refresh (could use router.refresh or state)
    window.location.reload();
  };
  return (
    <div className="deals-page-container" style={{ background: '#f4f6fa', minHeight: '100vh' }}>
      <div className="deals-header-row">
        <div>
          <h1 className="deals-title">Deals</h1>
        </div>
        <button className="deals-new-btn" onClick={() => setModalOpen(true)}>
          + Neuer Deal
        </button>
      </div>
      <div className="deals-section" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, marginBottom: 32 }}>
        <DealsTable />
      </div>
      <div className="deals-section" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32 }}>
        <DealsAnalytics />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Neuer Deal">
        <DealForm onSubmit={handleCreate} />
      </Modal>
    </div>
  );
}
