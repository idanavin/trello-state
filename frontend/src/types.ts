export type ColumnId = 'todo' | 'in-progress' | 'done'

export const COLUMN_IDS: ColumnId[] = ['todo', 'in-progress', 'done']

export const COLUMN_LABELS: Record<ColumnId, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
}

export interface Card {
  id: string
  title: string
  description: string
  assignee: string
  columnId: ColumnId
}

export interface CardFormValues {
  title: string
  description: string
  assignee: string
}

export interface BoardState {
  cards: Card[]
  connectedUsers: string[]
}
