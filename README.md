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

### Docker (recommended)
```bash
docker compose up
# Frontend → http://localhost:3000
# Backend  → http://localhost:3001  ws://localhost:3001
```

Images are built automatically on first run. To rebuild after source changes: `docker compose up --build`

To target a remote host, change `VITE_WS_URL` in [docker-compose.yml](docker-compose.yml) before running.

### Local dev
```bash
# Backend
cd backend
bun install
bun run dev        # http://localhost:3001  ws://localhost:3001

# Frontend (new terminal)
cd frontend
bun install
bun run dev        # http://localhost:5173
```

**Environment variables:**
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_WS_URL` | WebSocket server URL (baked in at build time) | `ws://localhost:3001` |

---

## Progress

| Date | Milestone | Notes |
|------|-----------|-------|
| 2026-05-12 | Project initialized | Copilot rules, README, and HOURS scaffold created |
| 2026-05-12 | Copilot skills created | 4 local skills covering assignment context, frontend components, state management, and backend structure |
| 2026-05-12 | Basic frontend scaffolded | React 19 + Vite 8 + React Compiler; all shared UI components (Column, Card, CardList, CardModal, PresenceBar, KanbanBoard); local-state BoardPage placeholder |
| 2026-05-12 | Backend implemented | Bun + Express 5 + ws; full WS event protocol, in-memory state, health endpoint on :3001 |
| 2026-05-12 | WS client layer built | `src/ws/` — typed client factory, WsProvider (one socket for all impls), `useWsClient()` hook as the abstract contract |
| 2026-05-13 | State implementations decided | Redux Toolkit → Zustand → TanStack Query placeholder; switched via `?impl=` query param; see `PLAN.md` |
| 2026-05-13 | State layer implemented | `BoardContext` contract, `BoardPage` agnostic consumer, Redux + Zustand + TanStack stub providers; `?impl=` registry in App.tsx; Compare page wired; build passes |
| 2026-05-13 | WS lifecycle bug fixed | Prevented StrictMode cleanup from closing the active shared socket instance, restoring client→server event delivery |
| 2026-05-13 | Zustand DevTools wired | Added Zustand `devtools` middleware and unique store names so state changes appear in Redux DevTools |
| 2026-05-13 | TanStack Query implementation complete | `@tanstack/react-query@5.100.10` (pinned; router/start packages were compromised, react-query was not); `BoardProvider` uses `useQuery` as reactive cache subscriber + `setQueryData` for optimistic WS updates; `QueryClient` per instance for Compare mode isolation || 2026-05-14 | Comparison visualization built | 3-pane Compare page (redux/zustand/tanstack fixed layout); per-impl `ImplStatsBar` showing render count, action count, WS events, cache hits, round-trip latency; strengths & trade-offs profiles; module-level `metricsStore` singleton wired into all three providers |
| 2026-05-14 | Docker Compose added | `docker compose up --build` starts backend (port 3001) and frontend (port 80); multi-stage Nginx frontend build; `VITE_WS_URL` build arg for remote deployments |
---

## Switching Implementations

Add `?impl=<value>` to the URL — no rebuild required.

| `?impl=` value | Approach | Status |
|----------------|----------|--------|
| `redux` | Redux Toolkit + Reselect | Complete |
| `zustand` | Zustand + Immer | Complete |
| `tanstack` | TanStack Query | Complete |

Compare all three implementations side by side at `/compare`.

---

## Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-12 | Local Copilot skills over global | Skills scoped to `.copilot/skills/` in the repo to keep context minimal per build phase |
| 2026-05-12 | React Compiler v1.0 for memoization | No manual `React.memo`/`useMemo`/`useCallback` for optimization; compiler handles it automatically |
| 2026-05-12 | @vitejs/plugin-react pinned to v4 | v6 (Vite 8 default) dropped the babel option; v4 required for babel-plugin-react-compiler integration |
| 2026-05-12 | Backend: Bun + Express 5 + ws | Single file server; no framework overhead; ws chosen over socket.io for minimal footprint |
| 2026-05-12 | WS abstraction via hook contract not class interface | `WsClient` TS interface + `useWsClient()` hook is the DIP boundary; no classes; one shared socket in `WsProvider` for compare mode |
| 2026-05-13 | Redux Toolkit + Zustand as core implementations | Best philosophical contrast (centralized flux vs lightweight store); TanStack Query as optional third placeholder |
| 2026-05-13 | `BoardContextValue` interface as UI–state DIP boundary | UI never imports from any store library; all implementations satisfy one shared interface via `BoardProvider`; Open/Closed registry in `App.tsx` |
| 2026-05-13 | Keep shared WS client alive across dev StrictMode effect cycle | Effect cleanup in dev can run immediately after mount; deferred close + cancel-on-remount prevents accidental socket shutdown |
| 2026-05-13 | Use Redux DevTools extension for Zustand inspection | Zustand `devtools` middleware emits to the Redux DevTools protocol; no separate Zustand browser extension is required |
| 2026-05-14 | TanStack `BoardProvider` kept as a single file | No separate `store.ts` needed — `QueryClient` is a cache container with no extractable reducer/selector logic; all `setQueryData` calls are tightly coupled to WS event handlers |
| 2026-05-14 | Pin `@tanstack/react-query` to `5.100.10` | `@tanstack/router` and `@tanstack/start` packages were compromised in the Mini Shai-Hulud supply-chain attack (2026-05-11); `react-query` was not affected but version is pinned for auditability |
