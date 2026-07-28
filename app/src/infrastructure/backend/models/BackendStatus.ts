/**
 * Immutable backend provider / request status descriptors.
 */
export const BACKEND_STATUSES = [
  "ready",
  "unavailable",
  "degraded",
  "unknown",
] as const;

export type BackendStatus = (typeof BACKEND_STATUSES)[number];

export function isBackendStatus(value: string): value is BackendStatus {
  return (BACKEND_STATUSES as readonly string[]).includes(value);
}
