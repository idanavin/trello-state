import type { ReactNode } from 'react'
import { BoardContext, type BoardContextValue } from '../../board/BoardContext'

// ---------------------------------------------------------------------------
// TanStack Query BoardProvider — placeholder stub.
// Satisfies the BoardContextValue contract; does not implement real state.
// Only build this out if ≥2h remain after Redux and Zustand are demo-ready.
// ---------------------------------------------------------------------------

const TODO_VALUE: BoardContextValue = {
  cards: [],
  connectedUsers: [],
  addCard: () => { /* TODO */ },
  editCard: () => { /* TODO */ },
  deleteCard: () => { /* TODO */ },
  moveCard: () => { /* TODO */ },
}

export function BoardProvider({ children }: { children: ReactNode }) {
  return (
    <BoardContext.Provider value={TODO_VALUE}>
      <div style={{ padding: '1rem', color: 'orange' }}>
        TanStack Query implementation — placeholder only
      </div>
      {children}
    </BoardContext.Provider>
  )
}
