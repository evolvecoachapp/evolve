import type { ContextSection, ContextSectionKind } from "../models/ContextSection";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function selectSections(
  context: UnifiedCoachingContext,
): readonly ContextSection[] {
  return context.sections;
}

export function selectSectionsByKind(
  context: UnifiedCoachingContext,
  kind: ContextSectionKind,
): readonly ContextSection[] {
  return Object.freeze(context.sections.filter((s) => s.kind === kind));
}
