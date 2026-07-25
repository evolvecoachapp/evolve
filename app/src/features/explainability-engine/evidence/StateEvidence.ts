import { ExplanationEvidenceKinds } from "../models/ExplanationEvidence";
import type { ExplanationEvidence } from "../models/ExplanationEvidence";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeEvidence } from "../utils/FreezeExplanationState";

export function buildStateEvidence(input: {
  readonly athleteId: string;
  readonly present: boolean;
}): readonly ExplanationEvidence[] {
  return Object.freeze([
    freezeEvidence({
      id: `evidence:state:${input.athleteId}`,
      kind: ExplanationEvidenceKinds.STATE,
      key: `state:${input.athleteId}`,
      subjectId: input.athleteId,
      sourceKey: input.athleteId,
      valueKeys: Object.freeze([input.present ? "present" : "absent"]),
      metadata: EMPTY_EXPLANATION_METADATA,
    }),
  ]);
}
