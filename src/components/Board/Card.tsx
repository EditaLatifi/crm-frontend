// src/components/Board/Card.tsx
import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export default function Card({ card }: { card: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`bg-gray-50 border rounded px-3 py-2 text-sm shadow-none cursor-grab select-none ${isDragging ? 'opacity-60' : ''}`}
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
    >
      <div className="font-medium text-gray-800 mb-1">{card.name}</div>
      <div className="text-xs text-gray-500">{card.accountName}</div>
      <div className="text-xs text-gray-400">Owner: {card.ownerName}</div>
      {/* Add badges/status as needed */}
    </div>
  );
}
