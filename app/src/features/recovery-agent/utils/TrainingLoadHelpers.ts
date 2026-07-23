import type {
  TrainingLoad,
  TrainingLoadTolerance,
} from "../models/TrainingLoad";

export function trainingLoadTolerance(score: number): TrainingLoadTolerance {
  if (score >= 70) return "low";
  if (score >= 40) return "moderate";
  return "high";
}

export function buildTrainingLoad(
  score: number,
  notes: readonly string[] = [],
): TrainingLoad {
  return Object.freeze({
    score: clamp(score),
    tolerance: trainingLoadTolerance(score),
    notes: Object.freeze([...notes]),
  });
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
