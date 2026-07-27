import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { PlanSnapshot } from "../../plan-history/models/PlanSnapshot";

/**
 * Clone an immutable workout snapshot into a new living WorkoutPlan identity.
 * Does not mutate the historical snapshot.
 */
export function restoreWorkoutPlan(input: {
  readonly snapshot: PlanSnapshot;
  readonly requestId: string;
  readonly newVersionNumber: number;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly at: string;
}): WorkoutPlan {
  const source = input.snapshot.workoutPlan;
  if (!source) {
    throw new Error("Workout snapshot payload missing");
  }

  return Object.freeze({
    ...source,
    id: `${source.id}:restore:v${input.newVersionNumber}:${input.requestId}`,
    conversationId: input.conversationId ?? source.conversationId,
    sessionId: input.sessionId ?? source.sessionId,
    metadata: Object.freeze({
      ...source.metadata,
      tags: Object.freeze([
        ...source.metadata.tags.filter((tag) => tag !== "restored"),
        "restored",
      ]),
      attributes: Object.freeze({
        ...source.metadata.attributes,
        restoredFromVersion: String(input.snapshot.version.versionNumber),
        restoredFromSnapshotId: input.snapshot.id,
        restoreRequestId: input.requestId,
      }),
    }),
    notes: Object.freeze({
      ...source.notes,
      coachNotes: Object.freeze([
        ...source.notes.coachNotes,
        `Restored from version ${input.snapshot.version.versionNumber} (${input.snapshot.version.changeReason})`,
      ]),
    }),
    frozenAt: input.at,
  });
}
