import { configureStore } from '@reduxjs/toolkit'
import { boardSlice } from './slice'

// ---------------------------------------------------------------------------
// createBoardStore — factory that creates a fresh store per BoardProvider.
// Do NOT call this at module level — Compare mode needs two separate instances.
// ---------------------------------------------------------------------------

export function createBoardStore() {
  return configureStore({
    reducer: {
      board: boardSlice.reducer,
    },
  })
}

export type BoardStore = ReturnType<typeof createBoardStore>
export type AppDispatch = BoardStore['dispatch']
