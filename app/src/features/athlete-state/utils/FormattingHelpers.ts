import type { AthleteState } from "../models/AthleteState";
import { formatStateVersion } from "../models/StateVersion";

export function formatAthleteHeadline(state: AthleteState): string {
  const status = state.status.kind;
  const version = formatStateVersion(state.version);
  return `Athlete ${state.athleteId} is ${status} at version ${version}`;
}

export function formatGoalTitles(state: AthleteState): readonly string[] {
  return Object.freeze(state.goals.items.map((g) => g.title));
}
