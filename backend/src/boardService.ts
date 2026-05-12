import { randomUUID } from "crypto";
import { state } from "./state.js";
import { ColumnId, type Card } from "./types.js";

// ---------------------------------------------------------------------------
// Board service — all mutations to card state live here
// ---------------------------------------------------------------------------

export const boardService = {
  getAllCards(): Card[] {
    return Array.from(state.cards.values());
  },

  createCard(fields: {
    title: string;
    description: string;
    assignee: string;
    columnId: ColumnId;
  }): Card {
    const card: Card = { id: randomUUID(), ...fields };
    state.cards.set(card.id, card);
    return card;
  },

  updateCard(fields: {
    id: string;
    title: string;
    description: string;
    assignee: string;
  }): Card | null {
    const existing = state.cards.get(fields.id);
    if (!existing) return null;
    const updated: Card = { ...existing, ...fields };
    state.cards.set(updated.id, updated);
    return updated;
  },

  moveCard(id: string, columnId: ColumnId): Card | null {
    const card = state.cards.get(id);
    if (!card) return null;
    card.columnId = columnId;
    return card;
  },

  deleteCard(id: string): boolean {
    return state.cards.delete(id);
  },
};
