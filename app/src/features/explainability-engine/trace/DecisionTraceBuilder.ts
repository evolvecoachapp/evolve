import type { CoachingDecision } from "../../decision-engine/models/CoachingDecision";
import type { ExplanationTrace } from "../models/ExplanationTrace";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { createTraceStep } from "../utils/TraceHelpers";
import { freezeTrace } from "../utils/FreezeExplanationState";

export function buildDecisionTrace(input: {
  readonly decision: CoachingDecision;
  readonly at: string;
}): ExplanationTrace {
  return freezeTrace({
    id: `trace:decision:${input.decision.id}`,
    steps: Object.freeze([
      createTraceStep({ id: `step:decision:load:${input.decision.id}`, operation: "load_decision", subjectId: input.decision.id, outputKeys: Object.freeze([input.decision.id]) }),
      createTraceStep({ id: `step:decision:reason:${input.decision.id}`, operation: "derive_reasons", subjectId: input.decision.id, inputKeys: Object.freeze([input.decision.id]) }),
    ]),
    subjectId: input.decision.id,
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}
