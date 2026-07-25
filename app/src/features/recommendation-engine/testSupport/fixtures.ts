import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachSupervisorPort } from "../contracts/CoachSupervisorPort";
import { createMockContextFusionPort } from "../contracts/ContextFusionPort";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import {
  RecommendationInputKinds,
  type RecommendationInput,
} from "../models/RecommendationInput";
import {
  createRecommendationEngineService,
  type RecommendationEngineService,
} from "../services/RecommendationEngineService";
import { freezeInput } from "../utils/FreezeRecommendationState";

export const FIXED_TIMESTAMP = "2026-07-25T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createRecommendationInput(
  overrides: Partial<RecommendationInput> = {},
): RecommendationInput {
  return freezeInput({
    id: overrides.id ?? "request:recommendation-engine:test",
    kind: overrides.kind ?? RecommendationInputKinds.BUILD,
    athleteId: overrides.athleteId ?? "athlete:1",
    sessionId: overrides.sessionId ?? "session:coach:1",
    conversationId: overrides.conversationId ?? "conversation:1",
    contextId: overrides.contextId ?? "context:athlete:1",
    recommendationContext: overrides.recommendationContext ?? null,
    decisionHandoff: overrides.decisionHandoff ?? null,
    decisions: Object.freeze([...(overrides.decisions ?? [])]),
    recommendations: Object.freeze([...(overrides.recommendations ?? [])]),
    reason: overrides.reason ?? "test build",
    metadata: overrides.metadata ?? EMPTY_RECOMMENDATION_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestRecommendationEngineService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): RecommendationEngineService {
  const withMocks = overrides.withMocks ?? true;
  return createRecommendationEngineService({
    decisionEnginePort: withMocks ? createMockDecisionEnginePort() : undefined,
    contextFusionPort: withMocks ? createMockContextFusionPort() : undefined,
    athleteStatePort: withMocks ? createMockAthleteStatePort() : undefined,
    supervisorPort: withMocks ? createMockCoachSupervisorPort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
