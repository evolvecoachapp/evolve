import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { GoalProgress as GoalProgressDomain } from "../../goal-progress/models/GoalProgress";
import type { GoalMilestone } from "../../goal-progress/models/GoalMilestone";
import type { GoalSnapshot } from "../../goal-progress/models/GoalSnapshot";
import {
  publishGoalCompleted,
  publishGoalMilestoneReached,
  publishGoalProgressUpdated,
} from "../../../integrations/goal-progress/application";
import type { GoalProgressDashboard } from "../models";

export interface PublishGoalRuntimeProgressUpdatedOptions {
  readonly dashboard: GoalProgressDashboard;
  readonly progress: GoalProgressDomain;
  readonly athleteId: string;
  readonly updatedAt: string;
  readonly correlationId?: string;
  readonly eventId?: string;
  readonly publishedAt?: string;
}

/** Publishes GoalProgressUpdated through the Sprint 32.4 integration. */
export async function publishGoalRuntimeProgressUpdated({
  dashboard,
  progress,
  athleteId,
  updatedAt,
  correlationId = `goal-runtime:update:${dashboard.goalId ?? "unknown"}`,
  eventId = `goal-runtime:update:${dashboard.goalId ?? "unknown"}:${updatedAt}`,
  publishedAt = updatedAt,
}: PublishGoalRuntimeProgressUpdatedOptions): Promise<void> {
  const publisher = getCompositionRoot().resolve("GoalProgressPublisher");

  await publishGoalProgressUpdated({
    publisher,
    progress,
    goalId: dashboard.goalId ?? progress.id,
    correlationId,
    eventId,
    publishedAt,
    athleteId,
  });
}

export interface PublishGoalRuntimeMilestoneProgressOptions {
  readonly dashboard: GoalProgressDashboard;
  readonly milestone: GoalMilestone;
  readonly athleteId: string;
  readonly occurredAt: string;
  readonly correlationId?: string;
  readonly eventId?: string;
  readonly publishedAt?: string;
}

/** Publishes GoalMilestoneReached through the Sprint 32.4 integration. */
export async function publishGoalRuntimeMilestoneProgress({
  dashboard,
  milestone,
  athleteId,
  occurredAt,
  correlationId = `goal-runtime:milestone:${dashboard.goalId ?? "unknown"}`,
  eventId = `goal-runtime:milestone:${milestone.id}:${occurredAt}`,
  publishedAt = occurredAt,
}: PublishGoalRuntimeMilestoneProgressOptions): Promise<void> {
  const publisher = getCompositionRoot().resolve("GoalProgressPublisher");

  await publishGoalMilestoneReached({
    publisher,
    milestone,
    goalId: dashboard.goalId ?? milestone.subjectId,
    correlationId,
    eventId,
    occurredAt,
    publishedAt,
    athleteId,
  });
}

export interface PublishGoalRuntimeCompletionProgressOptions {
  readonly dashboard: GoalProgressDashboard;
  readonly snapshot: GoalSnapshot;
  readonly athleteId: string;
  readonly completedAt: string;
  readonly correlationId?: string;
  readonly eventId?: string;
  readonly publishedAt?: string;
}

/** Publishes GoalCompleted through the Sprint 32.4 integration. */
export async function publishGoalRuntimeCompletionProgress({
  dashboard,
  snapshot,
  athleteId,
  completedAt,
  correlationId = `goal-runtime:complete:${dashboard.goalId ?? "unknown"}`,
  eventId = `goal-runtime:complete:${snapshot.id}`,
  publishedAt = completedAt,
}: PublishGoalRuntimeCompletionProgressOptions): Promise<void> {
  const publisher = getCompositionRoot().resolve("GoalProgressPublisher");

  await publishGoalCompleted({
    publisher,
    snapshot,
    goalId: dashboard.goalId ?? snapshot.id,
    correlationId,
    eventId,
    publishedAt,
    athleteId,
  });
}
