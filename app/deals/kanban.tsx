import React from 'react';
import DealsKanbanBoard from '../../components/deals/DealsKanbanBoard';
import DealInsightsWidget from '../../components/deals/DealInsightsWidget';

export default function DealsKanbanPage() {
  return (
    <div className="deals-responsive">
      <div className="deals-header-row">
        <h2 className="deals-title">Deals Pipeline (Kanban)</h2>
      </div>
      <DealInsightsWidget />
      <DealsKanbanBoard />
    </div>
  );
}