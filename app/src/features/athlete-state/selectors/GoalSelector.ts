import type { AthleteGoalItem, AthleteGoals } from "../models/AthleteGoals";
import type { AthleteState } from "../models/AthleteState";

export function selectGoals(state: AthleteState): AthleteGoals {
  return state.goals;
}

export function selectPrimaryGoal(
  state: AthleteState,
): AthleteGoalItem | null {
  const id = state.goals.primaryGoalId;
  if (!id) return null;
  return state.goals.items.find((g) => g.id === id) ?? null;
}
