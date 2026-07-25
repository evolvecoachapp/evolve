import type { ContextStatistics } from "../models/ContextStatistics";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function buildStatistics(
  context: Pick<
    UnifiedCoachingContext,
    | "sources"
    | "sections"
    | "dependencies"
    | "conflicts"
    | "resolutions"
    | "timeline"
  >,
): ContextStatistics {
  return Object.freeze({
    sourceCount: context.sources.length,
    sectionCount: context.sections.length,
    dependencyCount: context.dependencies.length,
    conflictCount: context.conflicts.length,
    resolutionCount: context.resolutions.length,
    timelineItemCount: context.timeline.items.length,
  });
}
