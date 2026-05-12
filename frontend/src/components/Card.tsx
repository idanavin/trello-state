import type { Card, ColumnId } from '../types'
import { COLUMN_IDS, COLUMN_LABELS } from '../types'

interface CardProps {
  card: Card
  onEdit: (card: Card) => void
  onDelete: (cardId: string) => void
  onMove: (cardId: string, toColumn: ColumnId) => void
}

export function Card({ card, onEdit, onDelete, onMove }: CardProps) {
  const otherColumns = COLUMN_IDS.filter((id) => id !== card.columnId)

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title">{card.title}</h4>
        <div className="card-actions">
          <button className="btn-icon" onClick={() => onEdit(card)} title="Edit">
            ✏️
          </button>
          <button className="btn-icon btn-danger" onClick={() => onDelete(card.id)} title="Delete">
            🗑️
          </button>
        </div>
      </div>
      {card.description && <p className="card-description">{card.description}</p>}
      {card.assignee && <p className="card-assignee">👤 {card.assignee}</p>}
      <div className="card-move">
        <span className="move-label">Move to: </span>
        {otherColumns.map((colId) => (
          <button
            key={colId}
            className="btn-move"
            onClick={() => onMove(card.id, colId)}
          >
            {COLUMN_LABELS[colId]}
          </button>
        ))}
      </div>
    </div>
  )
}
