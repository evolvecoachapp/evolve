import type { AthleteState } from "../models/AthleteState";
import type { TrainingState } from "../models/TrainingState";
import type { RecoveryState } from "../models/RecoveryState";
import type { NutritionState } from "../models/NutritionState";

export function selectTraining(state: AthleteState): TrainingState {
  return state.training;
}

export function selectRecovery(state: AthleteState): RecoveryState {
  return state.recovery;
}

export function selectNutrition(state: AthleteState): NutritionState {
  return state.nutrition;
}
