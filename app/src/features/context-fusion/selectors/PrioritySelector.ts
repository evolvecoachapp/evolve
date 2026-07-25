import type { ContextPriority } from "../models/ContextPriority";
import type { ContextSourceKind } from "../models/ContextSource";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function selectPriorities(
  context: UnifiedCoachingContext,
): readonly ContextPriority[] {
  return context.priorities;
}

export function selectPriorityFor(
  context: UnifiedCoachingContext,
  kind: ContextSourceKind,
): ContextPriority | null {
  return context.priorities.find((p) => p.sourceKind === kind) ?? null;
}
