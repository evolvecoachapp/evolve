import type { PlanHistory } from "../../plan-history/models/PlanHistory";
import type { WorkoutModificationResult } from "../../workout-generation-pipeline/models/WorkoutModificationResult";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { WeeklyWorkoutReport } from "../models/WeeklyWorkoutReport";

export interface BuildWorkoutReportInput {
  readonly workoutPlan?: WorkoutPlan | null;
  readonly modification?: WorkoutModificationResult | null;
  readonly planHistory?: PlanHistory | null;
  readonly completedWorkoutCount?: number;
  readonly modificationCount?: number;
  readonly complianceSummary?: string | null;
}

/**
 * Compose Weekly Coach Report workout section from Workout Pipeline + Plan History.
 * No duplicated workout logic.
 */
export function buildWorkoutReport(
  input: BuildWorkoutReportInput = {},
): WeeklyWorkoutReport {
  const plan = input.workoutPlan ?? null;
  const modification = input.modification ?? null;
  const history = input.planHistory ?? null;
  const completedWorkoutCount = input.completedWorkoutCount ?? 0;
  const modificationCount =
    input.modificationCount ??
    (modification?.success ? 1 : history && history.currentVersionNumber > 1 ? history.currentVersionNumber - 1 : 0);

  if (!plan && !modification && !history && completedWorkoutCount === 0) {
    return Object.freeze({
      present: false,
      planId: null,
      planName: null,
      currentPhase: null,
      weekNumber: null,
      completedWorkoutCount: 0,
      modificationCount: 0,
      latestModificationSummary: null,
      planLineageId: null,
      planVersion: null,
      complianceSummary: null,
      summary: "No workout activity this week.",
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
  const complianceSummary =
    input.complianceSummary ??
    (completedWorkoutCount > 0
      ? `${completedWorkoutCount} workout(s) completed this week.`
      : null);

  const summaryParts: string[] = [];
  if (planName) summaryParts.push(planName);
  if (currentPhase) summaryParts.push(currentPhase);
  if (completedWorkoutCount > 0) {
    summaryParts.push(`${completedWorkoutCount} completed`);
  }
  if (modificationCount > 0) {
    summaryParts.push(`${modificationCount} modification(s)`);
  }
  if (latestModificationSummary) summaryParts.push(latestModificationSummary);
  if (complianceSummary) summaryParts.push(complianceSummary);

  return Object.freeze({
    present: true,
    planId: plan?.id ?? null,
    planName,
    currentPhase,
    weekNumber,
    completedWorkoutCount,
    modificationCount,
    latestModificationSummary,
    planLineageId:
      history?.planType === "workout" ? history.lineageId : null,
    planVersion:
      history?.planType === "workout" ? history.currentVersionNumber : null,
    complianceSummary,
    summary:
      summaryParts.length > 0
        ? summaryParts.join(" · ")
        : "Workout activity available.",
  });
}
