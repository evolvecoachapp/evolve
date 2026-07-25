import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachingSessionPort } from "../contracts/CoachingSessionPort";
import { createMockConversationRuntimePort } from "../contracts/ConversationRuntimePort";
import { createMockGoalAgentPort } from "../contracts/GoalAgentPort";
import { createMockNutritionAgentPort } from "../contracts/NutritionAgentPort";
import { createMockRecoveryAgentPort } from "../contracts/RecoveryAgentPort";
import { createMockSupervisorPort } from "../contracts/SupervisorPort";
import { createMockWorkoutAgentPort } from "../contracts/WorkoutAgentPort";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import {
  ContextRequestKinds,
  type ContextRequest,
} from "../models/ContextRequest";
import {
  createContextFusionService,
  type ContextFusionService,
} from "../services/ContextFusionService";
import { freezeRequest } from "../utils/FreezeContext";

export const FIXED_TIMESTAMP = "2026-07-25T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createContextRequest(
  overrides: Partial<ContextRequest> = {},
): ContextRequest {
  return freezeRequest({
    id: overrides.id ?? "request:context-fusion:test",
    kind: overrides.kind ?? ContextRequestKinds.BUILD,
    athleteId: overrides.athleteId ?? "athlete:1",
    sessionId: overrides.sessionId ?? "session:coach:1",
    conversationId: overrides.conversationId ?? "conversation:1",
    contextId: overrides.contextId ?? "context:athlete:1",
    base: overrides.base ?? null,
    contributions: Object.freeze([...(overrides.contributions ?? [])]),
    reason: overrides.reason ?? "test build",
    metadata: overrides.metadata ?? EMPTY_CONTEXT_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestContextFusionService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): ContextFusionService {
  const withMocks = overrides.withMocks ?? true;
  return createContextFusionService({
    conversationPort: withMocks
      ? createMockConversationRuntimePort()
      : undefined,
    sessionPort: withMocks ? createMockCoachingSessionPort() : undefined,
    athletePort: withMocks ? createMockAthleteStatePort() : undefined,
    workoutPort: withMocks ? createMockWorkoutAgentPort() : undefined,
    nutritionPort: withMocks ? createMockNutritionAgentPort() : undefined,
    recoveryPort: withMocks ? createMockRecoveryAgentPort() : undefined,
    goalPort: withMocks ? createMockGoalAgentPort() : undefined,
    supervisorPort: withMocks ? createMockSupervisorPort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
