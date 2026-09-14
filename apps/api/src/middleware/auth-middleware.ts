import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth-utils';
import { sendError } from '../utils/api-response';
import { PrismaClient } from '@prisma/client';
import { UserStatus } from '@farm-seva/shared';

const prisma = new PrismaClient();

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication token required', 401);
    }

    const decoded = verifyAccessToken(token);

    // Verify user status directly from Database to catch real-time suspensions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, phone: true, email: true, role: true, status: true },
    });

    if (!user) {
      return sendError(res, 'AUTH_USER_NOT_FOUND', 'User account no longer exists', 401);
    }

    if (user.status === UserStatus.SUSPENDED) {
      return sendError(res, 'AUTH_ACCOUNT_SUSPENDED', 'Account suspended. Please contact support.', 403);
    }

    if (user.status === UserStatus.DEACTIVATED || user.status === UserStatus.REJECTED) {
      return sendError(res, 'AUTH_ACCOUNT_INACTIVE', 'Account inactive or rejected', 403);
    }

    req.user = {
      userId: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'AUTH_TOKEN_EXPIRED', 'Access token has expired', 401);
    }
    return sendError(res, 'AUTH_INVALID_TOKEN', 'Invalid authentication token', 401);
  }
}
