// ---------------------------------------------------------------------------
// Domain enums
// ---------------------------------------------------------------------------

export enum ColumnId {
  Todo = "todo",
  InProgress = "in-progress",
  Done = "done",
}

// ---------------------------------------------------------------------------
// Domain interfaces
// ---------------------------------------------------------------------------

export interface Card {
  id: string;
  title: string;
  description: string;
  assignee: string;
  columnId: ColumnId;
}

// ---------------------------------------------------------------------------
// Client → Server message types
// ---------------------------------------------------------------------------

export enum ClientEventType {
  UserJoin = "user:join",
  CardCreate = "card:create",
  CardUpdate = "card:update",
  CardMove = "card:move",
  CardDelete = "card:delete",
}

export interface UserJoinMessage {
  type: ClientEventType.UserJoin;
  userName: string;
}

export interface CardCreateMessage {
  type: ClientEventType.CardCreate;
  title: string;
  description: string;
  assignee: string;
  columnId: ColumnId;
}

export interface CardUpdateMessage {
  type: ClientEventType.CardUpdate;
  id: string;
  title: string;
  description: string;
  assignee: string;
}

export interface CardMoveMessage {
  type: ClientEventType.CardMove;
  id: string;
  columnId: ColumnId;
}

export interface CardDeleteMessage {
  type: ClientEventType.CardDelete;
  id: string;
}

export type ClientMessage =
  | UserJoinMessage
  | CardCreateMessage
  | CardUpdateMessage
  | CardMoveMessage
  | CardDeleteMessage;

// ---------------------------------------------------------------------------
// Server → Client message types
// ---------------------------------------------------------------------------

export enum ServerEventType {
  BoardInit = "board:init",
  CardCreated = "card:created",
  CardUpdated = "card:updated",
  CardMoved = "card:moved",
  CardDeleted = "card:deleted",
  PresenceUpdate = "presence:update",
}

export interface BoardInitMessage {
  type: ServerEventType.BoardInit;
  cards: Card[];
  users: string[];
}

export interface CardCreatedMessage {
  type: ServerEventType.CardCreated;
  card: Card;
}

export interface CardUpdatedMessage {
  type: ServerEventType.CardUpdated;
  card: Card;
}

export interface CardMovedMessage {
  type: ServerEventType.CardMoved;
  id: string;
  columnId: ColumnId;
}

export interface CardDeletedMessage {
  type: ServerEventType.CardDeleted;
  id: string;
}

export interface PresenceUpdateMessage {
  type: ServerEventType.PresenceUpdate;
  users: string[];
}

export type ServerMessage =
  | BoardInitMessage
  | CardCreatedMessage
  | CardUpdatedMessage
  | CardMovedMessage
  | CardDeletedMessage
  | PresenceUpdateMessage;
