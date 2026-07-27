import { PlanChangeReasons } from "../../plan-history/models/PlanChangeReason";
import type { PlanChangeReason } from "../../plan-history/models/PlanChangeReason";
import { PlanTypes } from "../../plan-history/models/PlanType";
import type { PlanHistoryService } from "../../plan-history/services/PlanHistoryService";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";

const LINEAGE_ATTR = "planLineageId";

/**
 * Resolve stable workout lineage id from plan metadata or plan id.
 */
export function resolveWorkoutLineageId(plan: WorkoutPlan): string {
  const fromMeta = plan.metadata.attributes[LINEAGE_ATTR];
  if (typeof fromMeta === "string" && fromMeta.length > 0) {
    return fromMeta;
  }
  const source = plan.metadata.attributes.sourcePlanId;
  if (typeof source === "string" && source.length > 0) {
    return source.split(":mod:")[0]!.split(":restore:")[0]!;
  }
  return plan.id.split(":mod:")[0]!.split(":restore:")[0]!;
}

/**
 * Stamp lineage id onto plan metadata without mutating history.
 */
export function withWorkoutLineage(
  plan: WorkoutPlan,
  lineageId: string,
): WorkoutPlan {
  if (plan.metadata.attributes[LINEAGE_ATTR] === lineageId) {
    return plan;
  }
  return Object.freeze({
    ...plan,
    metadata: Object.freeze({
      ...plan.metadata,
      attributes: Object.freeze({
        ...plan.metadata.attributes,
        [LINEAGE_ATTR]: lineageId,
      }),
    }),
  });
}

/**
 * Publish workout plan into append-only plan history.
 */
export function publishWorkoutPlanVersion(input: {
  readonly planHistory: PlanHistoryService;
  readonly plan: WorkoutPlan;
  readonly changeReason: PlanChangeReason;
  readonly changeSummary: string;
  readonly requestId: string;
  readonly at: string;
}): WorkoutPlan {
  const lineageId = resolveWorkoutLineageId(input.plan);
  const stamped = withWorkoutLineage(input.plan, lineageId);
  input.planHistory.publishVersion(
    Object.freeze({
      id: `publish:workout:${input.requestId}`,
      lineageId,
      planType: PlanTypes.WORKOUT,
      athleteId: stamped.athleteId,
      conversationId: stamped.conversationId,
      sessionId: stamped.sessionId,
      changeReason: input.changeReason,
      changeSummary: input.changeSummary,
      workoutPlan: stamped,
      nutritionPlan: null,
      createdAt: input.at,
    }),
  );
  return stamped;
}

export { PlanChangeReasons };
