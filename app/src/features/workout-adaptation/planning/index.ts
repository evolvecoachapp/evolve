export * from "./ExercisePlanner";
export * from "./ProgressionPlanner";
export * from "./RegressionPlanner";
export * from "./SessionPlanner";
export * from "./WeekPlanner";
export * from "./WorkoutPlanner";

import { planExercises, type ExercisePlan } from "./ExercisePlanner";
import { planProgression, type ProgressionPlan } from "./ProgressionPlanner";
import { planRegression, type RegressionPlan } from "./RegressionPlanner";
import { planSessions, type SessionPlan } from "./SessionPlanner";
import { planWeeks, type WeekPlan } from "./WeekPlanner";
import { planWorkout, type WorkoutPlan } from "./WorkoutPlanner";

export interface WorkoutPlanBundle {
  readonly workout: WorkoutPlan;
  readonly exercise: ExercisePlan;
  readonly progression: ProgressionPlan;
  readonly regression: RegressionPlan;
  readonly session: SessionPlan;
  readonly week: WeekPlan;
}

export function planWorkoutAdaptation(input: {
  readonly id: string;
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly blueprintKeys: readonly string[];
  readonly exerciseKeys: readonly string[];
  readonly sessionKeys: readonly string[];
  readonly weekKeys: readonly string[];
}): WorkoutPlanBundle {
  return Object.freeze({
    workout: planWorkout(input),
    exercise: planExercises(input),
    progression: planProgression(input),
    regression: planRegression(input),
    session: planSessions(input),
    week: planWeeks(input),
  });
}
