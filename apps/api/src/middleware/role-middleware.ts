import { Request, Response, NextFunction } from 'express';
import { UserRole, UserStatus } from '@farm-seva/shared';
import { sendError } from '../utils/api-response';

/**
 * Middleware enforcing Role-Based Access Control (RBAC).
 * ADMIN role bypasses specific role restrictions unless explicitly forbidden.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
    }

    const { role } = req.user;

    if (allowedRoles.includes(role as UserRole) || role === UserRole.ADMIN) {
      return next();
    }

    return sendError(
      res,
      'AUTH_FORBIDDEN',
      `Role '${role}' is not authorized to access this resource. Required roles: [${allowedRoles.join(', ')}]`,
      403
    );
  };
}

/**
 * Middleware ensuring account is ACTIVE.
 * Blocks PENDING_VERIFICATION sellers/experts from active operations.
 */
export function requireActiveStatus(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
  }

  if (req.user.status === UserStatus.PENDING_VERIFICATION) {
    return sendError(res, 'AUTH_ACCOUNT_PENDING', 'Account verification pending admin approval', 403);
  }

  if (req.user.status !== UserStatus.ACTIVE) {
    return sendError(res, 'AUTH_ACCOUNT_NOT_ACTIVE', 'Account status is not active', 403);
  }

  next();
}

/**
 * Middleware enforcing Resource Ownership.
 * Prevents User A from viewing/modifying User B's resources.
 */
export function checkResourceOwnership(paramName = 'userId') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'AUTH_UNAUTHORIZED', 'Authentication required', 401);
    }

    const targetUserId = req.params[paramName] || req.body[paramName];
    const currentUserId = req.user.userId;
    const currentUserRole = req.user.role;

    // Admin and Call Center Agents can operate on behalf of users in assisted flows
    if (currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.CALL_CENTER_AGENT) {
      return next();
    }

    if (!targetUserId || targetUserId !== currentUserId) {
      return sendError(
        res,
        'AUTH_OWNERSHIP_DENIED',
        'Unauthorized: You can only view or modify your own resources',
        403
      );
    }

    next();
  };
}
