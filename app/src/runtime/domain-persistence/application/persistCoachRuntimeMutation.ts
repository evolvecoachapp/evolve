import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { CoachMessageDto } from "../../../features/coach-experience/types/coachExperienceDto";
import { createCoachRuntimePersistenceState } from "../models/CoachRuntimePersistenceState";

export interface PersistCoachRuntimeMutationInput {
  readonly athleteId: string;
  readonly requestId: string;
  readonly sessionMessages: readonly CoachMessageDto[];
  readonly sessionId: string | null;
}

function rebuildWorkspaceWithCoachOverlay(
  athleteId: string,
  requestId: string,
  overlay: ReturnType<typeof createCoachRuntimePersistenceState>,
): void {
  const workspaceService = getCompositionRoot().resolve("UnifiedWorkspaceService");
  const current = workspaceService.getWorkspace(athleteId);
  if (!current) {
    return;
  }

  workspaceService.build({
    athleteId,
    requestId,
    generatedAt: current.metadata.generatedAt,
    goalProgress: current.goals.goalProgress,
    goalRuntimeOverlay: current.goalRuntimeOverlay,
    notificationRuntimeOverlay: current.notificationRuntimeOverlay,
    coachRuntimeOverlay: overlay,
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

/**
 * Rebuilds Unified Workspace with updated coach conversation and memory overlay.
 * Successful builds are observed by Runtime Observer for write-through persistence.
 */
export function persistCoachRuntimeMutation(
  input: PersistCoachRuntimeMutationInput,
): void {
  const root = getCompositionRoot();
  const memorySnapshot = root
    .resolve("CoachConversationService")
    .getMemory()
    .buildMemorySnapshot({ snapshotId: `persist:${input.athleteId}` });

  rebuildWorkspaceWithCoachOverlay(
    input.athleteId,
    input.requestId,
    createCoachRuntimePersistenceState({
      athleteId: input.athleteId,
      sessionMessages: input.sessionMessages,
      memoryEntries: memorySnapshot.snapshot?.entries ?? Object.freeze([]),
      sessionId: input.sessionId,
    }),
  );
}

export function readPersistedCoachRuntimeOverlay(athleteId: string) {
  return (
    getCompositionRoot()
      .resolve("UnifiedWorkspaceService")
      .getWorkspace(athleteId)?.coachRuntimeOverlay ?? null
  );
}

/**
 * Restores Conversation Memory entries from persisted workspace overlay.
 * Called during hydration after workspace records are restored.
 */
export function restoreCoachConversationMemoryFromOverlay(
  athleteId: string,
): void {
  const overlay = readPersistedCoachRuntimeOverlay(athleteId);
  if (!overlay || overlay.memoryEntries.length === 0) {
    return;
  }

  getCompositionRoot()
    .resolve("CoachConversationService")
    .getMemory()
    .restorePersistedEntries(overlay.memoryEntries);
}
