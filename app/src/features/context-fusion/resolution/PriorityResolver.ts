import {
  DEFAULT_CONTEXT_PRIORITIES,
  type ContextPriority,
} from "../models/ContextPriority";
import type { ContextSourceKind } from "../models/ContextSource";
import { freezePriority } from "../utils/FreezeContext";

export function resolvePriorities(
  overrides: readonly ContextPriority[] = [],
): readonly ContextPriority[] {
  const map = new Map<ContextSourceKind, ContextPriority>();
  for (const p of DEFAULT_CONTEXT_PRIORITIES) {
    map.set(p.sourceKind, freezePriority(p));
  }
  for (const p of overrides) {
    map.set(p.sourceKind, freezePriority(p));
  }
  return Object.freeze(
    [...map.values()].sort((a, b) => a.rank - b.rank),
  );
}

export function rankForSource(
  priorities: readonly ContextPriority[],
  kind: ContextSourceKind,
): number {
  return priorities.find((p) => p.sourceKind === kind)?.rank ?? 999;
}

export function preferSource(
  priorities: readonly ContextPriority[],
  a: ContextSourceKind,
  b: ContextSourceKind,
): ContextSourceKind {
  return rankForSource(priorities, a) <= rankForSource(priorities, b) ? a : b;
}
