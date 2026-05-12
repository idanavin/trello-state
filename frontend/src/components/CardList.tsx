import type { Card, ColumnId } from '../types'
import { Card as CardComponent } from './Card'

interface CardListProps {
  cards: Card[]
  onEdit: (card: Card) => void
  onDelete: (cardId: string) => void
  onMove: (cardId: string, toColumn: ColumnId) => void
}

export function CardList({ cards, onEdit, onDelete, onMove }: CardListProps) {
  return (
    <>
      {cards.map((card) => (
        <CardComponent
          key={card.id}
          card={card}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </>
  )
}
