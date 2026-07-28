import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";

/**
 * Explainable coaching session projection for the workspace.
 */
export interface WorkspaceCoach {
  readonly athleteId: string;
  readonly present: boolean;
  readonly session: CoachingSession | null;
  readonly sessionId: string | null;
  readonly recommendationSummary: string | null;
  readonly confidenceLevel: string | null;
  readonly confidenceScore: number | null;
  readonly evidenceSummary: string | null;
}
