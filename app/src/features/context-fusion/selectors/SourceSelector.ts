import type { ContextSource, ContextSourceKind } from "../models/ContextSource";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function selectSources(
  context: UnifiedCoachingContext,
): readonly ContextSource[] {
  return context.sources;
}

export function selectSourceByKind(
  context: UnifiedCoachingContext,
  kind: ContextSourceKind,
): ContextSource | null {
  return context.sources.find((s) => s.kind === kind) ?? null;
}
