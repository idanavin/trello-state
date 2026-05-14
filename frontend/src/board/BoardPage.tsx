import { useState } from 'react'
import { useBoardContext } from '../board/BoardContext'
import type { Card, CardFormValues, ColumnId } from '../types'
import { KanbanBoard } from '../components/KanbanBoard'
import { CardModal } from '../components/CardModal'
import { PresenceBar } from '../components/PresenceBar'

type ModalState =
  | { mode: 'closed' }
  | { mode: 'create'; columnId: ColumnId }
  | { mode: 'edit'; card: Card }

// ---------------------------------------------------------------------------
// BoardPage — permanently agnostic; never imports any state library.
// State comes from whichever BoardProvider wraps this component.
// ---------------------------------------------------------------------------

export function BoardPage() {
  const { cards, connectedUsers, addCard, editCard, deleteCard, moveCard } =
    useBoardContext()
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' })

  function handleAddCard(columnId: ColumnId) {
    setModal({ mode: 'create', columnId })
  }

  function handleEditCard(card: Card) {
    setModal({ mode: 'edit', card })
  }

  function handleDeleteCard(cardId: string) {
    deleteCard(cardId)
  }

  function handleMoveCard(cardId: string, toColumn: ColumnId) {
    moveCard(cardId, toColumn)
  }

  function handleModalSubmit(values: CardFormValues) {
    if (modal.mode === 'create') {
      addCard(modal.columnId, values)
    } else if (modal.mode === 'edit') {
      editCard(modal.card.id, values)
    }
    setModal({ mode: 'closed' })
  }

  function handleModalClose() {
    setModal({ mode: 'closed' })
  }

  return (
    <div className="board-instance">
      <div className="board-instance-header">
        <PresenceBar users={connectedUsers} />
      </div>
      <div className="board-scroll">
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
