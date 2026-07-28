import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { SnapshotCoach } from "../models/SnapshotCoach";

export interface BuildCoachProjectionInput {
  readonly athleteId: string;
  readonly coachingSession?: CoachingSession | null;
}

/**
 * Projects the latest explainable coaching session into the athlete snapshot.
 */
export function buildCoachProjection(
  input: BuildCoachProjectionInput,
): SnapshotCoach {
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
