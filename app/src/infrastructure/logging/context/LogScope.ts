/**
 * Canonical log scopes (context domains).
 * Representation only — no business logic.
 */
export const LOG_SCOPES = [
  "Workout",
  "Nutrition",
  "Recovery",
  "Coach",
  "Synchronization",
  "Authentication",
  "Backend",
  "Application",
] as const;

export type LogScope = (typeof LOG_SCOPES)[number];

export function isLogScope(value: string): value is LogScope {
  return (LOG_SCOPES as readonly string[]).includes(value);
}
