import type { CoachingExplanation } from "../models/CoachingExplanation";

export function explanationIds(explanations: readonly CoachingExplanation[]): readonly string[] {
  return Object.freeze(explanations.map((e) => e.id));
}

export function collectReasonCodes(explanations: readonly CoachingExplanation[]): readonly string[] {
  const codes = new Set<string>();
  for (const e of explanations) {
    for (const r of e.reasons) codes.add(r.code);
  }
  return Object.freeze([...codes]);
}

export function collectEvidenceKeys(explanations: readonly CoachingExplanation[]): readonly string[] {
  const keys = new Set<string>();
  for (const e of explanations) {
    for (const ev of e.evidence) keys.add(ev.key);
  }
  return Object.freeze([...keys]);
}
