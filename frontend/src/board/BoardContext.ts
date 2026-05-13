import { createContext, useContext } from 'react'
import type { Card, CardFormValues, ColumnId } from '../types'

// ---------------------------------------------------------------------------
// Contract — the only interface the UI layer ever sees.
// Every implementation maps its own state to this shape.
// ---------------------------------------------------------------------------

export interface BoardContextValue {
  // State
  cards: Card[]
  connectedUsers: string[]
  // Actions — fire-and-forget; all implementations are optimistic
  addCard: (columnId: ColumnId, values: CardFormValues) => void
  editCard: (cardId: string, values: CardFormValues) => void
  deleteCard: (cardId: string) => void
  moveCard: (cardId: string, toColumn: ColumnId) => void
}

// ---------------------------------------------------------------------------
// Context — throws when consumed outside a provider (intentional fail-fast)
// ---------------------------------------------------------------------------

export const BoardContext = createContext<BoardContextValue | null>(null)

// ---------------------------------------------------------------------------
// Hook — the ONLY way the UI accesses board state
// ---------------------------------------------------------------------------

export function useBoardContext(): BoardContextValue {
  const value = useContext(BoardContext)
  if (value === null) {
    throw new Error('useBoardContext must be used inside a <BoardProvider>')
  }
  return value
}
