export const logger = {
  info: (message: string, ...args: unknown[]): void => {
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message: string, error?: unknown): void => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, ...args: unknown[]): void => {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};
