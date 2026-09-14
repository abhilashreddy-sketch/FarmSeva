import { UserRole, UserStatus } from '@farm-seva/shared';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        phone?: string | null;
        email?: string | null;
        role: UserRole | string;
        status: UserStatus | string;
      };
    }
  }
}
