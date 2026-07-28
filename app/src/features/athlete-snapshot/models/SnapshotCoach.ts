import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { CoachingSessionEvidence } from "../../coaching-session/composition/models/CoachingSessionEvidence";

/**
 * Immutable coach projection from the latest explainable coaching session.
 */
export interface SnapshotCoach {
  readonly athleteId: string;
  readonly present: boolean;
  readonly session: CoachingSession | null;
  readonly sessionId: string | null;
  readonly recommendation: string | null;
  readonly confidence: number | null;
  readonly expectedOutcome: string | null;
  readonly evidence: CoachingSessionEvidence | null;
}
