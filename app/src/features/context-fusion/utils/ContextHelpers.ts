import type { ContextContribution } from "../models/ContextContribution";
import type { ContextSourceKind } from "../models/ContextSource";
import type { ContextSlice } from "../models/ContextSlice";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function mergeUniqueStrings(
  ...lists: readonly (readonly string[])[]
): readonly string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    for (const item of list) {
      if (!seen.has(item)) {
        seen.add(item);
        out.push(item);
      }
    }
  }
  return Object.freeze(out);
}

export function mergeFacts(
  ...bags: readonly Readonly<
    Record<string, string | number | boolean | null>
  >[]
): Readonly<Record<string, string | number | boolean | null>> {
  const out: Record<string, string | number | boolean | null> = {};
  for (const bag of bags) {
    for (const [k, v] of Object.entries(bag)) {
      out[k] = v;
    }
  }
  return Object.freeze(out);
}

export function contributionsByKind(
  contributions: readonly ContextContribution[],
  kind: ContextSourceKind,
): readonly ContextContribution[] {
  return Object.freeze(contributions.filter((c) => c.sourceKind === kind));
}

export function sliceForKind(
  context: UnifiedCoachingContext,
  kind: ContextSourceKind,
): ContextSlice | null {
  switch (kind) {
    case "conversation":
      return context.conversation;
    case "session":
      return context.session;
    case "athlete":
      return context.athlete;
    case "workout":
      return context.workout;
    case "nutrition":
      return context.nutrition;
    case "recovery":
      return context.recovery;
    case "goal":
      return context.goal;
    case "supervisor":
      return context.supervisor;
    default:
      return null;
  }
}

export function withSlice(
  context: UnifiedCoachingContext,
  kind: ContextSourceKind,
  slice: ContextSlice | null,
): UnifiedCoachingContext {
  switch (kind) {
    case "conversation":
      return { ...context, conversation: slice };
    case "session":
      return { ...context, session: slice };
    case "athlete":
      return { ...context, athlete: slice };
    case "workout":
      return { ...context, workout: slice };
    case "nutrition":
      return { ...context, nutrition: slice };
    case "recovery":
      return { ...context, recovery: slice };
    case "goal":
      return { ...context, goal: slice };
    case "supervisor":
      return { ...context, supervisor: slice };
    default:
      return context;
  }
}
