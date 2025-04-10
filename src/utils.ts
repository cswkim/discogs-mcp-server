import { z } from 'zod';

// Debug logging on stderr to avoid protocol confusion
export const log = {
  _log: (level: string, ...args: unknown[]): void => {
    const msg = `[${level} ${new Date().toISOString()}] ${args.join(' ')}\n`;
    process.stderr.write(msg);
  },

  info: (...args: unknown[]): void => {
    log._log('INFO', ...args);
  },

  debug: (...args: unknown[]): void => {
    log._log('DEBUG', ...args);
  },

  warn: (...args: unknown[]): void => {
    log._log('WARN', ...args);
  },

  error: (...args: unknown[]): void => {
    log._log('ERROR', ...args);
  },
};

/**
 * Custom Zod schema for a URL or empty string
 */
export const urlOrEmptySchema = () => {
  return z.string().refine((val) => val === '' || /^https?:\/\/.+/.test(val), {
    message: 'Must be a valid URL or empty string',
  });
};
