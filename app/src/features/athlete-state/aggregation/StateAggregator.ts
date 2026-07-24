import type { AthleteState } from "../models/AthleteState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import {
  freezeCoaching,
  freezeConstraints,
  freezeFatigue,
  freezePreferences,
  freezeReadiness,
  freezeSleep,
  freezeState,
  freezeStress,
} from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";
import { aggregateGoals } from "./GoalAggregator";
import { aggregateLifestyle } from "./LifestyleAggregator";
import { aggregateNutrition } from "./NutritionAggregator";
import { aggregatePerformance } from "./PerformanceAggregator";
import { aggregateProfile } from "./ProfileAggregator";
import { aggregateProgress } from "./ProgressAggregator";
import { aggregateRecovery } from "./RecoveryAggregator";
import { aggregateTraining } from "./TrainingAggregator";

/**
 * Deterministic aggregation of specialist contributions into AthleteState.
 * Aggregation only — no AI, no business calculations.
 */
export function aggregateAthleteState(input: {
  readonly state: AthleteState;
  readonly contributions: readonly SpecialistContribution[];
  readonly updatedAt: string;
}): AthleteState {
  const { contributions } = input;
  let training = aggregateTraining({
    current: input.state.training,
    contributions,
  });
  let recovery = aggregateRecovery({
    current: input.state.recovery,
    contributions,
  });
  let nutrition = aggregateNutrition({
    current: input.state.nutrition,
    contributions,
  });
  let performance = aggregatePerformance({
    current: input.state.performance,
    contributions,
  });
  let lifestyle = aggregateLifestyle({
    current: input.state.lifestyle,
    contributions,
  });
  let goals = aggregateGoals({
    current: input.state.goals,
    contributions,
  });
  let progress = aggregateProgress({
    current: input.state.progress,
    contributions,
  });
  let profile = aggregateProfile({
    profile: input.state.profile,
    contributions,
  });

  let readiness = input.state.readiness;
  let fatigue = input.state.fatigue;
  let sleep = input.state.sleep;
  let stress = input.state.stress;
  let preferences = input.state.preferences;
  let constraints = input.state.constraints;
  let coaching = input.state.coaching;

  for (const c of contributions) {
    if (c.readiness) readiness = freezeReadiness(c.readiness);
    if (c.fatigue) fatigue = freezeFatigue(c.fatigue);
    if (c.sleep) sleep = freezeSleep(c.sleep);
    if (c.stress) stress = freezeStress(c.stress);
    if (c.preferences) {
      preferences = freezePreferences({
        preferredTrainingTimes: mergeUniqueStrings(
          preferences.preferredTrainingTimes,
          c.preferences.preferredTrainingTimes,
        ),
        preferredModalities: mergeUniqueStrings(
          preferences.preferredModalities,
          c.preferences.preferredModalities,
        ),
        dietaryPreferences: mergeUniqueStrings(
          preferences.dietaryPreferences,
          c.preferences.dietaryPreferences,
        ),
        communicationTone:
          c.preferences.communicationTone ?? preferences.communicationTone,
        notes: mergeUniqueStrings(preferences.notes, c.preferences.notes),
      });
    }
    if (c.constraints) {
      constraints = freezeConstraints({
        injuries: mergeUniqueStrings(
          constraints.injuries,
          c.constraints.injuries,
        ),
        equipmentLimits: mergeUniqueStrings(
          constraints.equipmentLimits,
          c.constraints.equipmentLimits,
        ),
        scheduleLimits: mergeUniqueStrings(
          constraints.scheduleLimits,
          c.constraints.scheduleLimits,
        ),
        medicalFlags: mergeUniqueStrings(
          constraints.medicalFlags,
          c.constraints.medicalFlags,
        ),
        notes: mergeUniqueStrings(constraints.notes, c.constraints.notes),
      });
    }
    if (c.coaching) {
      coaching = freezeCoaching({
        activeSessionId:
          c.coaching.activeSessionId ?? coaching.activeSessionId,
        lastSessionId: c.coaching.lastSessionId ?? coaching.lastSessionId,
        lastIntent: c.coaching.lastIntent ?? coaching.lastIntent,
        focusAreas: mergeUniqueStrings(
          coaching.focusAreas,
          c.coaching.focusAreas,
        ),
        notes: mergeUniqueStrings(coaching.notes, c.coaching.notes),
        sourceSessionIds: mergeUniqueStrings(
          coaching.sourceSessionIds,
          c.coaching.sourceSessionIds,
        ),
      });
    }
  }

  return freezeState({
    ...input.state,
    profile,
    status: profile.status,
    training,
    recovery,
    nutrition,
    performance,
    lifestyle,
    readiness,
    fatigue,
    sleep,
    stress,
    goals,
    preferences,
    constraints,
    progress,
    coaching,
    updatedAt: input.updatedAt,
    frozenAt: input.updatedAt,
  });
}
