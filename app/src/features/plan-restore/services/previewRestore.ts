import type { PlanHistory } from "../../plan-history/models/PlanHistory";
import type { PlanSnapshot } from "../../plan-history/models/PlanSnapshot";
import type { PlanRestorePreview } from "../models/PlanRestorePreview";
import type { PlanRestoreRequest } from "../models/PlanRestoreRequest";

function summarizeVersionDelta(
  from: PlanSnapshot,
  to: PlanSnapshot,
): readonly string[] {
  const lines: string[] = [];
  lines.push(
    `Version ${from.version.versionNumber} (${from.version.changeReason}) → ${to.version.versionNumber} (${to.version.changeReason})`,
  );
  if (from.version.changeSummary !== to.version.changeSummary) {
    lines.push(
      `Change focus shifts from "${from.version.changeSummary}" to "${to.version.changeSummary}"`,
    );
  }

  if (from.workoutPlan && to.workoutPlan) {
    const fromCount = from.workoutPlan.metrics.exerciseCount;
    const toCount = to.workoutPlan.metrics.exerciseCount;
    if (fromCount !== toCount) {
      lines.push(`Exercise count ${fromCount} → ${toCount}`);
    }
    const fromDuration = from.workoutPlan.metrics.estimatedDurationSeconds;
    const toDuration = to.workoutPlan.metrics.estimatedDurationSeconds;
    if (fromDuration !== toDuration) {
      lines.push(
        `Duration ${Math.round(fromDuration / 60)}m → ${Math.round(toDuration / 60)}m`,
      );
    }
    if (from.workoutPlan.summary.title !== to.workoutPlan.summary.title) {
      lines.push(
        `Title "${from.workoutPlan.summary.title}" → "${to.workoutPlan.summary.title}"`,
      );
    }
  }

  if (from.nutritionPlan && to.nutritionPlan) {
    const fromCal = from.nutritionPlan.calorieTargets.targetCalories;
    const toCal = to.nutritionPlan.calorieTargets.targetCalories;
    if (fromCal !== toCal) {
      lines.push(`Calories ${fromCal} → ${toCal}`);
    }
    if (from.nutritionPlan.phaseHint !== to.nutritionPlan.phaseHint) {
      lines.push(
        `Phase ${from.nutritionPlan.phaseHint} → ${to.nutritionPlan.phaseHint}`,
      );
    }
    if (from.nutritionPlan.goal !== to.nutritionPlan.goal) {
      lines.push(
        `Goal ${from.nutritionPlan.goal} → ${to.nutritionPlan.goal}`,
      );
    }
  }

  if (lines.length === 1) {
    lines.push("Snapshot content matches at summarized metrics");
  }
  return Object.freeze(lines);
}

/**
 * Build a domain-only restore preview (no UI).
 */
export function previewRestore(input: {
  readonly id: string;
  readonly request: PlanRestoreRequest;
  readonly history: PlanHistory;
  readonly targetSnapshot: PlanSnapshot;
  readonly createdAt: string;
}): PlanRestorePreview {
  const currentSnapshot =
    input.history.snapshots.find(
      (item) =>
        item.version.versionNumber === input.history.currentVersionNumber,
    ) ?? input.history.snapshots[input.history.snapshots.length - 1]!;

  const recoveredChangesSummary = summarizeVersionDelta(
    currentSnapshot,
    input.targetSnapshot,
  );

  const discarded: string[] = [];
  for (const snapshot of input.history.snapshots) {
    if (
      snapshot.version.versionNumber > input.targetSnapshot.version.versionNumber &&
      snapshot.version.versionNumber <= input.history.currentVersionNumber
    ) {
      discarded.push(
        `v${snapshot.version.versionNumber}: ${snapshot.version.changeSummary} (${snapshot.version.changeReason})`,
      );
    }
  }

  const warnings: string[] = [];
  if (
    input.targetSnapshot.version.versionNumber ===
    input.history.currentVersionNumber
  ) {
    warnings.push(
      "Target is the current version; restore will republish an identical snapshot as a new version",
    );
  }
  if (discarded.length > 0) {
    warnings.push(
      `${discarded.length} later version(s) remain in history but will no longer be active`,
    );
  }

  return Object.freeze({
    id: input.id,
    requestId: input.request.id,
    currentVersion: currentSnapshot.version,
    targetVersion: input.targetSnapshot.version,
    targetSnapshot: input.targetSnapshot,
    recoveredChangesSummary,
    discardedChangesSummary: Object.freeze(discarded),
    warnings: Object.freeze(warnings),
    createdAt: input.createdAt,
  });
}
