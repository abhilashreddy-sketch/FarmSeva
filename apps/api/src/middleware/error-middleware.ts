import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/api-response';

export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Sanitize sensitive fields in log output
  const safeMessage = typeof err?.message === 'string'
    ? err.message.replace(/password(=|:)\s*[^\s,]+/gi, 'password=[REDACTED]')
    : 'Unknown error';

  if (process.env.NODE_ENV !== 'production') {
    console.error('🔥 Global Error Handler:', safeMessage, err.stack || err);
  } else {
    console.error(`🔥 [${new Date().toISOString()}] Error ${err.code || 'INTERNAL_ERROR'}: ${safeMessage}`);
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'VALIDATION_ERROR', 'Invalid request payload', 400, formattedErrors);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'An unexpected error occurred';

  return sendError(res, err.code || 'INTERNAL_SERVER_ERROR', message, statusCode);
}
