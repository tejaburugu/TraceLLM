import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { ChatController } from "./controllers/chat.controller.js";
import { ConversationController } from "./controllers/conversation.controller.js";
import { LogsController } from "./controllers/logs.controller.js";
import { AnalyticsController } from "./controllers/analytics.controller.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { sessionMiddleware } from "./middleware/session.js";
import { InMemoryConversationRepository } from "./repositories/conversation.repository.js";
import { createChatRouter } from "./routes/chat.routes.js";
import { createConversationRouter } from "./routes/conversation.routes.js";
import { createLogsRouter } from "./routes/logs.routes.js";
import { createAnalyticsRouter } from "./routes/analytics.routes.js";
import { ChatService } from "./services/chat.service.js";
import { ConversationService } from "./services/conversation.service.js";
import { LogsService } from "./services/logs.service.js";
import { AnalyticsService } from "./services/analytics.service.js";
import { ProviderRegistryService } from "./services/providerRegistry.service.js";

export function createApp() {
  const app = express();

  const repository = new InMemoryConversationRepository();
  const conversationService = new ConversationService(repository);
  const providerRegistry = new ProviderRegistryService();
  const chatService = new ChatService(conversationService, providerRegistry);
  const logsService = new LogsService();

  const chatController = new ChatController(chatService);
  const conversationController = new ConversationController(conversationService);
  const logsController = new LogsController(logsService);
  const analyticsService = new AnalyticsService();
  const analyticsController = new AnalyticsController(analyticsService);

  app.disable("x-powered-by");
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));
  app.use(sessionMiddleware);
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(createChatRouter(chatController));
  app.use(createConversationRouter(conversationController));
  app.use(createAnalyticsRouter(analyticsController));
  app.use("/api", createChatRouter(chatController));
  app.use("/api", createConversationRouter(conversationController));
  app.use("/api", createAnalyticsRouter(analyticsController));
  app.use("/logs", createLogsRouter(logsController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
