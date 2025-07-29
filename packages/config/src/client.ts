// Client-safe configuration
import { sharedConfig } from './shared';

export const clientConfig = {
  url: sharedConfig.CLIENT_URL,
  serverUrl: sharedConfig.SERVER_URL,
  apiUrl: sharedConfig.API_URL,
} as const;