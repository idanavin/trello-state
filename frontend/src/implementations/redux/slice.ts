import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { createSelector } from 'reselect'
import type { Card, ColumnId } from '../../types'

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface BoardSliceState {
  cards: Card[]
  connectedUsers: string[]
}

const initialState: BoardSliceState = {
  cards: [],
  connectedUsers: [],
}

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

export const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setBoard(state, action: PayloadAction<{ cards: Card[]; users: string[] }>) {
      state.cards = action.payload.cards
      state.connectedUsers = action.payload.users
    },
    setPresence(state, action: PayloadAction<string[]>) {
      state.connectedUsers = action.payload
    },
    addCard(state, action: PayloadAction<Card>) {
      state.cards.push(action.payload)
    },
    updateCard(state, action: PayloadAction<Card>) {
      const index = state.cards.findIndex((c) => c.id === action.payload.id)
      if (index !== -1) {
        state.cards[index] = action.payload
      }
    },
    moveCard(state, action: PayloadAction<{ id: string; columnId: ColumnId }>) {
      const card = state.cards.find((c) => c.id === action.payload.id)
      if (card) {
        card.columnId = action.payload.columnId
      }
    },
    deleteCard(state, action: PayloadAction<string>) {
      state.cards = state.cards.filter((c) => c.id !== action.payload)
    },
    // Reconcile: replace a temp card with the real server card
    reconcileAddCard(state, action: PayloadAction<{ tempId: string; real: Card }>) {
      const index = state.cards.findIndex((c) => c.id === action.payload.tempId)
      if (index !== -1) {
        state.cards[index] = action.payload.real
      } else {
        // Card came from another client — just add it
        state.cards.push(action.payload.real)
      }
    },
  },
})

export const {
  setBoard,
  setPresence,
  addCard,
  updateCard,
  moveCard,
  deleteCard,
  reconcileAddCard,
} = boardSlice.actions

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export interface RootState {
  board: BoardSliceState
}

const selectBoardState = (state: RootState) => state.board

export const selectCards = createSelector(selectBoardState, (board) => board.cards)
export const selectConnectedUsers = createSelector(
  selectBoardState,
  (board) => board.connectedUsers,
)
