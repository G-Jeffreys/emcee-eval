// Load environment variables first
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '../../.env') });

import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { createServer } from 'http';
import { errorHandler } from "./middleware/errorHandler.js";
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './routes/trpc.js';
import { setupSocketServer } from './sockets/index.js';
import { serverConfig, clientConfig } from '@repo/config';

const app: Express = express();
const port = serverConfig.port;

// Security and performance middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// tRPC API setup
app.use(
  '/api/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);


// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware (must be last)
app.use(errorHandler);




if (!serverConfig.isTest) {
  // Create HTTP server for both Express and Socket.IO
  const server = createServer(app);
  
  // Setup Socket.IO with organized handlers
  setupSocketServer(server, {
    corsOrigin: clientConfig.url
  });

  server.listen(port, () => {
    console.log(`Server running on port ${String(port)}`);
    console.log(`Socket.IO server ready for streaming`);
  });
}

export default app;
export type { AppRouter } from './routes/trpc.js';
