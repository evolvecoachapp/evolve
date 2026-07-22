import type { ProgressionScore } from "../models/ProgressionScore";
import { createEmptyProgressionScore } from "../models/ProgressionScore";

export type ProgressionScoreParts = Partial<Omit<ProgressionScore, "total">>;

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Build a ProgressionScore from partial axis values.
 */
export function calculateProgressionScore(
  parts: ProgressionScoreParts,
): ProgressionScore {
  const linear = round3(parts.linear ?? 0);
  const volume = round3(parts.volume ?? 0);
  const intensity = round3(parts.intensity ?? 0);
  const frequency = round3(parts.frequency ?? 0);
  const rotation = round3(parts.rotation ?? 0);
  return Object.freeze({
    total: round3(linear + volume + intensity + frequency + rotation),
    linear,
    volume,
    intensity,
    frequency,
    rotation,
  });
}

/**
 * Merge independent score parts from strategies (summed per axis).
 */
export function mergeScoreParts(
  ...partsList: readonly ProgressionScoreParts[]
): ProgressionScore {
  if (partsList.length === 0) {
    return createEmptyProgressionScore();
  }

  let linear = 0;
  let volume = 0;
  let intensity = 0;
  let frequency = 0;
  let rotation = 0;

  for (const parts of partsList) {
    linear = round3(linear + (parts.linear ?? 0));
    volume = round3(volume + (parts.volume ?? 0));
    intensity = round3(intensity + (parts.intensity ?? 0));
    frequency = round3(frequency + (parts.frequency ?? 0));
    rotation = round3(rotation + (parts.rotation ?? 0));
  }

  return calculateProgressionScore({
    linear,
    volume,
    intensity,
    frequency,
    rotation,
  });
}
