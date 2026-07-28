import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { WorkspaceCoach } from "../models/WorkspaceCoach";

export interface BuildCoachProjectionInput {
  readonly athleteId: string;
  readonly coachingSession?: CoachingSession | null;
}

/**
 * Builds coach projection from the latest explainable coaching session.
 */
export function buildCoachProjection(
  input: BuildCoachProjectionInput,
): WorkspaceCoach {
  const session = input.coachingSession ?? null;

  return Object.freeze({
    athleteId: input.athleteId,
    present: session != null,
    session,
    sessionId: session?.id ?? null,
    recommendationSummary: session?.recommendationSummary.summary ?? null,
    confidenceLevel: session?.confidence.level ?? null,
    confidenceScore: session?.confidence.score ?? null,
    evidenceSummary: session?.evidenceUsed.summary ?? null,
  });
}
