import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { GoalProgress } from "../../../features/goal-progress/models/GoalProgress";
import { createGoalRuntimePersistenceState } from "../models/GoalRuntimePersistenceState";

export interface PersistGoalProgressRuntimeMutationInput {
  readonly athleteId: string;
  readonly requestId: string;
  readonly goalProgress?: GoalProgress | null;
  readonly reachedMilestoneIds: readonly string[];
  readonly isCompleted: boolean;
}

/**
 * Rebuilds Unified Workspace with updated goal progress and runtime overlay.
 * Successful builds are observed by Runtime Observer for write-through persistence.
 */
export function persistGoalProgressRuntimeMutation(
  input: PersistGoalProgressRuntimeMutationInput,
): void {
  const workspaceService = getCompositionRoot().resolve("UnifiedWorkspaceService");
  const current = workspaceService.getWorkspace(input.athleteId);
  if (!current) {
    return;
  }

  workspaceService.build({
    athleteId: input.athleteId,
    requestId: input.requestId,
    generatedAt: current.metadata.generatedAt,
    goalProgress: input.goalProgress ?? current.goals.goalProgress,
    goalRuntimeOverlay: createGoalRuntimePersistenceState({
      athleteId: input.athleteId,
      reachedMilestoneIds: input.reachedMilestoneIds,
      isCompleted: input.isCompleted,
    }),
    timeline: current.timeline.timeline,
    latestEvents: current.timeline.latestEvents,
    latestDecisions: current.timeline.latestDecisions,
    latestRestores: current.timeline.latestRestores,
    snapshot: current.snapshot.snapshot,
    coachingSession: current.coach.session,
    insights: current.insights.insights,
    criticalFindings: current.insights.criticalFindings,
  });
}

export function readPersistedGoalRuntimeOverlay(athleteId: string) {
  return (
    getCompositionRoot()
      .resolve("UnifiedWorkspaceService")
      .getWorkspace(athleteId)?.goalRuntimeOverlay ?? null
  );
}
