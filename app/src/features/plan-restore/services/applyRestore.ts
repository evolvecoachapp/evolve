import { PlanChangeReasons } from "../../plan-history/models/PlanChangeReason";
import type { PlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import type { PlanSnapshot } from "../../plan-history/models/PlanSnapshot";
import type { NutritionPlan } from "../../nutrition-agent/models/NutritionPlan";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { PlanRestorePreview } from "../models/PlanRestorePreview";
import type { PlanRestoreRequest } from "../models/PlanRestoreRequest";
import type { PlanRestoreResult } from "../models/PlanRestoreResult";
import type { PlanRestoreValidation } from "../models/PlanRestoreValidation";
import {
  RestoreConflictCodes,
  type RestoreConflict,
} from "../models/RestoreConflict";
import { restoreNutritionPlan } from "./restoreNutritionPlan";
import { restoreWorkoutPlan } from "./restoreWorkoutPlan";

function conflict(
  code: RestoreConflict["code"],
  message: string,
): RestoreConflict {
  return Object.freeze({ code, message, field: null });
}

/**
 * Apply a validated restore: clone snapshot → publish brand-new history version.
 * Never mutates prior snapshots.
 */
export function applyRestore(input: {
  readonly request: PlanRestoreRequest;
  readonly preview: PlanRestorePreview;
  readonly validation: PlanRestoreValidation;
  readonly historyService: PlanHistoryService;
  readonly startedAt: string;
  readonly completedAt: string;
}): PlanRestoreResult {
  const { request, preview, validation, historyService } = input;

  if (!validation.valid) {
    return Object.freeze({
      id: `restore-result:${request.id}`,
      success: false,
      message: validation.errors.join("; ") || "Restore validation failed",
      request,
      preview,
      validation,
      publishedVersion: null,
      publishedSnapshot: null,
      workoutPlan: null,
      nutritionPlan: null,
      conflicts: Object.freeze([
        conflict(
          RestoreConflictCodes.VALIDATION_FAILED,
          validation.errors.join("; ") || "Restore validation failed",
        ),
      ]),
      restoredSummary: "",
      revertedSummary: preview.discardedChangesSummary.join("; "),
      restoreReason: request.message,
      progressionImpact:
        "No restore applied; progression posture unchanged.",
      startedAt: input.startedAt,
      completedAt: input.completedAt,
    });
  }

  const history = historyService.getHistory(request.target.lineageId);
  if (!history) {
    return Object.freeze({
      id: `restore-result:${request.id}`,
      success: false,
      message: "Plan history missing at apply time",
      request,
      preview,
      validation,
      publishedVersion: null,
      publishedSnapshot: null,
      workoutPlan: null,
      nutritionPlan: null,
      conflicts: Object.freeze([
        conflict(
          RestoreConflictCodes.HISTORY_NOT_FOUND,
          "Plan history missing at apply time",
        ),
      ]),
      restoredSummary: "",
      revertedSummary: "",
      restoreReason: request.message,
      progressionImpact:
        "No restore applied; progression posture unchanged.",
      startedAt: input.startedAt,
      completedAt: input.completedAt,
    });
  }

  const newVersionNumber = history.currentVersionNumber + 1;
  const targetSnapshot = preview.targetSnapshot;
  let workoutPlan: WorkoutPlan | null = null;
  let nutritionPlan: NutritionPlan | null = null;

  if (request.target.planType === "workout") {
    workoutPlan = restoreWorkoutPlan({
      snapshot: targetSnapshot,
      requestId: request.id,
      newVersionNumber,
      conversationId: request.conversationId,
      sessionId: request.sessionId,
      at: input.completedAt,
    });
  } else {
    nutritionPlan = restoreNutritionPlan({
      snapshot: targetSnapshot,
      requestId: request.id,
      newVersionNumber,
      at: input.completedAt,
    });
  }

  const publishedSnapshot: PlanSnapshot = historyService.publishVersion(
    Object.freeze({
      id: `publish:restore:${request.id}`,
      lineageId: request.target.lineageId,
      planType: request.target.planType,
      athleteId: request.athleteId,
      conversationId: request.conversationId,
      sessionId: request.sessionId,
      changeReason: PlanChangeReasons.RESTORED,
      changeSummary: `Restored version ${targetSnapshot.version.versionNumber} (${targetSnapshot.version.changeReason})`,
      workoutPlan,
      nutritionPlan,
      createdAt: input.completedAt,
    }),
  );

  const restoredSummary = [
    `Restored ${request.target.planType} plan to version ${targetSnapshot.version.versionNumber}`,
    ...preview.recoveredChangesSummary.slice(0, 3),
  ].join(". ");

  const revertedSummary =
    preview.discardedChangesSummary.length > 0
      ? `Reverted later changes: ${preview.discardedChangesSummary.join("; ")}`
      : "No later versions were active beyond the restore target.";

  const progressionImpact =
    request.target.planType === "workout"
      ? workoutPlan?.progression.cue
        ? `Progression cue restored: ${workoutPlan.progression.cue} (week ${workoutPlan.progression.weekNumber}). History kept versions ${preview.currentVersion.versionNumber}→${publishedSnapshot.version.versionNumber}.`
        : `Progression week ${workoutPlan?.progression.weekNumber ?? "n/a"} restored from snapshot; history remains immutable.`
      : "Nutrition restore republishes prior targets; training progression unchanged.";

  return Object.freeze({
    id: `restore-result:${request.id}`,
    success: true,
    message: `Published restore as version ${publishedSnapshot.version.versionNumber}`,
    request,
    preview,
    validation,
    publishedVersion: publishedSnapshot.version,
    publishedSnapshot,
    workoutPlan,
    nutritionPlan,
    conflicts: Object.freeze([] as RestoreConflict[]),
    restoredSummary,
    revertedSummary,
    restoreReason: request.message || targetSnapshot.version.changeSummary,
    progressionImpact,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
  });
}
