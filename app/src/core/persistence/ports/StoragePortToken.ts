/**
 * Canonical storage port contract tokens.
 */
export const STORAGE_PORT_TOKENS = [
  "storage-reader",
  "storage-writer",
  "storage-transaction",
  "storage-session",
  "storage-health",
  "storage-metadata",
  "storage-result",
] as const;

export type StoragePortToken = (typeof STORAGE_PORT_TOKENS)[number];

export function isStoragePortToken(value: string): value is StoragePortToken {
  return (STORAGE_PORT_TOKENS as readonly string[]).includes(value);
}
