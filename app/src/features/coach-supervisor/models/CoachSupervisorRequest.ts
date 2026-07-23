import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";

/**
 * Immutable user/coach request accepted by Coach Supervisor.
 * Contains no domain payloads — orchestration input only.
 */
export interface CoachSupervisorRequest {
  readonly id: string;
  readonly message: string;
  readonly intent: string;
  readonly requiredCapabilityIds: readonly string[];
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly preferredAgentIds: readonly string[];
  readonly metadata: CoachSupervisorMetadata;
  readonly createdAt: string;
}
