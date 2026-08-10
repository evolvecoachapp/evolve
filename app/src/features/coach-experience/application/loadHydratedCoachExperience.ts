import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { mapCoachExperience } from "../mappers";
import { mapWorkspaceCoachToExperienceDto } from "../mappers/mapWorkspaceCoachToExperienceDto";
import type { CoachMessageDto } from "../types/coachExperienceDto";
import type { CoachExperience } from "../models/CoachExperience";

export interface LoadHydratedCoachExperienceOptions {
  readonly athleteId: string;
  readonly sessionMessages?: readonly CoachMessageDto[];
  readonly sessionId?: string | null;
  readonly pinnedInsightId?: string | null;
  readonly dismissedInsightIds?: readonly string[];
}

/**
 * Loads Coach Experience from hydrated Unified Workspace and Composition Root
 * Coach Conversation / Conversation Memory services.
 */
export async function loadHydratedCoachExperience({
  athleteId,
  sessionMessages,
  sessionId,
  pinnedInsightId,
  dismissedInsightIds,
}: LoadHydratedCoachExperienceOptions): Promise<CoachExperience | null> {
  const root = getCompositionRoot();
  const workspace = root.resolve("UnifiedWorkspaceService").getWorkspace(athleteId);
  if (!workspace) {
    return null;
  }

  const memorySnapshot = root
    .resolve("CoachConversationService")
    .getMemory()
    .buildMemorySnapshot({ snapshotId: `snap:${athleteId}` });

  const dto = mapWorkspaceCoachToExperienceDto({
    workspace,
    sessionMessages,
    sessionId: sessionId ?? workspace.coach.sessionId,
    memoryEntries: memorySnapshot.snapshot?.entries ?? Object.freeze([]),
    pinnedInsightId,
    dismissedInsightIds,
  });

  return mapCoachExperience(dto);
}
