import { Request } from 'express';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface LogContext {
  requestId?: string;
  userId?: string;
  userRole?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: any;
}

const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'otp',
  'jwt',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'cvv',
  'cardnumber',
  'bankaccount',
  'accountnumber',
  'upiid',
  'encryptionsecret',
];

/**
 * Sanitizes log metadata by redacting sensitive keys recursively.
 */
function sanitizeMeta(meta: any): any {
  if (meta === null || meta === undefined) return meta;
  if (typeof meta !== 'object') return meta;
  if (Array.isArray(meta)) return meta.map(sanitizeMeta);

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(meta)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeMeta(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export class Logger {
  private static formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ? sanitizeMeta(context) : {}),
    };
    return JSON.stringify(logEntry);
  }

  static info(message: string, context?: LogContext): void {
    console.log(this.formatLog('INFO', message, context));
  }

  static warn(message: string, context?: LogContext): void {
    console.warn(this.formatLog('WARN', message, context));
  }

  static error(message: string, error?: Error | any, context?: LogContext): void {
    const errorDetails = error
      ? {
          errorMessage: error.message || String(error),
          stack: error.stack,
          code: error.code,
        }
      : {};

    console.error(this.formatLog('ERROR', message, { ...context, ...errorDetails }));
  }

  static debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatLog('DEBUG', message, context));
    }
  }
}
