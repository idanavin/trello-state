---
name: trello-assignment-context
description: 'Full context for the Trello-State fullstack home assignment. Use when asked about assignment requirements, what is in scope, what is out of scope, evaluation criteria, deliverables, time budget, or what to build. Covers all constraints and goals of the kanban board comparison study assignment.'
---

# Trello-State Assignment Context

Complete reference for the fullstack home assignment requirements. Read this before making any architectural or feature decisions.

## What We Are Building

A **single-board real-time collaborative Kanban application** — a heavily simplified Trello clone. The Kanban app is the test bed; **the comparison study is the primary deliverable**.

## Required Functionality

- **3 fixed columns**: To Do, In Progress, Done
- **Cards** with: title, description, assignee (free-form string is fine)
- **Card operations**: create, edit, delete, move between columns
  - Move UI: simple button, dropdown, or click-to-move — **drag-and-drop is explicitly NOT required**
- **Real-time**: all card changes propagate to all connected clients over WebSockets
- **Presence**: visible indicator of which users are currently connected
- **Optimistic updates**: UI responds immediately before server confirmation

## Out of Scope — Do NOT Build

- Authentication, accounts, user management (localStorage name or query param is fine)
- Drag-and-drop
- Server-rejection handling / conflict resolution (assume server always accepts)
- Multiple boards or projects
- Persistence across server restarts (in-memory server state is acceptable)
- Mobile responsive design (desktop-only is fine)
- Polished visual design (clean and legible is enough)
- Comments, attachments, labels, due dates, or any extras

## The Comparison Study (Core Deliverable)

Implement the **client-side state layer 2–3 times** against the same UI and same backend, then write a design journal comparing them.

### Rules
- **2 or 3 approaches** — two done well beats three done shallowly
- Approaches must represent **meaningfully different philosophies** (not variations on a theme)
  - Example: Redux + RTK + Reselect is ONE philosophy — pairing it with something like it won't be accepted
- UI layer and backend client should be **shared across implementations** as much as possible
- Implementations must be **switchable** (build flag, route, env var — whatever is cleanest)
- We must be able to run each one

### Design Journal (JOURNAL.md)
- Write it **as you go**, not at the end
- Reflect on each approach while building it
- Close with an overall recommendation and reasoning
- Substance matters, not word count

## Backend

- Build it yourself, any framework/language/WebSocket library
- **In-memory state only** — no database required
- Keep it simple — it is plumbing, not what is evaluated
- Must start via `docker-compose up` OR a single `npm` command
- Document the WebSocket event protocol in README.md

## Deliverables

1. Public GitHub repository
2. Working application with all state implementations switchable
3. README: how to run, how to switch implementations, WebSocket event protocol
4. JOURNAL.md: design journal + final recommendation

## Time Budget

- **Target**: 6–9 hours
- **Hard ceiling**: 9 hours — if you hit it, stop and document the rest
- **Biggest mistake**: gold-plating one part (usually visuals or one implementation) at the expense of the comparison

## Evaluation Dimensions (by weight)

1. **Frontend craft** — taste a senior frontend engineer brings
2. **Real-time collaboration design** — handling multi-client async state
3. **Comparison study quality** — depth, honesty, usefulness
4. **Code quality** — readable, maintainable across all implementations
5. **Backend pragmatism** — runs cleanly, gets out of the way
6. **Documentation clarity** — an engineer joining next week could act on it

## Submission

- Push to a public GitHub repo
- Email repo link to LimitlessCNC contact with rough time spent
- A 45-minute live walkthrough follows: demo switching implementations, walk through journal, answer questions
- **The walkthrough matters as much as the artifact**
