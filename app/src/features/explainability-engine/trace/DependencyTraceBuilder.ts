import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";
import type { ExplanationTrace } from "../models/ExplanationTrace";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { createTraceStep } from "../utils/TraceHelpers";
import { freezeTrace } from "../utils/FreezeExplanationState";

export function buildDependencyTrace(input: {
  readonly recommendation: CoachingRecommendation;
  readonly at: string;
}): ExplanationTrace {
  const depIds = input.recommendation.dependencies.map((d) => d.id);
  return freezeTrace({
    id: `trace:dep:${input.recommendation.id}`,
    steps: Object.freeze([
      createTraceStep({ id: `step:dep:resolve:${input.recommendation.id}`, operation: "resolve_dependencies", subjectId: input.recommendation.id, inputKeys: Object.freeze(depIds), outputKeys: Object.freeze(depIds) }),
    ]),
    subjectId: input.recommendation.id,
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}
