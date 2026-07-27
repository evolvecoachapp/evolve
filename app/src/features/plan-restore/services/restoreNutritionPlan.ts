import type { NutritionPlan } from "../../nutrition-agent/models/NutritionPlan";
import type { PlanSnapshot } from "../../plan-history/models/PlanSnapshot";

/**
 * Clone an immutable nutrition snapshot into a new living NutritionPlan identity.
 * Does not mutate the historical snapshot.
 */
export function restoreNutritionPlan(input: {
  readonly snapshot: PlanSnapshot;
  readonly requestId: string;
  readonly newVersionNumber: number;
  readonly at: string;
}): NutritionPlan {
  const source = input.snapshot.nutritionPlan;
  if (!source) {
    throw new Error("Nutrition snapshot payload missing");
  }

  return Object.freeze({
    ...source,
    id: `${source.id}:restore:v${input.newVersionNumber}:${input.requestId}`,
    rationale: Object.freeze([
      ...source.rationale,
      `Restored from version ${input.snapshot.version.versionNumber} (${input.snapshot.version.changeReason})`,
    ]),
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
    createdAt: input.at,
  });
}
