import type { Card, ColumnId } from '../types'
import { CardList } from './CardList'

interface ColumnProps {
  id: ColumnId
  title: string
  cards: Card[]
  onAddCard: () => void
  onEditCard: (card: Card) => void
  onDeleteCard: (cardId: string) => void
  onMoveCard: (cardId: string, toColumn: ColumnId) => void
}

export function Column({ id, title, cards, onAddCard, onEditCard, onDeleteCard, onMoveCard }: ColumnProps) {
  return (
    <div className="column" data-column-id={id}>
      <div className="column-header">
        <h2 className="column-title">{title}</h2>
        <span className="column-count">{cards.length}</span>
      </div>
      <div className="column-cards">
        <CardList
          cards={cards}
          onEdit={onEditCard}
          onDelete={onDeleteCard}
          onMove={onMoveCard}
        />
      </div>
      <button className="btn-add-card" onClick={onAddCard}>
        + Add card
      </button>
    </div>
  )
}
