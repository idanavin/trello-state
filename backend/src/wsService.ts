import { randomUUID } from "crypto";
import { createServer, type Server as HttpServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { boardService } from "./boardService.js";
import { logger } from "./logger.js";
import { state } from "./state.js";
import {
  ClientEventType,
  ServerEventType,
  type ClientMessage,
  type ServerMessage,
} from "./types.js";

const CTX = "wsService";

// ---------------------------------------------------------------------------
// WebSocket service
// Owns the WS server lifecycle and all client subscriptions.
// ---------------------------------------------------------------------------

function send(ws: WebSocket, message: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcast(wss: WebSocketServer, message: ServerMessage): void {
  const payload = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function handleMessage(
  wss: WebSocketServer,
  socketId: string,
  ws: WebSocket,
  raw: string
): void {
  let message: ClientMessage;
  try {
    message = JSON.parse(raw) as ClientMessage;
  } catch {
    logger.warn(CTX, "Discarded malformed message", { socketId });
    return;
  }

  logger.info(CTX, "Received message", { socketId, type: message.type });

  switch (message.type) {
    case ClientEventType.UserJoin: {
      state.connectedUsers.set(socketId, message.userName);
      logger.info(CTX, "User joined", { socketId, userName: message.userName, totalUsers: state.connectedUsers.size });
      send(ws, {
        type: ServerEventType.BoardInit,
        cards: boardService.getAllCards(),
        users: Array.from(state.connectedUsers.values()),
      });
      broadcast(wss, {
        type: ServerEventType.PresenceUpdate,
        users: Array.from(state.connectedUsers.values()),
      });
      break;
    }

    case ClientEventType.CardCreate: {
      const card = boardService.createCard({
        title: message.title,
        description: message.description,
        assignee: message.assignee,
        columnId: message.columnId,
      });
      logger.info(CTX, "Card created", { cardId: card.id, title: card.title, columnId: card.columnId });
      broadcast(wss, { type: ServerEventType.CardCreated, card });
      break;
    }

    case ClientEventType.CardUpdate: {
      const card = boardService.updateCard({
        id: message.id,
        title: message.title,
        description: message.description,
        assignee: message.assignee,
      });
      if (card) {
        logger.info(CTX, "Card updated", { cardId: card.id, title: card.title });
        broadcast(wss, { type: ServerEventType.CardUpdated, card });
      } else {
        logger.warn(CTX, "Card update failed — not found", { cardId: message.id });
      }
      break;
    }

    case ClientEventType.CardMove: {
      const card = boardService.moveCard(message.id, message.columnId);
      if (card) {
        logger.info(CTX, "Card moved", { cardId: message.id, columnId: message.columnId });
        broadcast(wss, {
          type: ServerEventType.CardMoved,
          id: message.id,
          columnId: message.columnId,
        });
      } else {
        logger.warn(CTX, "Card move failed — not found", { cardId: message.id });
      }
      break;
    }

    case ClientEventType.CardDelete: {
      boardService.deleteCard(message.id);
      logger.info(CTX, "Card deleted", { cardId: message.id });
      broadcast(wss, { type: ServerEventType.CardDeleted, id: message.id });
      break;
    }
  }
}

function handleDisconnect(wss: WebSocketServer, socketId: string): void {
  const userName = state.connectedUsers.get(socketId);
  state.connectedUsers.delete(socketId);
  logger.info(CTX, "Client disconnected", { socketId, userName, remainingUsers: state.connectedUsers.size });
  broadcast(wss, {
    type: ServerEventType.PresenceUpdate,
    users: Array.from(state.connectedUsers.values()),
  });
}

export function attachWebSocketService(httpServer: HttpServer): void {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws) => {
    const socketId = randomUUID();
    logger.info(CTX, "Client connected", { socketId, totalClients: wss.clients.size });

    // board:init is sent in response to user:join (after the client has set up listeners)

    ws.on("message", (raw) => handleMessage(wss, socketId, ws, raw.toString()));
    ws.on("close", () => handleDisconnect(wss, socketId));
  });
}
