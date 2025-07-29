// Main config export - just re-export from shared
import { sharedConfig } from './shared';

export * from './shared';

// Export structured configs for convenience
export const dbConfig = {
  url: sharedConfig.DATABASE_URL,
} as const;

export const serverConfig = {
  port: Number(sharedConfig.PORT),
  nodeEnv: sharedConfig.NODE_ENV,
  isDevelopment: sharedConfig.NODE_ENV === "development",
  isProduction: sharedConfig.NODE_ENV === "production",
  isTest: sharedConfig.NODE_ENV === "test",
} as const;

export const clientConfig = {
  url: sharedConfig.CLIENT_URL,
  serverUrl: sharedConfig.SERVER_URL,
  apiUrl: sharedConfig.API_URL,
} as const;