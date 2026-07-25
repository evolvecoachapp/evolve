import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockNutritionAdaptationPort } from "../contracts/NutritionAdaptationPort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { createMockRecoveryAdaptationPort } from "../contracts/RecoveryAdaptationPort";
import { createMockWorkoutAdaptationPort } from "../contracts/WorkoutAdaptationPort";
import { GoalProgressInputKinds } from "../models/GoalProgressInput";
import type { GoalProgressInput } from "../models/GoalProgressInput";
import { EMPTY_GOAL_METADATA } from "../models/GoalMetadata";
import {
  createGoalProgressEngineService,
  type GoalProgressEngineService,
} from "../services/GoalProgressEngineService";
import { freezeInput } from "../utils/FreezeGoalProgress";

export const FIXED_TIMESTAMP = "2026-07-25T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createGoalProgressInput(
  overrides: Partial<GoalProgressInput> = {},
): GoalProgressInput {
  return freezeInput({
    id: overrides.id ?? "request:goal-progress:test",
    kind: overrides.kind ?? GoalProgressInputKinds.EVALUATE,
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
    metadata: overrides.metadata ?? EMPTY_GOAL_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestGoalProgressEngineService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): GoalProgressEngineService {
  const withMocks = overrides.withMocks ?? true;
  return createGoalProgressEngineService({
    decisionEnginePort: withMocks ? createMockDecisionEnginePort() : undefined,
    recommendationEnginePort: withMocks ? createMockRecommendationEnginePort() : undefined,
    nutritionAdaptationPort: withMocks ? createMockNutritionAdaptationPort() : undefined,
    workoutAdaptationPort: withMocks ? createMockWorkoutAdaptationPort() : undefined,
    recoveryAdaptationPort: withMocks ? createMockRecoveryAdaptationPort() : undefined,
    athleteStatePort: withMocks ? createMockAthleteStatePort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
