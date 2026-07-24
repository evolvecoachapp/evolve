import { createMockCoachSupervisorPort } from "../contracts/CoachSupervisorPort";
import { createMockConversationRuntimePort } from "../contracts/ConversationRuntimePort";
import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import {
  SessionRequestKinds,
  type SessionRequest,
} from "../models/SessionRequest";
import {
  createCoachingSessionService,
  type CoachingSessionService,
} from "../services/CoachingSessionService";
import { freezeRequest } from "../utils/FreezeSessionState";

export const FIXED_TIMESTAMP = "2026-07-25T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createSessionRequest(
  overrides: Partial<SessionRequest> = {},
): SessionRequest {
  return freezeRequest({
    id: overrides.id ?? "request:session:test",
    kind: overrides.kind ?? SessionRequestKinds.START,
    sessionId: overrides.sessionId ?? null,
    conversationId: overrides.conversationId ?? "conversation:1",
    athleteId: overrides.athleteId ?? "athlete:1",
    message: overrides.message ?? "Plan my workout and check recovery",
    intent: overrides.intent ?? "Plan workout with recovery check",
    requiredCapabilityIds: Object.freeze([
      ...(overrides.requiredCapabilityIds ?? [
        "capability:generate_workout",
        "capability:evaluate_recovery",
      ]),
    ]),
    metadata: overrides.metadata ?? EMPTY_SESSION_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestSessionService(
  overrides: {
    readonly clock?: () => string;
  } = {},
): CoachingSessionService {
  return createCoachingSessionService({
    supervisorPort: createMockCoachSupervisorPort(),
    conversationPort: createMockConversationRuntimePort([
      Object.freeze({
        conversationId: "conversation:1",
        athleteId: "athlete:1",
        active: true,
      }),
    ]),
    clock: overrides.clock ?? createFixedClock(),
  });
}
