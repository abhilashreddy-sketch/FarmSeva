import { UserRole, UserStatus } from '@farm-seva/shared';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        phone: string;
        role: UserRole | string;
        status: UserStatus | string;
      };
    }
  }
}
