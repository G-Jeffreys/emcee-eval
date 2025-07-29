// Shared configuration values that are safe for both client and server
export const sharedConfig = {
  // Database
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/uber_template",
  
  // Server
  PORT: "3001",
  NODE_ENV: "development" as "development" | "production" | "test",
  
  // Client URLs
  CLIENT_URL: "http://localhost:3000",
  SERVER_URL: "http://localhost:3001",
  API_URL: "http://localhost:3001",
} as const;