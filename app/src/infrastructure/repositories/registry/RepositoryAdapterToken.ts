/**
 * Canonical repository adapter tokens.
 * Aligns with Persistence Contract repository IDs backed by SQLite (Sprint 30.1).
 * Plan is a Persistence Contract only — no SQLite / adapter binding in this sprint.
 */
export const REPOSITORY_ADAPTER_TOKENS = [
  "athlete",
  "identity",
  "workspace",
  "snapshot",
  "timeline",
  "workout",
  "nutrition",
  "recovery",
  "settings",
  "runtime",
] as const;

export type RepositoryAdapterToken =
  (typeof REPOSITORY_ADAPTER_TOKENS)[number];

export function isRepositoryAdapterToken(
  value: string,
): value is RepositoryAdapterToken {
  return (REPOSITORY_ADAPTER_TOKENS as readonly string[]).includes(value);
}
