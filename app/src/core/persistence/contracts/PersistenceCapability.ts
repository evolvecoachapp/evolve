/**
 * Supported persistence capability descriptors.
 * Descriptors only — no runtime probing, no storage I/O.
 */
export const PERSISTENCE_CAPABILITIES = [
  "read",
  "write",
  "delete",
  "query",
  "list",
  "transaction",
  "session",
  "health",
  "metadata",
  "batch",
] as const;

export type PersistenceCapability = (typeof PERSISTENCE_CAPABILITIES)[number];

export function isPersistenceCapability(
  value: string,
): value is PersistenceCapability {
  return (PERSISTENCE_CAPABILITIES as readonly string[]).includes(value);
}
