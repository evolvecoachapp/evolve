import type { ExplanationEvidence } from "../models/ExplanationEvidence";

export function evidenceKeys(evidence: readonly ExplanationEvidence[]): readonly string[] {
  return Object.freeze(evidence.map((e) => e.key));
}
