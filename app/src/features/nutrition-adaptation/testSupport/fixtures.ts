import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachContextPort } from "../contracts/CoachContextPort";
import { createMockContinuousAdaptationPort } from "../contracts/ContinuousAdaptationPort";
import { createMockNutritionPlanPort } from "../contracts/NutritionPlanPort";
import { createMockNutritionRuntimePort } from "../contracts/NutritionRuntimePort";
import { NutritionAdaptationInputKinds } from "../models/NutritionAdaptationInput";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import { EMPTY_NUTRITION_METADATA } from "../models/NutritionMetadata";
import {
  createNutritionAdaptationEngineService,
  type NutritionAdaptationEngineService,
} from "../services/NutritionAdaptationEngineService";
import { freezeInput } from "../utils/FreezeNutritionAdaptation";

export const FIXED_TIMESTAMP = "2026-07-26T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createNutritionAdaptationInput(
  overrides: Partial<NutritionAdaptationInput> = {},
): NutritionAdaptationInput {
  return freezeInput({
    id: overrides.id ?? "request:nutrition-adaptation:test",
    kind: overrides.kind ?? NutritionAdaptationInputKinds.ADAPT,
    athleteId: overrides.athleteId ?? "athlete:1",
    planId: overrides.planId ?? "plan:1",
    sessionId: overrides.sessionId ?? "session:1",
    contextId: overrides.contextId ?? "context:1",
    planKeys:
      overrides.planKeys ??
      Object.freeze(["plan:1", "plan:structure", "plan:meal:breakfast"]),
    dayKeys: overrides.dayKeys ?? Object.freeze(["day:plan:1:1", "day:plan:1:2"]),
    mealKeys:
      overrides.mealKeys ??
      Object.freeze(["meal:plan:1:breakfast", "meal:plan:1:lunch", "meal:plan:1:dinner"]),
    macroKeys:
      overrides.macroKeys ??
      Object.freeze(["macro:plan:1:protein", "macro:plan:1:carbohydrate", "macro:plan:1:fat"]),
    timingKeys:
      overrides.timingKeys ??
      Object.freeze(["timing:plan:1:pre", "timing:plan:1:post"]),
    weekKeys:
      overrides.weekKeys ?? Object.freeze(["week:plan:1:1", "week:plan:1:2"]),
    decisionKeys:
      overrides.decisionKeys ??
      Object.freeze([
        "decision:key:athlete:1:calorie",
        "decision:key:athlete:1:macro",
        "decision:key:hydration",
      ]),
    signalKeys:
      overrides.signalKeys ??
      Object.freeze(["state:adherence", "state:hydration", "state:recovery"]),
    signalFlags:
      overrides.signalFlags ??
      Object.freeze({
        "calorie:flag": true,
        "macro:flag": true,
        "hydration:flag": true,
      }),
    priorSnapshot: overrides.priorSnapshot ?? null,
    decisionRef: overrides.decisionRef ?? null,
    planRef: overrides.planRef ?? null,
    runtimeRef: overrides.runtimeRef ?? null,
    athleteStateRef: overrides.athleteStateRef ?? null,
    coachContextRef: overrides.coachContextRef ?? null,
    reason: overrides.reason ?? "test",
    metadata: overrides.metadata ?? EMPTY_NUTRITION_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestNutritionAdaptationEngineService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): NutritionAdaptationEngineService {
  const withMocks = overrides.withMocks ?? true;
  return createNutritionAdaptationEngineService({
    nutritionPlanPort: withMocks ? createMockNutritionPlanPort() : undefined,
    nutritionRuntimePort: withMocks ? createMockNutritionRuntimePort() : undefined,
    athleteStatePort: withMocks ? createMockAthleteStatePort() : undefined,
    continuousAdaptationPort: withMocks ? createMockContinuousAdaptationPort() : undefined,
    coachContextPort: withMocks ? createMockCoachContextPort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
