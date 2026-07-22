import type { AdaptationScore } from "../models/AdaptationScore";
import { createEmptyAdaptationScore } from "../models/AdaptationScore";

export type AdaptationScoreParts = Partial<Omit<AdaptationScore, "total">>;

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Build an AdaptationScore from partial axis values.
 */
export function calculateAdaptationScore(
  parts: AdaptationScoreParts,
): AdaptationScore {
  const readiness = round3(parts.readiness ?? 0);
  const recovery = round3(parts.recovery ?? 0);
  const fatigue = round3(parts.fatigue ?? 0);
  const constraints = round3(parts.constraints ?? 0);
  const adaptation = round3(parts.adaptation ?? 0);
  return Object.freeze({
    total: round3(readiness + recovery + fatigue + constraints + adaptation),
    readiness,
    recovery,
    fatigue,
    constraints,
    adaptation,
  });
}

/**
 * Merge independent score parts (summed per axis).
 */
export function mergeScoreParts(
  ...partsList: readonly AdaptationScoreParts[]
): AdaptationScore {
  if (partsList.length === 0) {
    return createEmptyAdaptationScore();
  }

  let readiness = 0;
  let recovery = 0;
  let fatigue = 0;
  let constraints = 0;
  let adaptation = 0;

  for (const parts of partsList) {
    readiness = round3(readiness + (parts.readiness ?? 0));
    recovery = round3(recovery + (parts.recovery ?? 0));
    fatigue = round3(fatigue + (parts.fatigue ?? 0));
    constraints = round3(constraints + (parts.constraints ?? 0));
    adaptation = round3(adaptation + (parts.adaptation ?? 0));
  }

  return calculateAdaptationScore({
    readiness,
    recovery,
    fatigue,
    constraints,
    adaptation,
  });
}
