/**
 * Structured coaching memory categories.
 *
 * Conversation Memory stores coaching knowledge — not chat history.
 */
export const MemoryCategories = {
  PROFILE: "profile",
  CONTEXT: "context",
  DECISION: "decision",
  PREFERENCE: "preference",
  GOAL: "goal",
  CONSTRAINT: "constraint",
  SUMMARY: "summary",
  SYSTEM: "system",
} as const;

export type MemoryCategory =
  (typeof MemoryCategories)[keyof typeof MemoryCategories];

export const ALL_MEMORY_CATEGORIES: readonly MemoryCategory[] = Object.freeze([
  MemoryCategories.PROFILE,
  MemoryCategories.CONTEXT,
  MemoryCategories.DECISION,
  MemoryCategories.PREFERENCE,
  MemoryCategories.GOAL,
  MemoryCategories.CONSTRAINT,
  MemoryCategories.SUMMARY,
  MemoryCategories.SYSTEM,
]);

/** Categories routed to Profile Memory. */
export const PROFILE_MEMORY_CATEGORIES: readonly MemoryCategory[] =
  Object.freeze([
    MemoryCategories.PROFILE,
    MemoryCategories.PREFERENCE,
    MemoryCategories.GOAL,
    MemoryCategories.CONSTRAINT,
  ]);

/** Categories routed to Context Memory. */
export const CONTEXT_MEMORY_CATEGORIES: readonly MemoryCategory[] =
  Object.freeze([MemoryCategories.CONTEXT, MemoryCategories.SUMMARY]);

/** Categories routed to Decision Memory. */
export const DECISION_MEMORY_CATEGORIES: readonly MemoryCategory[] =
  Object.freeze([MemoryCategories.DECISION, MemoryCategories.SYSTEM]);
