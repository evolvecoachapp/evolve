/**
 * Linkage context for a built PromptPackage.
 * Upstream ids only — no networking or provider state.
 */
export interface PromptContext {
  readonly conversationContextId: string;
  readonly coachingContextId: string | null;
  readonly insightSnapshotId: string | null;
  readonly athleteId: string | null;
  readonly sessionId: string | null;
  readonly audience: string;
  readonly primaryIntent: string | null;
  readonly composedAt: string;
}
