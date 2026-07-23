import {
  CONTEXT_MEMORY_CATEGORIES,
  DECISION_MEMORY_CATEGORIES,
  PROFILE_MEMORY_CATEGORIES,
  type MemoryCategory,
} from "../models/MemoryCategory";

export type MemoryLane = "profile" | "context" | "decision";

export function isProfileCategory(category: MemoryCategory): boolean {
  return (PROFILE_MEMORY_CATEGORIES as readonly string[]).includes(category);
}

export function isContextCategory(category: MemoryCategory): boolean {
  return (CONTEXT_MEMORY_CATEGORIES as readonly string[]).includes(category);
}

export function isDecisionCategory(category: MemoryCategory): boolean {
  return (DECISION_MEMORY_CATEGORIES as readonly string[]).includes(category);
}

/**
 * Resolve which memory lane owns a category (deterministic).
 */
export function resolveMemoryLane(category: MemoryCategory): MemoryLane {
  if (isProfileCategory(category)) return "profile";
  if (isContextCategory(category)) return "context";
  if (isDecisionCategory(category)) return "decision";
  return "context";
}
