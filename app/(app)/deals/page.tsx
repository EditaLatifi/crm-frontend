"use client";
import DealsTable from '../../../components/tables/DealsTable';
import DealsAnalytics from '../../../components/charts/DealsAnalytics';
import Link from 'next/link';
import Modal from '../../../components/ui/Modal';
import DealForm from '../../../components/forms/DealForm';
import React, { useState } from 'react';
import './deals-desktop.css';
import DealInsightsWidget from '../../../components/deals/DealInsightsWidget';
export default function DealsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [dealsTableKey, setDealsTableKey] = useState(0); // force DealsTable to re-render
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const handleCreate = async (data: any) => {
    await fetch(`${API_URL}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setModalOpen(false);
    setDealsTableKey(k => k + 1); // trigger DealsTable to reload data
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
      {/* AI Insights Widget Section */}
      <div className="deals-section" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, marginBottom: 32 }}>
        <DealsTable key={dealsTableKey} />
      </div>
      <div className="deals-section" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32 }}>
        <DealsAnalytics />
      </div>
      <div className="deals-section" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32, marginBottom: 32 }}>
        {/* AI Insights Widget */}
        <DealInsightsWidget />
      </div>
    </div>
  );
}
