import type { AthleteState } from "../models/AthleteState";
import type { StateValidation } from "../models/StateValidation";
import { validateGoals } from "./validateGoals";
import { validateHistory } from "./validateHistory";
import { validateMeasurements } from "./validateMeasurements";
import { validatePreferences } from "./validatePreferences";
import { validateStateIntegrity } from "./validateStateIntegrity";
import { validateTimelineConsistency } from "./validateTimelineConsistency";
import { validateVersionConsistency } from "./validateVersionConsistency";

export function validateAthleteStateFull(
  state: AthleteState,
): StateValidation {
  const issues = [
    ...validateStateIntegrity(state).issues,
    ...validateVersionConsistency(state).issues,
    ...validateTimelineConsistency({
      athleteId: state.athleteId,
      timeline: state.timeline,
    }).issues,
    ...validateMeasurements(state.bodyMeasurements).issues,
    ...validateGoals(state.goals).issues,
    ...validatePreferences(state.preferences).issues,
    ...validateHistory({
      athleteId: state.athleteId,
      history: state.history,
    }).issues,
  ];
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
