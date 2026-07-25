import type { ContextSummary } from "../models/ContextSummary";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { formatContextHeadline } from "../utils/FormattingHelpers";
import { buildStatistics } from "../utils/StatisticsHelpers";
import { freezeSummary } from "../utils/FreezeContext";

export function buildContextSummary(input: {
  readonly context: UnifiedCoachingContext;
  readonly createdAt: string;
  readonly id?: string;
}): ContextSummary {
  const statistics = buildStatistics(input.context);
  const confidence = Object.freeze({
    level:
      statistics.sourceCount === 0
        ? ("unknown" as const)
        : statistics.sourceCount >= 6
          ? ("high" as const)
          : statistics.sourceCount >= 3
            ? ("medium" as const)
            : ("low" as const),
    sourceCount: statistics.sourceCount,
    resolvedConflictCount: input.context.resolutions.length,
    notes: Object.freeze([] as string[]),
  });
  return freezeSummary({
    id: input.id ?? `summary:${input.context.id}`,
    headline: formatContextHeadline(input.context),
    athleteId: input.context.athleteId,
    sessionId: input.context.sessionId,
    sourceLabels: Object.freeze(input.context.sources.map((s) => s.label)),
    statistics,
    confidence,
    notes: Object.freeze([] as string[]),
    createdAt: input.createdAt,
  });
}
