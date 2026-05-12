import type { Card } from "./types.js";

// ---------------------------------------------------------------------------
// Singleton in-memory state
// All reads/writes go through boardService — do not import this directly
// from outside the service layer.
// ---------------------------------------------------------------------------

export interface AppState {
  /** cardId → Card */
  cards: Map<string, Card>;
  /** socketId → userName */
  connectedUsers: Map<string, string>;
}

export const state: AppState = {
  cards: new Map(),
  connectedUsers: new Map(),
};
