import { createMockCoachingSessionPort } from "../contracts/CoachingSessionPort";
import { createMockGoalAgentPort } from "../contracts/GoalAgentPort";
import { createMockNutritionAgentPort } from "../contracts/NutritionAgentPort";
import { createMockRecoveryAgentPort } from "../contracts/RecoveryAgentPort";
import { createMockWorkoutAgentPort } from "../contracts/WorkoutAgentPort";
import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import {
  AthleteStateRequestKinds,
  type AthleteStateRequest,
} from "../models/AthleteStateRequest";
import {
  createAthleteStateService,
  type AthleteStateService,
} from "../services/AthleteStateService";
import { freezeRequest } from "../utils/FreezeAthleteState";

export const FIXED_TIMESTAMP = "2026-07-25T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createStateRequest(
  overrides: Partial<AthleteStateRequest> = {},
): AthleteStateRequest {
  return freezeRequest({
    id: overrides.id ?? "request:athlete-state:test",
    kind: overrides.kind ?? AthleteStateRequestKinds.BUILD,
    athleteId: overrides.athleteId ?? "athlete:1",
    stateId: overrides.stateId ?? "state:athlete:1",
    contributions: Object.freeze([...(overrides.contributions ?? [])]),
    sessionId: overrides.sessionId ?? "session:coach:1",
    reason: overrides.reason ?? "test build",
    metadata: overrides.metadata ?? EMPTY_ATHLETE_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestAthleteStateService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): AthleteStateService {
  const withMocks = overrides.withMocks ?? true;
  return createAthleteStateService({
    workoutPort: withMocks ? createMockWorkoutAgentPort() : undefined,
    nutritionPort: withMocks ? createMockNutritionAgentPort() : undefined,
    recoveryPort: withMocks ? createMockRecoveryAgentPort() : undefined,
    goalPort: withMocks ? createMockGoalAgentPort() : undefined,
    sessionPort: withMocks ? createMockCoachingSessionPort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
