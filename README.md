# Trello-State — Fullstack Assignment

## Overview
A Trello-like kanban board application built as a fullstack home assignment.

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 8, React Compiler |
| Backend | Bun, Express 5, TypeScript, ws |
| Database | In-memory (no DB) |

## Setup
```bash
# Frontend
cd frontend
bun install
bun run dev        # http://localhost:5173
bun run build      # production build

# Backend
cd backend
bun install
bun run dev        # http://localhost:3001  ws://localhost:3001
```

**Environment variables:** (document new vars here as added)
| Variable | Description |
|----------|-------------|
| `VITE_WS_URL` | WebSocket server URL (default: `ws://localhost:3001`) |

---

## Progress

| Date | Milestone | Notes |
|------|-----------|-------|
| 2026-05-12 | Project initialized | Copilot rules, README, and HOURS scaffold created |
| 2026-05-12 | Copilot skills created | 4 local skills covering assignment context, frontend components, state management, and backend structure |
| 2026-05-12 | Basic frontend scaffolded | React 19 + Vite 8 + React Compiler; all shared UI components (Column, Card, CardList, CardModal, PresenceBar, KanbanBoard); local-state BoardPage placeholder |
| 2026-05-12 | Backend implemented | Bun + Express 5 + ws; full WS event protocol, in-memory state, health endpoint on :3001 |
| 2026-05-12 | WS client layer built | `src/ws/` — typed client factory, WsProvider (one socket for all impls), `useWsClient()` hook as the abstract contract |

---

## Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-12 | Local Copilot skills over global | Skills scoped to `.copilot/skills/` in the repo to keep context minimal per build phase |
| 2026-05-12 | React Compiler v1.0 for memoization | No manual `React.memo`/`useMemo`/`useCallback` for optimization; compiler handles it automatically |
| 2026-05-12 | @vitejs/plugin-react pinned to v4 | v6 (Vite 8 default) dropped the babel option; v4 required for babel-plugin-react-compiler integration |
| 2026-05-12 | Backend: Bun + Express 5 + ws | Single file server; no framework overhead; ws chosen over socket.io for minimal footprint |
| 2026-05-12 | WS abstraction via hook contract not class interface | `WsClient` TS interface + `useWsClient()` hook is the DIP boundary; no classes; one shared socket in `WsProvider` for compare mode |
