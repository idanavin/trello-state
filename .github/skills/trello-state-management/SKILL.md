---
name: trello-state-management
description: 'State management comparison study plan for the Trello-State assignment. Use when choosing, implementing, or discussing state management approaches for the kanban board. Covers the two or three chosen implementations, how to switch between them, what each approach is responsible for, and how optimistic updates and WebSocket sync should be handled per approach. UPDATE THIS SKILL as implementation decisions are finalized.'
---

# Frontend State Management

This skill tracks the state management comparison study — the core deliverable of the assignment.

## Status

> **UPDATE THIS SECTION** as approaches are chosen and implemented.

| # | Approach | Library/Tools | Status |
|---|----------|---------------|--------|
| 1 | TBD | TBD | Not started |
| 2 | TBD | TBD | Not started |
| 3 | TBD (optional) | TBD | Not started |

---

## Constraints (from assignment)

- 2–3 approaches, representing **meaningfully different philosophies**
- Redux + RTK + Reselect counts as ONE philosophy — must be paired with something genuinely different
- All implementations must be **switchable** at runtime or build time
- UI components are **shared** — only the state wiring layer changes

## Switching Between Implementations

> **UPDATE** this section once the switching mechanism is decided.

**Current plan:** TBD — options include:
- `?impl=zustand` / `?impl=redux` query param (cleanest for live demo)
- `VITE_STATE_IMPL` environment variable (requires rebuild per switch)
- React Router route per implementation (`/board/zustand`, `/board/redux`)

**Recommended for live demo**: query param or route — allows switching without rebuilding.

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

- **Redux**: dispatch actions from WS event handlers (middleware or thunk)
- **Zustand**: call store setters directly from WS event callbacks
- **Signals / other**: update signal/atom values from WS callbacks

---

## Design Journal Notes

> Add notes here as each implementation is built. These feed into JOURNAL.md.

### Implementation 1 — TBD
- Trade-offs noticed:
- Pain points:
- Wins:

### Implementation 2 — TBD
- Trade-offs noticed:
- Pain points:
- Wins:

### Implementation 3 — TBD (if applicable)
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
