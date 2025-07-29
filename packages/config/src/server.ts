// Server configuration (shared + secrets)
import { sharedConfig } from './shared.js';
import { secretConfig } from './secret.example.js';

export const config = {
  ...sharedConfig,
  ...secretConfig,
};