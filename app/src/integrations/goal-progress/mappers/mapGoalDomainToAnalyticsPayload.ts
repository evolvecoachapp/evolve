import type { GoalProgress as GoalProgressDomain } from "../../../features/goal-progress/models/GoalProgress";
import type { GoalMilestone } from "../../../features/goal-progress/models/GoalMilestone";
import type { GoalSnapshot } from "../../../features/goal-progress/models/GoalSnapshot";
import {
  createEmptyGoalAnalyticsPayload,
  createGoalAnalyticsPayload,
  type GoalAnalyticsPayload,
} from "../models";

export function mapGoalProgressToUpdatedPayload(
  progress: GoalProgressDomain,
  goalId: string,
  snapshotId: string | null = null,
): GoalAnalyticsPayload {
  return createGoalAnalyticsPayload({
    goalId,
    snapshotId,
    title: progress.evaluation.subjectId,
    category: progress.category,
    currentValue: progress.evaluation.consistencyOrdinal,
    targetValue: 100,
    unit: "percent",
    completionPercent: progress.evaluation.consistencyOrdinal,
    status: progress.severity.level,
    evaluatedAt: progress.createdAt,
    completedAt: null,
    metrics: [],
  });
}

export function mapGoalMilestoneToReachedPayload(
  milestone: GoalMilestone,
  goalId: string,
): GoalAnalyticsPayload {
  return createGoalAnalyticsPayload({
    goalId,
    snapshotId: null,
    title: milestone.id,
    category: milestone.category,
    currentValue: milestone.severity.ordinal,
    targetValue: null,
    unit: null,
    completionPercent: null,
    status: milestone.severity.level,
    evaluatedAt: null,
    completedAt: null,
    metrics: [],
  });
}

export function mapGoalSnapshotToCompletedPayload(
  snapshot: GoalSnapshot,
  goalId: string,
): GoalAnalyticsPayload {
  const primaryDecision = snapshot.decisions[0];

  return createGoalAnalyticsPayload({
    goalId,
    snapshotId: snapshot.id,
    title: snapshot.summary?.id ?? primaryDecision?.evaluation.subjectId ?? snapshot.id,
    category: primaryDecision?.category ?? null,
    currentValue: snapshot.summary?.decisionCount ?? snapshot.decisions.length,
    targetValue: snapshot.summary?.opportunityCount ?? null,
    unit: null,
    completionPercent: null,
    status: "completed",
    evaluatedAt: snapshot.createdAt,
    completedAt: snapshot.createdAt,
    metrics: [],
  });
}

export function mapGoalTrackingStartedPayload(
  goalId: string,
  startedAt: string,
): GoalAnalyticsPayload {
  return createGoalAnalyticsPayload({
    ...createEmptyGoalAnalyticsPayload(goalId),
    status: "tracking",
    evaluatedAt: startedAt,
  });
}
