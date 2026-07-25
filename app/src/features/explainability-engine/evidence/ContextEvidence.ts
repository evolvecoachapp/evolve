import { ExplanationEvidenceKinds } from "../models/ExplanationEvidence";
import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeEvidence } from "../utils/FreezeExplanationState";

export function buildContextEvidence(input: {
  readonly contextId: string;
  readonly athleteId: string;
  readonly focusAreaKeys: readonly string[];
}): readonly ExplanationEvidence[] {
  return Object.freeze([
    freezeEvidence({
      id: `evidence:context:${input.contextId}`,
      kind: ExplanationEvidenceKinds.CONTEXT,
      key: `context:${input.contextId}`,
      subjectId: input.contextId,
      sourceKey: input.contextId,
      valueKeys: Object.freeze([...input.focusAreaKeys]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
