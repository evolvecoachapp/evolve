import type { PlanHistory } from "../../plan-history/models/PlanHistory";
import type { WorkoutModificationResult } from "../../workout-generation-pipeline/models/WorkoutModificationResult";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { HomeWorkoutCard } from "../models/HomeWorkoutCard";

export interface BuildWorkoutCardInput {
  readonly workoutPlan?: WorkoutPlan | null;
  readonly modification?: WorkoutModificationResult | null;
  readonly planHistory?: PlanHistory | null;
}

/**
 * Compose Home workout card from existing Workout Pipeline + Plan History.
 * No duplicated workout logic.
 */
export function buildWorkoutCard(
  input: BuildWorkoutCardInput = {},
): HomeWorkoutCard {
  const plan = input.workoutPlan ?? null;
  const modification = input.modification ?? null;
  const history = input.planHistory ?? null;

  if (!plan && !modification && !history) {
    return Object.freeze({
      present: false,
      planId: null,
      planName: null,
      currentPhase: null,
      weekNumber: null,
      latestModificationSummary: null,
      planLineageId: null,
      planVersion: null,
      summary: "No active workout plan.",
    });
  }

  const weekNumber = plan?.progression.weekNumber ?? null;
  const currentPhase =
    weekNumber !== null ? `Week ${weekNumber}` : null;
  const latestModificationSummary = modification?.success
    ? modification.message || modification.explanation || "Workout plan modified."
    : history && history.planType === "workout" && history.currentVersionNumber > 1
      ? `Workout plan at version ${history.currentVersionNumber}.`
      : null;

  const planName = plan?.name ?? null;
  const summaryParts: string[] = [];
  if (planName) summaryParts.push(planName);
  if (currentPhase) summaryParts.push(currentPhase);
  if (latestModificationSummary) summaryParts.push(latestModificationSummary);

  return Object.freeze({
    present: true,
    planId: plan?.id ?? null,
    planName,
    currentPhase,
    weekNumber,
    latestModificationSummary,
    planLineageId:
      history?.planType === "workout" ? history.lineageId : null,
    planVersion:
      history?.planType === "workout" ? history.currentVersionNumber : null,
    summary:
      summaryParts.length > 0
        ? summaryParts.join(" · ")
        : "Workout plan available.",
  });
}
