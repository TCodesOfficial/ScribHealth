/**
 * Case-insensitive NODE_ENV check.
 *
 * Render env groups often get NODE_ENV set to "PRODUCTION" or "Production"
 * (human-typed), while npm/the platform convention is lowercase "production".
 * A single normalized check keeps strict CORS (main.ts) and secure
 * SameSite=None cookies (auth.ts) agreeing in every deployment.
 */
export function isProductionEnv(): boolean {
  return (process.env.NODE_ENV ?? "").trim().toLowerCase() === "production";
}
