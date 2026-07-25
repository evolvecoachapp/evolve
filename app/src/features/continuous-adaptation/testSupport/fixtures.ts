import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockContextFusionPort } from "../contracts/ContextFusionPort";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockExplainabilityEnginePort } from "../contracts/ExplainabilityEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { AdaptationInputKinds } from "../models/AdaptationInput";
import type { AdaptationInput } from "../models/AdaptationInput";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import {
  createContinuousAdaptationEngineService,
  type ContinuousAdaptationEngineService,
} from "../services/ContinuousAdaptationEngineService";
import { freezeInput } from "../utils/FreezeAdaptationState";

export const FIXED_TIMESTAMP = "2026-07-25T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createAdaptationInput(
  overrides: Partial<AdaptationInput> = {},
): AdaptationInput {
  return freezeInput({
    id: overrides.id ?? "request:continuous-adaptation:test",
    kind: overrides.kind ?? AdaptationInputKinds.EVALUATE,
    athleteId: overrides.athleteId ?? "athlete:1",
    sessionId: overrides.sessionId ?? "session:1",
    conversationId: overrides.conversationId ?? "conversation:1",
    contextId: overrides.contextId ?? "context:1",
    decisions: overrides.decisions ?? Object.freeze([]),
    recommendations: overrides.recommendations ?? Object.freeze([]),
    explanations: overrides.explanations ?? Object.freeze([]),
    stateKeys: overrides.stateKeys ?? Object.freeze(["state:readiness", "state:load"]),
    performanceKeys:
      overrides.performanceKeys ?? Object.freeze(["performance:progress", "performance:plateau"]),
    recoveryKeys: overrides.recoveryKeys ?? Object.freeze(["recovery:status"]),
    nutritionKeys: overrides.nutritionKeys ?? Object.freeze(["nutrition:adherence"]),
    goalKeys: overrides.goalKeys ?? Object.freeze(["goal:progress"]),
    adherenceKeys: overrides.adherenceKeys ?? Object.freeze(["adherence:weekly"]),
    historyKeys: overrides.historyKeys ?? Object.freeze(["history:prior"]),
    timelineKeys: overrides.timelineKeys ?? Object.freeze(["timeline:recent"]),
    signalFlags:
      overrides.signalFlags ??
      Object.freeze({
        "recovery:flag": true,
        "trend:signal": true,
        "regression:flag": false,
      }),
    priorSnapshot: overrides.priorSnapshot ?? null,
    reason: overrides.reason ?? "test",
    metadata: overrides.metadata ?? EMPTY_ADAPTATION_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestContinuousAdaptationEngineService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): ContinuousAdaptationEngineService {
  const withMocks = overrides.withMocks ?? true;
  return createContinuousAdaptationEngineService({
    decisionEnginePort: withMocks ? createMockDecisionEnginePort() : undefined,
    recommendationEnginePort: withMocks ? createMockRecommendationEnginePort() : undefined,
    explainabilityEnginePort: withMocks ? createMockExplainabilityEnginePort() : undefined,
    contextFusionPort: withMocks ? createMockContextFusionPort() : undefined,
    athleteStatePort: withMocks ? createMockAthleteStatePort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
