import { EMPTY_NUTRITION_AGENT_METADATA } from "../../nutrition-agent/models/NutritionMetadata";
import { NutritionGoals } from "../../nutrition-agent/models/NutritionGoal";
import type { NutritionPlan } from "../../nutrition-agent/models/NutritionPlan";
import { PlanChangeReasons } from "../../plan-history/models/PlanChangeReason";
import { PlanTypes } from "../../plan-history/models/PlanType";
import {
  createPlanHistoryService,
  type PlanHistoryService,
} from "../../plan-history/services/PlanHistoryService";
import {
  createPlanRestoreService,
  type PlanRestoreService,
} from "../services/PlanRestoreService";
import {
  EMPTY_RESTORE_METADATA,
  type PlanRestoreRequest,
} from "../models/PlanRestoreRequest";
import {
  PlanRestoreTargetKinds,
  type PlanRestoreTarget,
} from "../models/PlanRestoreTarget";
import {
  createPipelineRequest,
  createTestWorkoutGenerationPipelineService,
  FIXED_GENERATION_TIMESTAMP,
} from "../../workout-generation-pipeline/testSupport/fixtures";
import { generateWorkoutPlan } from "../../workout-generation-pipeline/application";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";

export const FIXED_RESTORE_TIMESTAMP = FIXED_GENERATION_TIMESTAMP;

export function createRestoreClock(start = FIXED_RESTORE_TIMESTAMP): {
  readonly now: () => string;
  readonly advance: (ms: number) => void;
} {
  let current = Date.parse(start);
  return {
    now: () => new Date(current).toISOString(),
    advance: (ms: number) => {
      current += ms;
    },
  };
}

export function createNutritionPlanFixture(
  overrides: Partial<NutritionPlan> = {},
): NutritionPlan {
  return Object.freeze({
    id: overrides.id ?? "nutrition-plan:1",
    planningContextId: overrides.planningContextId ?? "npc:1",
    goal: overrides.goal ?? NutritionGoals.FAT_LOSS,
    strategyId: overrides.strategyId ?? "strategy:cut",
    calorieTargets: overrides.calorieTargets ??
      Object.freeze({
        tdeeEstimate: 2500,
        targetCalories: 2000,
        deficitOrSurplus: -500,
      }),
    macroTargets: overrides.macroTargets ??
      Object.freeze({
        calories: 2000,
        proteinG: 160,
        carbsG: 180,
        fatG: 60,
        fiberG: 30,
      }),
    mealDistribution: overrides.mealDistribution ??
      Object.freeze({
        mealsPerDay: 4,
        distribution: Object.freeze([
          "breakfast",
          "lunch",
          "dinner",
          "snack",
        ]),
      }),
    hydrationPlan: overrides.hydrationPlan ??
      Object.freeze({
        litersPerDay: 3,
        notes: Object.freeze([] as string[]),
      }),
    supplementPlan: overrides.supplementPlan ??
      Object.freeze({
        items: Object.freeze([] as string[]),
        notes: Object.freeze([] as string[]),
      }),
    phaseHint: overrides.phaseHint ?? "cut",
    confidence: overrides.confidence ??
      Object.freeze({
        score: 0.8,
        label: "high" as const,
        rationale: "fixture",
      }),
    rationale: overrides.rationale ?? Object.freeze(["fixture nutrition plan"]),
    metadata: overrides.metadata ?? EMPTY_NUTRITION_AGENT_METADATA,
    createdAt: overrides.createdAt ?? FIXED_RESTORE_TIMESTAMP,
  });
}

export async function createWorkoutPlanFixture(): Promise<WorkoutPlan> {
  const pipeline = createTestWorkoutGenerationPipelineService();
  const result = await generateWorkoutPlan({
    service: pipeline,
    request: createPipelineRequest({ id: "pipeline-req:restore" }),
  });
  if (!result.plan) {
    throw new Error("Failed to generate workout plan fixture");
  }
  return result.plan;
}

export function createTestPlanRestoreStack(clock?: () => string): {
  readonly planHistory: PlanHistoryService;
  readonly planRestore: PlanRestoreService;
  readonly clock: () => string;
} {
  const resolvedClock = clock ?? (() => FIXED_RESTORE_TIMESTAMP);
  const planHistory = createPlanHistoryService({ clock: resolvedClock });
  const planRestore = createPlanRestoreService({
    planHistory,
    clock: resolvedClock,
  });
  return { planHistory, planRestore, clock: resolvedClock };
}

export function createRestoreTarget(
  overrides: Partial<PlanRestoreTarget> & {
    readonly lineageId: string;
  },
): PlanRestoreTarget {
  return Object.freeze({
    kind: overrides.kind ?? PlanRestoreTargetKinds.PREVIOUS_VERSION,
    planType: overrides.planType ?? PlanTypes.WORKOUT,
    lineageId: overrides.lineageId,
    versionNumber: overrides.versionNumber ?? null,
    timestamp: overrides.timestamp ?? null,
    changeReason: overrides.changeReason ?? null,
    snapshotId: overrides.snapshotId ?? null,
  });
}

export function createRestoreRequest(
  overrides: Partial<PlanRestoreRequest> & {
    readonly target: PlanRestoreTarget;
  },
): PlanRestoreRequest {
  return Object.freeze({
    id: overrides.id ?? "restore-req:1",
    athleteId: overrides.athleteId ?? "athlete:1",
    conversationId: overrides.conversationId ?? "conversation:1",
    sessionId: overrides.sessionId ?? null,
    message: overrides.message ?? "Undo my last workout change",
    target: overrides.target,
    metadata: overrides.metadata ?? EMPTY_RESTORE_METADATA,
    createdAt: overrides.createdAt ?? FIXED_RESTORE_TIMESTAMP,
  });
}

export { PlanChangeReasons, PlanTypes, PlanRestoreTargetKinds };
