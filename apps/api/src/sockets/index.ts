import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { TimeStreamHandler } from './handlers/timeHandler.js';

export interface SocketServerOptions {
  corsOrigin?: string;
}

export function setupSocketServer(
  httpServer: HTTPServer,
  options: SocketServerOptions = {}
): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: options.corsOrigin ?? "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Initialize handlers
  const timeHandler = new TimeStreamHandler();

  // Handle connections
  io.on('connection', (socket) => {
    console.log('Socket.IO client connected:', socket.id);
    
    // Register handlers
    timeHandler.handleConnection(socket);
    
    // You can add more handlers here as your app grows
    // Example:
    // chatHandler.handleConnection(socket);
    // notificationHandler.handleConnection(socket);
  });

  return io;
}

// Export types that might be useful elsewhere
export type { TimeData } from './handlers/timeHandler.js';