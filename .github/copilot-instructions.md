# GitHub Copilot Instructions — Trello-State Assignment

## Project Context
Fullstack home assignment: a Trello-like kanban board application.
Track every step carefully — this is a timed assignment being evaluated.

---

## Progress Documentation Rule
After **every major milestone** (feature complete, architecture decision, phase done, bug fixed):

1. Add a row to the **Progress** table in `README.md`
   - One line only: date | milestone | brief note
   - Keep language direct and factual, no fluff
2. Add a row to `HOURS.md` with time spent and the running total
3. If a key architectural or technical decision was made, add it under **Decisions** in `README.md`

> A "major milestone" is: completing a feature, finishing a phase, resolving a blocker, or any significant design choice.

---

## README Guidelines
- **One sentence max** per progress entry
- Use the existing Markdown table format — do not change the table structure
- Keep the whole README under 150 lines
- Do not add marketing language or excessive explanation

---

## Hours Tracking Guidelines
- Log every work session in `HOURS.md`, even short ones
- Format: `YYYY-MM-DD | Milestone | Hours | Cumulative`
- Round to nearest 0.5h
- Never edit or remove past rows — only append

---

## Code Conventions
- Prefer simple, readable code over clever abstractions
- No premature optimization
- Keep functions small and single-purpose
- Name things clearly — no abbreviations in variable/function names
- Always handle error states explicitly

---

## Git & Structure
- Commit after every meaningful unit of work
- Commit messages: `feat:`, `fix:`, `refactor:`, `docs:`, `test:` prefixes
- Do not commit `.env` files or secrets

---

## Testing
- Write at least one test per new feature or endpoint
- Test the happy path and one error case minimum

---

## When Adding New Files
- Check if a similar file/module already exists before creating one
- Document any new environment variables in `README.md` under **Setup**

---

## Skills (Local)

Project-specific skills live in `.copilot/skills/`. Load them with `read_file` when relevant:

| Skill | File | When to use |
|-------|------|-------------|
| `trello-assignment-context` | `.copilot/skills/trello-assignment-context/SKILL.md` | Requirements, scope, evaluation criteria |
| `trello-frontend-components` | `.copilot/skills/trello-frontend-components/SKILL.md` | Building/reviewing UI components |
| `trello-state-management` | `.copilot/skills/trello-state-management/SKILL.md` | State approach decisions, WS integration per impl |
| `trello-backend-structure` | `.copilot/skills/trello-backend-structure/SKILL.md` | Backend data model, WebSocket event protocol |
