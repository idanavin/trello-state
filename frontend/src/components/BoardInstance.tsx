import { useState } from 'react'
import type { Card, CardFormValues, ColumnId } from '../types'
import { KanbanBoard } from './KanbanBoard'
import { CardModal } from './CardModal'
import { PresenceBar } from './PresenceBar'

type ModalState =
  | { mode: 'closed' }
  | { mode: 'create'; columnId: ColumnId }
  | { mode: 'edit'; card: Card }

let counter = 1
function generateId() {
  return `card-${counter++}`
}

interface BoardInstanceProps {
  label: string
}

/**
 * Self-contained board with local React state.
 * Will be replaced per-implementation with proper state wiring.
 */
export function BoardInstance({ label }: BoardInstanceProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })

  function handleAddCard(columnId: ColumnId) {
    setModal({ mode: 'create', columnId })
  }

  function handleEditCard(card: Card) {
    setModal({ mode: 'edit', card })
  }

  function handleDeleteCard(cardId: string) {
    setCards((prev) => prev.filter((c) => c.id !== cardId))
  }

  function handleMoveCard(cardId: string, toColumn: ColumnId) {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, columnId: toColumn } : c)),
    )
  }

  function handleModalSubmit(values: CardFormValues) {
    if (modal.mode === 'create') {
      const newCard: Card = {
        id: generateId(),
        columnId: modal.columnId,
        ...values,
      }
      setCards((prev) => [...prev, newCard])
    } else if (modal.mode === 'edit') {
      setCards((prev) =>
        prev.map((c) => (c.id === modal.card.id ? { ...c, ...values } : c)),
      )
    }
    setModal({ mode: 'closed' })
  }

  function handleModalClose() {
    setModal({ mode: 'closed' })
  }

  return (
    <div className="board-instance">
      <div className="board-instance-header">
        <h2 className="board-instance-label">{label}</h2>
        <PresenceBar users={[]} />
      </div>
      <div className="board-instance-body">
        <KanbanBoard
          cards={cards}
          onAddCard={handleAddCard}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
          onMoveCard={handleMoveCard}
        />
      </div>
      {modal.mode !== 'closed' && (
        <CardModal
          initialValues={modal.mode === 'edit' ? modal.card : undefined}
          onSubmit={handleModalSubmit}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
