import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import { freezeEvidence } from "../utils/FreezeExplanationState";

export function applyEvidencePolicy(
  evidence: readonly ExplanationEvidence[],
): readonly ExplanationEvidence[] {
  return Object.freeze(evidence.filter((e) => e.key.length > 0).map(freezeEvidence));
}
