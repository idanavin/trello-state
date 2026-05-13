---
name: trello-state-management
description: 'State management comparison study plan for the Trello-State assignment. Use when choosing, implementing, or discussing state management approaches for the kanban board. Covers the two or three chosen implementations, how to switch between them, what each approach is responsible for, and how optimistic updates and WebSocket sync should be handled per approach. UPDATE THIS SKILL as implementation decisions are finalized.'
---

# Frontend State Management

This skill tracks the state management comparison study — the core deliverable of the assignment.

## Status

| # | Approach | Library/Tools | `?impl=` | Status |
|---|----------|---------------|----------|--------|
| 1 | Redux Toolkit | `@reduxjs/toolkit` + `reselect` | `redux` | Not started |
| 2 | Zustand | `zustand` + Immer middleware | `zustand` | Not started |
| 3 | TanStack Query *(optional)* | `@tanstack/react-query` | `tanstack` | Placeholder only |

---

## Constraints (from assignment)

- 2–3 approaches, representing **meaningfully different philosophies**
- Redux + RTK + Reselect counts as ONE philosophy — must be paired with something genuinely different
- All implementations must be **switchable** at runtime or build time
- UI components are **shared** — only the state wiring layer changes

## Switching Between Implementations

**Decided:** `?impl=redux` | `?impl=zustand` | `?impl=tanstack` query param — no rebuild required, cleanest for live demo and compare mode.

`App.tsx` reads the param and resolves a `BoardProvider` from a static `IMPL_REGISTRY` map. Adding a new implementation = one new entry in that map. No other file changes.

---

## What Each State Implementation Owns

Each implementation's `BoardPage.tsx` is responsible for:

1. **Initializing** — subscribing to the WebSocket, hydrating initial board state
2. **Optimistic updates** — applying card changes locally before server confirms
3. **Incoming WS events** — merging server-pushed changes into local state
4. **Dispatching actions** — wrapping create/edit/delete/move into state operations
5. **Providing data** — passing `cards`, `connectedUsers`, and callbacks to shared components

---

## Optimistic Update Pattern

All implementations must follow this pattern:

```
User action
  → apply change locally (optimistic)
  → send WS message to server
  → server broadcasts to all clients (including sender)
  → reconcile: if server echo matches optimistic state, no-op; else correct
```

**Key rule**: assume server always accepts. No rollback needed.

---

## WebSocket Integration Per Implementation

The shared `src/ws/client.ts` handles the raw socket connection and emits typed events. Each state implementation subscribes to these events in its own way:

- **Redux**: dispatch actions from WS event handlers inside `useEffect` in `BoardProvider`
- **Zustand**: call store actions directly from WS event callbacks in `BoardProvider`
- **TanStack Query**: call `setQueryData` or `invalidateQueries` from WS event callbacks in `BoardProvider`

---

## Design Journal Notes

> Add notes here as each implementation is built. These feed into JOURNAL.md.

### Implementation 1 — Redux Toolkit
- Trade-offs noticed:
- Pain points:
- Wins:

### Implementation 2 — Zustand
- Trade-offs noticed:
- Pain points:
- Wins:

### Implementation 3 — TanStack Query *(placeholder)*
- Trade-offs noticed:
- Pain points:
- Wins:

---

## Candidate Libraries (decide and update above)

| Philosophy | Options |
|------------|---------|
| Flux/Redux | Redux Toolkit + Reselect |
| Atomic/fine-grained | Jotai, Recoil, Preact Signals |
| Store-based | Zustand, Valtio |
| Server-state-first | TanStack Query (if pairing with WS adapter) |
| Built-in React | useContext + useReducer |
| Reactive streams | RxJS |

Choose options from **different rows** to ensure philosophical diversity.
