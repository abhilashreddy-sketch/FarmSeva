import rateLimit from 'express-rate-limit';

const isTestMode = () => process.env.NODE_ENV === 'test';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestMode() && process.env.ENABLE_RATE_LIMIT_TEST !== 'true',
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again after 15 minutes',
    },
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestMode() && process.env.ENABLE_RATE_LIMIT_TEST !== 'true',
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
    },
  },
});

export const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 checkout/payment requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestMode() && process.env.ENABLE_RATE_LIMIT_TEST !== 'true',
  message: {
    success: false,
    error: {
      code: 'CHECKOUT_RATE_LIMIT_EXCEEDED',
      message: 'Too many checkout attempts, please try again later',
    },
  },
});
