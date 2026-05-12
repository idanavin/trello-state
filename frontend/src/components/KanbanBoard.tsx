import type { Card, ColumnId } from '../types'
import { COLUMN_IDS, COLUMN_LABELS } from '../types'
import { Column } from './Column'

interface KanbanBoardProps {
  cards: Card[]
  onAddCard: (columnId: ColumnId) => void
  onEditCard: (card: Card) => void
  onDeleteCard: (cardId: string) => void
  onMoveCard: (cardId: string, toColumn: ColumnId) => void
}

export function KanbanBoard({ cards, onAddCard, onEditCard, onDeleteCard, onMoveCard }: KanbanBoardProps) {
  return (
    <div className="kanban-board">
      {COLUMN_IDS.map((columnId) => (
        <Column
          key={columnId}
          id={columnId}
          title={COLUMN_LABELS[columnId]}
          cards={cards.filter((c) => c.columnId === columnId)}
          onAddCard={() => onAddCard(columnId)}
          onEditCard={onEditCard}
          onDeleteCard={onDeleteCard}
          onMoveCard={onMoveCard}
        />
      ))}
    </div>
  )
}
