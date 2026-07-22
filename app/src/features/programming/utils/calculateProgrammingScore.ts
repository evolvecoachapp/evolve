import type { ProgrammingScore } from "../models/ProgrammingScore";
import { createEmptyProgrammingScore } from "../models/ProgrammingScore";

export type ProgrammingScoreParts = Partial<
  Omit<ProgrammingScore, "total">
>;

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Build a ProgrammingScore from partial axis values.
 */
export function calculateProgrammingScore(
  parts: ProgrammingScoreParts,
): ProgrammingScore {
  const volume = round3(parts.volume ?? 0);
  const intensity = round3(parts.intensity ?? 0);
  const rest = round3(parts.rest ?? 0);
  const tempo = round3(parts.tempo ?? 0);
  const order = round3(parts.order ?? 0);
  const priority = round3(parts.priority ?? 0);
  return Object.freeze({
    total: round3(volume + intensity + rest + tempo + order + priority),
    volume,
    intensity,
    rest,
    tempo,
    order,
    priority,
  });
}

/**
 * Merge independent score parts from strategies (summed per axis).
 */
export function mergeScoreParts(
  ...partsList: readonly ProgrammingScoreParts[]
): ProgrammingScore {
  if (partsList.length === 0) {
    return createEmptyProgrammingScore();
  }

  let volume = 0;
  let intensity = 0;
  let rest = 0;
  let tempo = 0;
  let order = 0;
  let priority = 0;

  for (const parts of partsList) {
    volume = round3(volume + (parts.volume ?? 0));
    intensity = round3(intensity + (parts.intensity ?? 0));
    rest = round3(rest + (parts.rest ?? 0));
    tempo = round3(tempo + (parts.tempo ?? 0));
    order = round3(order + (parts.order ?? 0));
    priority = round3(priority + (parts.priority ?? 0));
  }

  return calculateProgrammingScore({
    volume,
    intensity,
    rest,
    tempo,
    order,
    priority,
  });
}
