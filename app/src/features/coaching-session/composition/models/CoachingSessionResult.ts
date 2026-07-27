import type { CoachingSession } from "./CoachingSession";
import type { CoachingSessionConfidence } from "./CoachingSessionConfidence";
import type { CoachingSessionEvidence } from "./CoachingSessionEvidence";
import type { CoachingSessionSummary } from "./CoachingSessionSummary";

export interface CoachingSessionValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Immutable result of building / querying an explainable coaching session.
 */
export interface CoachingSessionResult {
  readonly id: string;
  readonly success: boolean;
  readonly session: CoachingSession | null;
  readonly summary: CoachingSessionSummary | null;
  readonly evidence: CoachingSessionEvidence | null;
  readonly confidence: CoachingSessionConfidence | null;
  readonly validation: CoachingSessionValidation;
  readonly message: string;
  readonly generatedAt: string;
}
