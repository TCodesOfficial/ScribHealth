/**
 * Comma-separated list of allowed browser origins (e.g. the deployed SPA).
 * Read from the ALLOWED_ORIGINS environment variable.
 *
 * Example:
 *   ALLOWED_ORIGINS=https://scribhealth.vercel.app,https://app.example.com
 */
export function getAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
