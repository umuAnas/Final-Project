import rateLimit from "express-rate-limit";

const authLimiterOptions = {
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
  },
};

export const loginRateLimit = rateLimit({
  ...authLimiterOptions,
  message: {
    message: "Too many login attempts, please try again later",
  },
});

export const forgotPasswordRateLimit = rateLimit({
  ...authLimiterOptions,
  message: {
    message: "Too many forgot password attempts, please try again later",
  },
});

export const resetPasswordRateLimit = rateLimit({
  ...authLimiterOptions,
  message: {
    message: "Too many reset password attempts, please try again later",
  },
});

export const updatePasswordRateLimit = rateLimit({
  ...authLimiterOptions,
  message: {
    message: "Too many update password attempts, please try again later",
  },
});
