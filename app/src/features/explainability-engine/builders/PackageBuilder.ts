import type { CoachingExplanation } from "../models/CoachingExplanation";
import type { ExplanationPackage } from "../models/ExplanationPackage";
import type { ExplanationSummary } from "../models/ExplanationSummary";
import type { ExplanationGraph } from "../models/ExplanationGraph";
import type { ExplanationTrace } from "../models/ExplanationTrace";
import type { ExplanationTimeline } from "../models/ExplanationTimeline";
import type { LLMFormatterInput } from "../models/LLMFormatterInput";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezePackage } from "../utils/FreezeExplanationState";

export function buildExplanationPackage(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanations: readonly CoachingExplanation[];
  readonly summary: ExplanationSummary | null;
  readonly snapshot: ExplanationPackage["snapshot"];
  readonly graph: ExplanationGraph | null;
  readonly trace: ExplanationTrace | null;
  readonly timeline: ExplanationTimeline | null;
  readonly llmFormatterInput: LLMFormatterInput | null;
  readonly at: string;
}): ExplanationPackage {
  const byCategory: Record<string, number> = {};
  const byReasonCode: Record<string, number> = {};
  let evidenceCount = 0;
  for (const e of input.explanations) {
    byCategory[e.recommendationLink.category] = (byCategory[e.recommendationLink.category] ?? 0) + 1;
    evidenceCount += e.evidence.length;
    for (const r of e.reasons) byReasonCode[r.code] = (byReasonCode[r.code] ?? 0) + 1;
  }
  return freezePackage({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    explanations: input.explanations,
    summary: input.summary,
    snapshot: input.snapshot,
    graph: input.graph,
    trace: input.trace,
    timeline: input.timeline,
    statistics: Object.freeze({ totalExplanations: input.explanations.length, byCategory: Object.freeze(byCategory), byReasonCode: Object.freeze(byReasonCode), evidenceCount }),
    diagnostics: Object.freeze({ notes: Object.freeze(["explainability pipeline complete"]), warnings: Object.freeze([]), processingSteps: Object.freeze(["resolve_inputs", "gather_evidence", "build_reasoning", "build_traces", "build_explanations", "build_graph", "package"]) }),
    llmFormatterInput: input.llmFormatterInput,
    dependencies: Object.freeze([]),
    constraints: Object.freeze([]),
    conflicts: Object.freeze([]),
    resolutions: Object.freeze([]),
    metadata: EMPTY_EXPLANATION_METADATA,
    createdAt: input.at,
  });
}
