// src/components/Board/Board.tsx
import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import Column from './Column';

export default function Board({ columns, onDragEnd }: {
  columns: Array<{ id: string; title: string; cards: any[] }>;
  onDragEnd: (result: any) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor));
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
          {columns.map(col => (
            <Column key={col.id} column={col} />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}
