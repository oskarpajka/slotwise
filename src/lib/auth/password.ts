import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 12;
// Better Auth's default upper bound. Kept here so Zod and Better Auth agree.
export const PASSWORD_MAX_LENGTH = 128;

// No composition rules, only length (SPEC section 5). Shared by
// owner:create, owner:reset-password and the Account page.
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH);
