/**
 * Scope of a memory entry within coaching orchestration.
 */
export const MemoryScopes = {
  SESSION: "session",
  CONVERSATION: "conversation",
  ATHLETE: "athlete",
  GLOBAL: "global",
} as const;

export type MemoryScope = (typeof MemoryScopes)[keyof typeof MemoryScopes];

export const ALL_MEMORY_SCOPES: readonly MemoryScope[] = Object.freeze([
  MemoryScopes.SESSION,
  MemoryScopes.CONVERSATION,
  MemoryScopes.ATHLETE,
  MemoryScopes.GLOBAL,
]);
