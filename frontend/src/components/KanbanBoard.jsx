import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

// Card arrastável
function KanbanCard({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border border-border rounded-lg p-4 mb-3 hover:shadow-md transition-shadow cursor-move"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical size={16} className="text-muted mt-1 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

// Coluna do Kanban
function KanbanColumn({ id, title, items, renderCard, count }) {
  return (
    <div className="flex-1 min-w-[300px] bg-surface rounded-lg p-4 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text">{title}</h3>
        <span className="bg-card px-2 py-1 rounded text-xs text-muted">{count || items.length}</span>
      </div>

      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <KanbanCard key={item.id} id={item.id}>
            {renderCard(item)}
          </KanbanCard>
        ))}

        {items.length === 0 && (
          <div className="text-center py-8 text-muted text-sm">Nenhum item</div>
        )}
      </SortableContext>
    </div>
  );
}

/**
 * KanbanBoard - Quadro Kanban com drag & drop
 *
 * @param {Array} columns - Array de colunas [{id, title, items}]
 * @param {Function} onDragEnd - Callback quando arrasta termina (item, fromColumn, toColumn)
 * @param {Function} renderCard - Função para renderizar conteúdo do card
 */
export default function KanbanBoard({ columns, onDragEnd, renderCard }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Encontrar item e colunas
    let item, fromColumn, toColumn;

    for (const col of columns) {
      const foundItem = col.items.find((i) => i.id === active.id);
      if (foundItem) {
        item = foundItem;
        fromColumn = col.id;
        break;
      }
    }

    for (const col of columns) {
      if (col.items.find((i) => i.id === over.id) || col.id === over.id) {
        toColumn = col.id;
        break;
      }
    }

    if (fromColumn !== toColumn) {
      onDragEnd?.(item, fromColumn, toColumn);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            items={column.items}
            count={column.count}
            renderCard={renderCard}
          />
        ))}
      </div>
    </DndContext>
  );
}
