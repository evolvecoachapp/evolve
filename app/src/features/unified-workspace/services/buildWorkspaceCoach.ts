import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { WorkspaceCoach } from "../models/WorkspaceCoach";

export interface BuildWorkspaceCoachInput {
  readonly athleteId: string;
  readonly coachingSession?: CoachingSession | null;
}

/**
 * Builds coach projection from the latest Explainable Coaching Session.
 */
export function buildWorkspaceCoach(
  input: BuildWorkspaceCoachInput,
): WorkspaceCoach {
  const session = input.coachingSession ?? null;

  return Object.freeze({
    athleteId: input.athleteId,
    present: session != null,
    session,
    sessionId: session?.id ?? null,
    recommendation: session?.recommendationSummary.summary ?? null,
    confidence: session?.confidence.score ?? null,
    expectedOutcome: session?.expectedOutcome ?? null,
    evidence: session?.evidenceUsed ?? null,
  });
}
