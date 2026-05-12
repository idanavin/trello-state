import cors from "cors";
import express from "express";
import { createServer } from "http";
import { logger } from "./logger.js";
import { attachWebSocketService } from "./wsService.js";
import router from "./routes.js";

const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:5173"];

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

export function createApp() {
  const app = express();
  app.use(cors({ origin: ALLOWED_ORIGINS }));
  app.use(express.json());
  app.use(router);
  return app;
}

export function startServer(): void {
  const app = createApp();
  const httpServer = createServer(app);

  attachWebSocketService(httpServer);

  httpServer.listen(PORT, () => {
    logger.info("server", "Backend started", {
      http: `http://localhost:${PORT}`,
      ws: `ws://localhost:${PORT}`,
      allowedOrigins: ALLOWED_ORIGINS,
    });
  });
}
