---
name: trello-backend-structure
description: 'Backend data model, WebSocket event protocol, and server architecture plan for the Trello-State kanban board. Use when building, modifying, or referencing the backend server — event names, payload shapes, in-memory state structure, presence tracking, and connection setup. The backend is shared across all frontend state implementations.'
---

# Backend Data Structure & Protocol

The backend is **plumbing** — keep it simple. In-memory state only, no database. It exists to relay events and track connected clients.

## Tech Stack Decision

| Concern | Choice | Notes |
|---------|--------|---------|
| Runtime | Bun | Fast TS execution, no compile step |
| Framework | Express 5 | Minimal HTTP layer for health endpoint |
| WebSocket lib | `ws` | Lightweight, no overhead |
| Start command | `bun run dev` (watch) / `bun start` |

---

## In-Memory State Shape

```ts
// Server-side state (TypeScript pseudocode)

interface Card {
  id: string          // UUID, generated server-side on create
  title: string
  description: string
  assignee: string
  columnId: 'todo' | 'in-progress' | 'done'
}

interface ServerState {
  cards: Map<string, Card>           // cardId → Card
  connectedUsers: Map<string, string> // socketId → userName
}
```

---

## WebSocket Event Protocol

All messages are JSON. Every message has a `type` field.

### Client → Server (actions)

| Event type | Payload | Description |
|------------|---------|-------------|
| `card:create` | `{ title, description, assignee, columnId }` | Create a new card |
| `card:update` | `{ id, title, description, assignee }` | Edit card fields |
| `card:move` | `{ id, columnId }` | Move card to column |
| `card:delete` | `{ id }` | Delete a card |
| `user:join` | `{ userName }` | Register a user name on connect |

### Server → Client (broadcasts)

| Event type | Payload | Description |
|------------|---------|-------------|
| `board:init` | `{ cards: Card[], users: string[] }` | Sent to a newly connected client |
| `card:created` | `{ card: Card }` | Broadcast after a card is created |
| `card:updated` | `{ card: Card }` | Broadcast after a card is edited |
| `card:moved` | `{ id, columnId }` | Broadcast after a card is moved |
| `card:deleted` | `{ id }` | Broadcast after a card is deleted |
| `presence:update` | `{ users: string[] }` | Broadcast when any user joins or leaves |

> All broadcasts go to **all connected clients**, including the sender. Clients reconcile optimistic state against the incoming echo.

---

## Server Behavior Rules

1. **On connect**: send `board:init` with full current state + user list
2. **On `user:join`**: register user name, broadcast `presence:update` to all
3. **On disconnect**: remove user from connectedUsers, broadcast `presence:update`
4. **On any card action**: mutate in-memory state, broadcast corresponding event to all clients
5. **Never reject** a valid message — assume all inputs are acceptable (no conflict resolution needed)
6. **IDs**: generate `id` server-side on `card:create` using `crypto.randomUUID()`

---

## Startup

The app must start with one of:
```bash
docker-compose up      # preferred
npm start              # fallback
```

Expected ports:
| Service | Port |
|---------|------|
| Backend / WS | 3001 |
| Frontend dev server | 5173 |

---

## What the Backend Does NOT Do

- No authentication or session management
- No input validation beyond basic JSON parsing
- No persistence to disk or database
- No conflict resolution — last write wins
- No rate limiting
- No REST endpoints needed (WebSocket only is fine; add HTTP health check if needed)
