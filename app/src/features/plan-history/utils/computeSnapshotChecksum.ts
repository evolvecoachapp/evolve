import type { NutritionPlan } from "../../nutrition-agent/models/NutritionPlan";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { PlanType } from "../models/PlanType";

/**
 * Deterministic checksum for snapshot integrity checks.
 * Not cryptographic — domain integrity only.
 */
export function computeSnapshotChecksum(input: {
  readonly planType: PlanType;
  readonly planId: string;
  readonly lineageId: string;
  readonly versionNumber: number;
  readonly publishedAt: string;
  readonly workoutPlan: WorkoutPlan | null;
  readonly nutritionPlan: NutritionPlan | null;
}): string {
  const planFingerprint =
    input.planType === "workout"
      ? [
          input.workoutPlan?.id ?? "",
          input.workoutPlan?.frozenAt ?? "",
          String(input.workoutPlan?.metrics.exerciseCount ?? 0),
          String(input.workoutPlan?.metrics.estimatedDurationSeconds ?? 0),
          input.workoutPlan?.summary.title ?? "",
        ].join(":")
      : [
          input.nutritionPlan?.id ?? "",
          input.nutritionPlan?.createdAt ?? "",
          input.nutritionPlan?.phaseHint ?? "",
          String(input.nutritionPlan?.calorieTargets.targetCalories ?? 0),
          input.nutritionPlan?.goal ?? "",
        ].join(":");

  const raw = [
    input.planType,
    input.lineageId,
    input.planId,
    String(input.versionNumber),
    input.publishedAt,
    planFingerprint,
  ].join("|");

  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `chk:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
