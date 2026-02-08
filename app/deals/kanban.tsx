import React from 'react';
import DealsKanbanBoard from '../../components/deals/DealsKanbanBoard';

export default function DealsKanbanPage() {
  return (
    <div className="deals-responsive">
      <div className="deals-header-row">
        <h2 className="deals-title">Deals Pipeline (Kanban)</h2>
      </div>
      <DealsKanbanBoard />
    </div>
  );
}