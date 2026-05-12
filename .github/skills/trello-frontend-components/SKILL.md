---
name: trello-frontend-components
description: 'Conventions and building blocks for the Trello-State frontend UI layer. Use when creating, editing, or reviewing React components for the kanban board — columns, cards, card forms, presence indicator, move controls. Covers component structure, naming, props, render isolation via React Compiler and selectors, and what NOT to build. The UI layer is shared across all state management implementations.'
---

# Frontend Component Conventions

This skill defines how to build the shared UI layer for the Trello-State kanban board. The UI is implementation-agnostic — it must work with any state management approach by accepting data and callbacks via props.

## Core Principles

1. **The UI layer is shared.** Components receive data and callbacks as props. They do not import from any specific state library directly. State wiring happens in container/page-level components swapped per implementation.
2. **Render isolation is mandatory.** A card move inside the board must never cause the page shell, the presence bar, or unaffected columns to re-render. Only the component subtree that owns the changed data updates.
3. **React Compiler handles memoization.** As of React Compiler v1.0 (stable, Oct 2025), do **not** manually add `React.memo`, `useMemo`, or `useCallback` for optimization. The compiler applies automatic memoization at build time — more precisely than handwritten code. Write idiomatic React. Render isolation is achieved by combining the compiler with granular state subscriptions.

## Component Tree

```
App
├── BoardPage                  ← wired to state (varies per implementation)
│   ├── PresenceBar            ← subscribes ONLY to connectedUsers slice
│   ├── KanbanBoard            ← receives stable column IDs; does not own card data
│   │   ├── Column (×3)        ← each subscribes ONLY to its own cards slice
│   │   │   ├── CardList       ← memoized; re-renders only when its cards array changes
│   │   │   │   └── Card (×n)  ← memoized by card id; re-renders only when that card changes
│   │   │   └── AddCardButton  ← memoized; callback is stable via useCallback
│   └── CardModal              ← mounted/unmounted; does not affect board rendering
```

**Key isolation boundary**: `BoardPage` never passes the full state object down.
It derives per-column card arrays and passes each to its `Column` independently.
Moving a card in column A → only column A's `Column` and its `CardList` re-render.

## Component Specs

> Write components as plain functions — no `React.memo` wrappers, no `useCallback`/`useMemo` for performance. React Compiler handles that automatically.

### `Column`
```tsx
interface ColumnProps {
  id: ColumnId
  title: string
  cards: Card[]                          // pre-filtered to this column only
  onAddCard: () => void
  onEditCard: (card: Card) => void
  onDeleteCard: (cardId: string) => void
  onMoveCard: (cardId: string, toColumn: ColumnId) => void
}

export function Column({ id, title, cards, onAddCard, onEditCard, onDeleteCard, onMoveCard }: ColumnProps) {
  return (
    <div>
      <h2>{title}</h2>
      <CardList cards={cards} onEdit={onEditCard} onDelete={onDeleteCard} onMove={onMoveCard} />
      <button onClick={onAddCard}>Add card</button>
    </div>
  )
}
```

### `Card`
```tsx
interface CardProps {
  card: Card  // { id, title, description, assignee, columnId }
  onEdit: (card: Card) => void
  onDelete: (cardId: string) => void
  onMove: (cardId: string, toColumn: ColumnId) => void
}

export function Card({ card, onEdit, onDelete, onMove }: CardProps) { ... }
// Move UI: simple buttons or a <select> dropdown — no drag-and-drop ever
```

### `CardList`
```tsx
// Separate component gives the compiler a clear memoization boundary per column
export function CardList({ cards, onEdit, onDelete, onMove }: CardListProps) {
  return cards.map((card) => (
    <Card key={card.id} card={card} onEdit={onEdit} onDelete={onDelete} onMove={onMove} />
  ))
}
// Always use card.id as key — never use array index
```

### `CardModal`
```tsx
interface CardModalProps {
  initialValues?: Partial<Card>   // undefined = create mode
  onSubmit: (values: CardFormValues) => void
  onClose: () => void
}
// Mount/unmount pattern: render only when open — no visibility toggling via CSS
// Uncontrolled inputs with defaultValue are fine here; modal resets on remount
export function CardModal({ initialValues, onSubmit, onClose }: CardModalProps) { ... }
```

### `PresenceBar`
```tsx
interface PresenceBarProps {
  users: string[]  // list of connected user names/IDs
}
// Simple: "Connected: Alice, Bob, You" — no avatars needed
// Subscribe ONLY to the connectedUsers slice in the state layer, not full board state
export function PresenceBar({ users }: PresenceBarProps) { ... }
```

## Shared Data Types

Define these once in `src/types.ts` (shared across all implementations):

```ts
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
```

## Render Isolation Rules

React Compiler handles intra-component memoization automatically. Your responsibility is **what state each component subscribes to** — the compiler cannot prevent a `PresenceBar` from re-rendering if you subscribe it to the full board state (that's a state management concern, not a rendering one).

### 1. React Compiler — automatic memoization (new code)

Install and enable React Compiler:
```bash
npm install --save-dev --save-exact babel-plugin-react-compiler@latest
```
```js
// vite.config.ts
import reactCompiler from 'babel-plugin-react-compiler'
export default { plugins: [['babel-plugin-react-compiler', {}]] }
```

Once enabled, write plain React components. The compiler inserts memoization at build time — it is more precise than handwritten `React.memo`/`useMemo` because it can:
- Memoize after early returns (impossible with hooks)
- Track fine-grained value dependencies automatically
- Avoid the common bug of inline arrow functions breaking `memo`

**Do not add `React.memo`, `useMemo`, or `useCallback` for performance.** They are redundant and add noise. The compiler handles it.

### 2. `useMemo`/`useCallback` as escape hatches only

These hooks still exist. Use them **only** when you need explicit control — not for performance:
```tsx
// ✅ Valid: stabilizing an effect dependency so it doesn't fire on every render
const stableFilter = useMemo(() => ({ columnId }), [columnId])
useEffect(() => { subscribe(stableFilter) }, [stableFilter])

// ❌ Wrong: memoizing a callback "for performance" — compiler does this already
const handleClick = useCallback(() => doSomething(), [])
```

### 3. Subscribe to minimal state slices (still required)

The compiler memoizes component rendering but cannot control which state slice triggers a subscription. This is where render isolation still requires your attention.

Each component (or its container) must subscribe **only to what it renders**:

| Component | Subscribe to |
|-----------|-------------|
| `PresenceBar` | `connectedUsers` only |
| `Column id="todo"` | `cards` where `columnId === 'todo'` |
| `Column id="in-progress"` | `cards` where `columnId === 'in-progress'` |
| `Column id="done"` | `cards` where `columnId === 'done'` |

**Implementation patterns:**

```tsx
// Redux — Reselect per column (memoized selector)
const selectTodoCards = createSelector(
  (state: RootState) => state.board.cards,
  (cards) => cards.filter(c => c.columnId === 'todo')
)
const todoCards = useSelector(selectTodoCards)

// Zustand — useShallow for derived arrays
const todoCards = useBoardStore(
  useShallow(state => state.cards.filter(c => c.columnId === 'todo'))
)
```

A card moving in "In Progress" must not cause `Column id="todo"` or `PresenceBar` to re-render.

### 4. Structural sharing — never mutate state

The compiler cannot fix bad state updates. Unchanged data must keep the same reference so subscriptions correctly detect no change:

```ts
// ❌ BAD — every card gets a new object reference every time
state.cards = state.cards.map(c => ({ ...c }))

// ✅ GOOD — only the changed card gets a new reference
state.cards = state.cards.map(c => c.id === id ? { ...c, ...changes } : c)
```

Redux Toolkit (Immer) handles this correctly. For Zustand, use Immer middleware or disciplined spread updates.

## File Structure

```
src/
├── types.ts                        ← shared types and constants
├── components/                     ← pure, memoized UI — no state imports
│   ├── KanbanBoard.tsx
│   ├── Column.tsx                  ← React.memo
│   ├── CardList.tsx                ← React.memo, keyed by card.id
│   ├── Card.tsx                    ← React.memo
│   ├── CardModal.tsx               ← mounted/unmounted, not toggled
│   └── PresenceBar.tsx             ← React.memo
├── implementations/
│   ├── zustand/
│   │   ├── BoardPage.tsx           ← granular selectors + useShallow
│   │   └── store.ts
│   ├── redux/
│   │   ├── BoardPage.tsx           ← createSelector per column
│   │   ├── slice.ts
│   │   └── store.ts
│   └── signals/BoardPage.tsx       ← fine-grained reactivity (if used)
├── ws/
│   └── client.ts                   ← shared WebSocket client
└── App.tsx                         ← routes/switches between implementations
```

## What NOT to Build

- No drag-and-drop (explicitly out of scope)
- No animations or transitions
- No avatar images, color-coded users, or visual polish
- No inline editing — use the modal
- No optimistic rollback UI (assume server always accepts)
- No loading spinners on individual cards — board-level loading is enough
- No responsive/mobile layout

## Coding Rules for Components

- Functional components only; always named (no anonymous default exports)
- Explicit TypeScript props interfaces for every component
- **No `React.memo`, `useMemo`, or `useCallback` for optimization** — React Compiler handles this
- `useMemo`/`useCallback` allowed only as escape hatches for explicit control (e.g., effect dependencies)
- No component-internal state except UI-only concerns (e.g., modal open flag)
- No direct WebSocket calls inside components — pass callbacks down
- Always use `card.id` as React list key, never array index
- Keep components small: split if JSX exceeds ~60 lines
