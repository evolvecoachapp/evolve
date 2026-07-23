import type { AggregationResult } from "../models/AggregationResult";
import { EMPTY_SUPERVISOR_METADATA } from "../models/CoachSupervisorMetadata";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import { SupervisorConfidenceLevels } from "../models/SupervisorConfidence";
import type { UnifiedCoachResponse } from "../models/UnifiedCoachResponse";
import { freezeResponse } from "../utils/FreezeSupervisorState";

export function buildUnifiedCoachResponse(input: {
  readonly id: string;
  readonly request: CoachSupervisorRequest;
  readonly aggregation: AggregationResult;
  readonly createdAt: string;
}): UnifiedCoachResponse {
  const sections = Object.freeze(
    input.aggregation.summaries.map(
      (s) => `${s.agentId}: ${s.message ?? s.status}`,
    ),
  );
  const message =
    sections.length > 0
      ? `Unified coach response for "${input.request.intent}": ${sections.join(" | ")}`
      : `Unified coach response for "${input.request.intent}" (no specialist sections).`;

  const level =
    input.aggregation.success
      ? SupervisorConfidenceLevels.HIGH
      : SupervisorConfidenceLevels.LOW;

  return freezeResponse({
    id: input.id,
    requestId: input.request.id,
    message,
    sections,
    agentIds: Object.freeze([...input.aggregation.orderedAgentIds]),
    capabilityIds: Object.freeze(
      input.aggregation.summaries
        .map((s) => s.capabilityId)
        .filter((id): id is string => id != null),
    ),
    aggregation: input.aggregation,
    confidence: Object.freeze({
      level,
      score: input.aggregation.success ? 1 : 0,
      rationale: input.aggregation.message,
    }),
    reasoning: Object.freeze({
      summary: "Structural merge of specialist execution summaries.",
      steps: Object.freeze(["collect summaries", "merge sections", "respond"]),
      notes: Object.freeze([...input.aggregation.explanations]),
    }),
    diagnostics: input.aggregation.diagnostics,
    metadata: EMPTY_SUPERVISOR_METADATA,
    createdAt: input.createdAt,
    frozenAt: input.createdAt,
  });
}
