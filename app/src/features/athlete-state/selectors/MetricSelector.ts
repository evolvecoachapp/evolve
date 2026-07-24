import type { AthleteMetrics } from "../models/AthleteMetrics";
import type { AthleteState } from "../models/AthleteState";

export function selectMetrics(state: AthleteState): AthleteMetrics {
  return state.metrics;
}

export function selectWeightKg(state: AthleteState): number | null {
  return state.bodyMeasurements.weightKg;
}
