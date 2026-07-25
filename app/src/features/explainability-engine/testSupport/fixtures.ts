import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachSupervisorPort } from "../contracts/CoachSupervisorPort";
import { createMockContextFusionPort } from "../contracts/ContextFusionPort";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { ExplanationInputKinds } from "../models/ExplanationInput";
import type { ExplanationInput } from "../models/ExplanationInput";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import {
  createExplainabilityEngineService,
  type ExplainabilityEngineService,
} from "../services/ExplainabilityEngineService";
import { freezeInput } from "../utils/FreezeExplanationState";

export const FIXED_TIMESTAMP = "2026-07-25T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createExplanationInput(
  overrides: Partial<ExplanationInput> = {},
): ExplanationInput {
  return freezeInput({
    id: overrides.id ?? "request:explainability-engine:test",
    kind: overrides.kind ?? ExplanationInputKinds.BUILD,
    athleteId: overrides.athleteId ?? "athlete:1",
    sessionId: overrides.sessionId ?? "session:1",
    conversationId: overrides.conversationId ?? "conversation:1",
    contextId: overrides.contextId ?? "context:1",
    decisions: overrides.decisions ?? Object.freeze([]),
    recommendations: overrides.recommendations ?? Object.freeze([]),
    recommendationPackage: overrides.recommendationPackage ?? null,
    explainabilityHandoff: overrides.explainabilityHandoff ?? null,
    reason: overrides.reason ?? "test",
    metadata: overrides.metadata ?? EMPTY_EXPLANATION_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestExplainabilityEngineService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): ExplainabilityEngineService {
  const withMocks = overrides.withMocks ?? true;
  return createExplainabilityEngineService({
    decisionEnginePort: withMocks ? createMockDecisionEnginePort() : undefined,
    recommendationEnginePort: withMocks ? createMockRecommendationEnginePort() : undefined,
    contextFusionPort: withMocks ? createMockContextFusionPort() : undefined,
    athleteStatePort: withMocks ? createMockAthleteStatePort() : undefined,
    supervisorPort: withMocks ? createMockCoachSupervisorPort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
