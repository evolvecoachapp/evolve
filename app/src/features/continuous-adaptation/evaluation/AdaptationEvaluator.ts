import type { AdaptationCandidate } from "../models/AdaptationCandidate";
import type { AdaptationEvaluation } from "../models/AdaptationEvaluation";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationOpportunity } from "../models/AdaptationOpportunity";
import type { AdaptationTrigger } from "../models/AdaptationTrigger";
import { priorityForOrdinal } from "../models/AdaptationPriority";
import { severityForSignalCount } from "../models/AdaptationSeverity";
import { freezeEvaluation } from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";
import { evaluateConsistencyOrdinal } from "./ConsistencyEvaluator";
import { evaluateDependencyCount } from "./DependencyEvaluator";
import { evaluateRiskOrdinal } from "./RiskEvaluator";

export function evaluateAdaptationSignals(input: {
  readonly subjectId: string;
  readonly triggers: readonly AdaptationTrigger[];
  readonly candidates: readonly AdaptationCandidate[];
  readonly opportunities: readonly AdaptationOpportunity[];
  readonly dependencyFromIds: readonly string[];
}): AdaptationEvaluation {
  const presentTriggers = input.triggers.filter((t) => t.present);
  const signalKeys = uniqueSorted([
    ...presentTriggers.map((t) => t.signalKey),
    ...input.candidates.flatMap((c) => c.signalKeys),
    ...input.opportunities.flatMap((o) => o.signalKeys),
  ]);
  const priority = priorityForOrdinal(Math.min(3, presentTriggers.length === 0 ? 3 : presentTriggers.length - 1));
  const severity = severityForSignalCount(signalKeys.length);
  return freezeEvaluation({
    id: `eval:${input.subjectId}`,
    subjectId: input.subjectId,
    priority,
    severity,
    riskOrdinal: evaluateRiskOrdinal(severity.ordinal, presentTriggers.length),
    consistencyOrdinal: evaluateConsistencyOrdinal(presentTriggers.length, input.candidates.length),
    dependencyCount: evaluateDependencyCount(input.dependencyFromIds),
    signalKeys,
    metadata: EMPTY_ADAPTATION_METADATA,
  });
}
