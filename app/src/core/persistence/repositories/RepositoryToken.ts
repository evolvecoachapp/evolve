/**
 * Canonical repository contract tokens.
 */
export const REPOSITORY_TOKENS = [
  "athlete",
  "identity",
  "workspace",
  "snapshot",
  "timeline",
  "plan",
  "workout",
  "nutrition",
  "recovery",
  "settings",
  "runtime",
] as const;

export type RepositoryToken = (typeof REPOSITORY_TOKENS)[number];

export function isRepositoryToken(value: string): value is RepositoryToken {
  return (REPOSITORY_TOKENS as readonly string[]).includes(value);
}
