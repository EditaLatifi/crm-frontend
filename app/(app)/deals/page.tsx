"use client";
import DealsTable from '../../../components/tables/DealsTable';
import DealsAnalytics from '../../../components/charts/DealsAnalytics';
import Link from 'next/link';
import Modal from '../../../components/ui/Modal';
import DealForm from '../../../components/forms/DealForm';
import React, { useState } from 'react';
import './responsive.css';

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
      <div className="deals-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#222', margin: 0 }}>Deals</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              background: 'linear-gradient(90deg, #0052cc 0%, #007fff 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 28px',
              fontWeight: 700,
              fontSize: 18,
              boxShadow: '0 2px 8px rgba(0,82,204,0.12)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            + New Deal
          </button>
        </div>
      </div>
      <div className="deals-section" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, marginBottom: 32 }}>
        <DealsTable />
      </div>
      <div className="deals-section" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32 }}>
        <DealsAnalytics />
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Deal">
        <DealForm onSubmit={handleCreate} />
      </Modal>
    </div>
  );
}
