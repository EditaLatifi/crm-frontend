// src/components/Board/Column.tsx
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Card from './Card';

export default function Column({ column }: { column: { id: string; title: string; cards: any[] } }) {
  return (
    <div className="w-80 min-w-[20rem] bg-white border rounded p-3 flex flex-col">
      <div className="font-semibold text-sm mb-3 border-b pb-2 flex items-center justify-between">
        <span>{column.title}</span>
        <span className="text-xs text-gray-500">{column.cards.length}</span>
      </div>
      <SortableContext items={column.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {column.cards.map(card => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
