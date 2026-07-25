import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import type { CoachingExplanation } from "../models/CoachingExplanation";

export function selectEvidenceByKind(
  explanation: CoachingExplanation,
  kind: ExplanationEvidence["kind"],
): readonly ExplanationEvidence[] {
  return Object.freeze(explanation.evidence.filter((e) => e.kind === kind));
}
