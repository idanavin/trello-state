// ---------------------------------------------------------------------------
// WebSocket message types — mirrored from backend/src/types.ts
// Keep in sync with the server contract.
// ---------------------------------------------------------------------------

import type { ColumnId } from '../types'

// ---------------------------------------------------------------------------
// Client → Server
// ---------------------------------------------------------------------------

export const ClientEventType = {
  UserJoin: 'user:join',
  CardCreate: 'card:create',
  CardUpdate: 'card:update',
  CardMove: 'card:move',
  CardDelete: 'card:delete',
} as const

export type ClientEventType = (typeof ClientEventType)[keyof typeof ClientEventType]

export interface UserJoinMessage {
  type: typeof ClientEventType.UserJoin
  userName: string
}

export interface CardCreateMessage {
  type: typeof ClientEventType.CardCreate
  title: string
  description: string
  assignee: string
  columnId: ColumnId
}

export interface CardUpdateMessage {
  type: typeof ClientEventType.CardUpdate
  id: string
  title: string
  description: string
  assignee: string
}

export interface CardMoveMessage {
  type: typeof ClientEventType.CardMove
  id: string
  columnId: ColumnId
}

export interface CardDeleteMessage {
  type: typeof ClientEventType.CardDelete
  id: string
}

export type ClientMessage =
  | UserJoinMessage
  | CardCreateMessage
  | CardUpdateMessage
  | CardMoveMessage
  | CardDeleteMessage

// ---------------------------------------------------------------------------
// Server → Client
// ---------------------------------------------------------------------------

export const ServerEventType = {
  BoardInit: 'board:init',
  CardCreated: 'card:created',
  CardUpdated: 'card:updated',
  CardMoved: 'card:moved',
  CardDeleted: 'card:deleted',
  PresenceUpdate: 'presence:update',
} as const

export type ServerEventType = (typeof ServerEventType)[keyof typeof ServerEventType]

import type { Card } from '../types'

export interface BoardInitMessage {
  type: typeof ServerEventType.BoardInit
  cards: Card[]
  users: string[]
}

export interface CardCreatedMessage {
  type: typeof ServerEventType.CardCreated
  card: Card
}

export interface CardUpdatedMessage {
  type: typeof ServerEventType.CardUpdated
  card: Card
}

export interface CardMovedMessage {
  type: typeof ServerEventType.CardMoved
  id: string
  columnId: ColumnId
}

export interface CardDeletedMessage {
  type: typeof ServerEventType.CardDeleted
  id: string
}

export interface PresenceUpdateMessage {
  type: typeof ServerEventType.PresenceUpdate
  users: string[]
}

export type ServerMessage =
  | BoardInitMessage
  | CardCreatedMessage
  | CardUpdatedMessage
  | CardMovedMessage
  | CardDeletedMessage
  | PresenceUpdateMessage
