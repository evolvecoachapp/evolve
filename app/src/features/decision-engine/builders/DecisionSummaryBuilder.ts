import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionSummary } from "../models/DecisionSummary";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { formatDecisionHeadline } from "../utils/FormattingHelpers";
import { freezeSummary } from "../utils/FreezeDecisionState";

export function buildDecisionSummary(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly CoachingDecision[];
  readonly candidateCount: number;
  readonly conflictCount: number;
  readonly resolutionCount: number;
  readonly focusAreas: readonly string[];
}): DecisionSummary {
  const primary = input.decisions[0] ?? null;
  return freezeSummary({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    decisionCount: input.decisions.length,
    candidateCount: input.candidateCount,
    conflictCount: input.conflictCount,
    resolutionCount: input.resolutionCount,
    primaryCategory: primary?.category ?? null,
    headline: formatDecisionHeadline(input.decisions),
    focusAreas: Object.freeze([...input.focusAreas]),
    metadata: EMPTY_DECISION_METADATA,
  });
}
