import { createStore } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Card, ColumnId } from '../../types'

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface BoardStoreState {
  cards: Card[]
  connectedUsers: string[]
  // Actions
  setBoard: (cards: Card[], users: string[]) => void
  setPresence: (users: string[]) => void
  upsertCard: (card: Card) => void
  moveCard: (id: string, columnId: ColumnId) => void
  deleteCard: (id: string) => void
  reconcileCreate: (tempId: string, real: Card) => void
}

// ---------------------------------------------------------------------------
// createBoardStore — factory; call once per BoardProvider instance.
// Do NOT use at module level — Compare mode requires two separate stores.
// ---------------------------------------------------------------------------

export function createBoardStore(storeName = 'trello-zustand-board') {
  return createStore<BoardStoreState>()(
    devtools(
      immer((set) => ({
        cards: [],
        connectedUsers: [],

        setBoard(cards, users) {
          set((state) => {
            state.cards = cards
            state.connectedUsers = users
          })
        },

        setPresence(users) {
          set((state) => {
            state.connectedUsers = users
          })
        },

        upsertCard(card) {
          set((state) => {
            const index = state.cards.findIndex((c) => c.id === card.id)
            if (index !== -1) {
              state.cards[index] = card
            } else {
              state.cards.push(card)
            }
          })
        },

        moveCard(id, columnId) {
          set((state) => {
            const card = state.cards.find((c) => c.id === id)
            if (card) card.columnId = columnId
          })
        },

        deleteCard(id) {
          set((state) => {
            state.cards = state.cards.filter((c) => c.id !== id)
          })
        },

        reconcileCreate(tempId, real) {
          set((state) => {
            const index = state.cards.findIndex((c) => c.id === tempId)
            if (index !== -1) {
              state.cards[index] = real
            } else {
              state.cards.push(real)
            }
          })
        },
      })),
      { name: storeName },
    ),
  )
}

export type ZustandBoardStore = ReturnType<typeof createBoardStore>
