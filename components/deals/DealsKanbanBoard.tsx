import React, { useState } from 'react';

// Example data structure for deals and stages
const stages = [
  { id: 'stage-1', name: 'Prospektierig' },
  { id: 'stage-2', name: 'Qualifiziert' },
  { id: 'stage-3', name: 'Vorschlag' },
  { id: 'stage-4', name: 'Verhandlig' },
  { id: 'stage-5', name: 'Abgschlosse' },
];

const initialDeals = [
  { id: 'deal-1', title: 'ACME Renewal', company: 'ACME Corp', owner: 'Sarah', stageId: 'stage-2' },
  { id: 'deal-2', title: 'Big Sale', company: 'Beta LLC', owner: 'John', stageId: 'stage-2' },
  { id: 'deal-3', title: 'Expansion', company: 'Gamma Inc', owner: 'Alex', stageId: 'stage-3' },
];

export default function DealsKanbanBoard() {
  const [deals, setDeals] = useState(initialDeals);

  // Drag and drop handlers (instant, no animation)
  const onDragStart = (e, dealId) => {
    e.dataTransfer.setData('dealId', dealId);
  };

  const onDrop = (e, stageId) => {
    const dealId = e.dataTransfer.getData('dealId');
    setDeals(deals =>
      deals.map(deal =>
        deal.id === dealId ? { ...deal, stageId } : deal
      )
    );
  };

  return (
    <div style={{ display: 'flex', gap: 0, background: '#f7f7f7', border: '1px solid #e0e0e0', borderRadius: 0 }}>
      {stages.map(stage => {
        const stageDeals = deals.filter(deal => deal.stageId === stage.id);
        return (
          <div
            key={stage.id}
            onDragOver={e => e.preventDefault()}
            onDrop={e => onDrop(e, stage.id)}
            style={{
              flex: 1,
              minWidth: 260,
              minHeight: 400,
              background: '#fafbfc',
              borderRight: '1px solid #e0e0e0',
              borderLeft: 'none',
              borderTop: 'none',
              borderBottom: 'none',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              borderBottom: '1px solid #e0e0e0',
              background: '#f4f5f7',
              fontWeight: 600,
              fontSize: 15,
              padding: '12px 16px 8px 16px',
              letterSpacing: 0.2,
              color: '#222',
              textTransform: 'none',
              marginBottom: 0,
            }}>
              {stage.name} <span style={{ color: '#888', fontWeight: 400, fontSize: 13 }}>({stageDeals.length})</span>
            </div>
            <div style={{ flex: 1, padding: '8px 8px 0 8px' }}>
              {stageDeals.length === 0 && (
                <div style={{ color: '#bbb', fontSize: 13, padding: '8px 0' }}>───────────────</div>
              )}
              {stageDeals.map(deal => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={e => onDragStart(e, deal.id)}
                  style={{
                    background: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 0,
                    margin: '0 0 8px 0',
                    padding: '10px 12px',
                    fontSize: 15,
                    boxShadow: 'none',
                    cursor: 'grab',
                    transition: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#222', marginBottom: 2 }}>{deal.title}</div>
                  <div style={{ color: '#444', fontSize: 13 }}>{deal.company}</div>
                  <div style={{ color: '#888', fontSize: 12 }}>Verantwortlich: {deal.owner}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
