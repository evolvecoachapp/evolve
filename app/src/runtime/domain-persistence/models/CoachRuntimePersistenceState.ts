import type { MemoryEntry } from "../../../features/conversation-memory/models/MemoryEntry";
import type { CoachMessageDto } from "../../../features/coach-experience/types/coachExperienceDto";

/**
 * Persisted coach runtime overlay stored in Unified Workspace (Sprint 35.5).
 *
 * Conversation turns and Conversation Memory entries — not transient UI state.
 */
export interface CoachRuntimePersistenceState {
  readonly athleteId: string;
  readonly sessionMessages: readonly CoachMessageDto[];
  readonly memoryEntries: readonly MemoryEntry[];
  readonly sessionId: string | null;
}

export function createCoachRuntimePersistenceState(
  input: CoachRuntimePersistenceState,
): CoachRuntimePersistenceState {
  return Object.freeze({
    athleteId: input.athleteId,
    sessionMessages: Object.freeze(
      input.sessionMessages.map((message) =>
        Object.freeze({
          ...message,
          citations: message.citations
            ? Object.freeze([...message.citations])
            : undefined,
        }),
      ),
    ),
    memoryEntries: Object.freeze([...input.memoryEntries]),
    sessionId: input.sessionId,
  });
}
