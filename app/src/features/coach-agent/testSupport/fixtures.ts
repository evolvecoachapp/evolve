import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import { ActionIntents } from "../../action-engine/models/ActionIntent";
import { ActionPriorities } from "../../action-engine/models/ActionPriority";
import { ActionStatuses } from "../../action-engine/models/ActionStatus";
import { EMPTY_ACTION_METADATA } from "../../action-engine/models/ActionMetadata";
import type { NutritionAgentResult } from "../../nutrition-agent/models/NutritionAgentResult";
import type { RecoveryAgentResult } from "../../recovery-agent/models/RecoveryAgentResult";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import { DEFAULT_COACH_CONFIDENCE } from "../../response-formatter/models/CoachConfidence";
import { DEFAULT_COACH_FORMATTING } from "../../response-formatter/models/CoachFormatting";
import { createCoachMessage } from "../../response-formatter/models/CoachMessage";
import { EMPTY_COACH_METADATA as EMPTY_FORMATTER_METADATA } from "../../response-formatter/models/CoachMetadata";
import { CoachResponseIntents } from "../../response-formatter/models/CoachResponseIntent";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import { ToolExecutionStatuses } from "../../tool-runtime/models/ToolExecutionStatus";
import type { WorkoutAgentResult } from "../../workout-agent/models/WorkoutAgentResult";
import { CoachIntents } from "../models/CoachIntent";
import { EMPTY_COACH_METADATA } from "../models/CoachMetadata";
import type { CoachRequest } from "../models/CoachRequest";
import { SpecialistAgentKinds } from "../models/SpecialistAgentKind";
import {
  createCoachAgentService,
  type CoachAgentService,
} from "../services/CoachAgentService";
import type { SpecialistAgentPorts } from "../coordinator/SpecialistAgentPorts";

export const FIXED_TIMESTAMP = "2026-07-23T12:00:00.000Z";
export const FIXED_NOW_MS = 1_721_736_000_000;

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

function mockConfidence(score = 0.85) {
  return Object.freeze({
    score,
    label: score >= 0.8 ? ("high" as const) : ("medium" as const),
    rationale: "test",
  });
}

export function createMockWorkoutResult(
  overrides: Partial<WorkoutAgentResult> = {},
): WorkoutAgentResult {
  return Object.freeze({
    id: "wresult:mock:1",
    request: Object.freeze({
      id: "wreq:mock:1",
      athleteId: "athlete-1",
      conversationId: "conv-1",
      message: "workout",
      intentHint: null,
      objectiveHint: null,
      daysPerWeek: null,
      experienceLevel: null,
      constraints: Object.freeze([] as string[]),
      metadata: Object.freeze({ tags: Object.freeze([] as string[]), attributes: Object.freeze({}) }),
      createdAt: FIXED_TIMESTAMP,
    }),
    context: {} as WorkoutAgentResult["context"],
    conversation: {} as WorkoutAgentResult["conversation"],
    reasoning: Object.freeze([]),
    decision: Object.freeze({
      id: "wdecision:1",
      accepted: true,
      confidence: mockConfidence(),
    }) as WorkoutAgentResult["decision"],
    recommendations: Object.freeze([
      Object.freeze({
        id: "wrec:1",
        category: "general" as const,
        title: "Train consistently",
        detail: "Follow the proposed split",
        priority: 10,
        confidence: mockConfidence(),
        relatedExerciseIds: Object.freeze([] as string[]),
      }),
    ]),
    explanation: Object.freeze({
      id: "wexplain:1",
      summary: "Workout plan proposed",
    }) as WorkoutAgentResult["explanation"],
    validation: Object.freeze({ valid: true, issues: Object.freeze([]) }),
    snapshot: {} as WorkoutAgentResult["snapshot"],
    statistics: {} as WorkoutAgentResult["statistics"],
    domainInvocations: Object.freeze([]),
    success: true,
    message: "Workout ok",
    metadata: Object.freeze({ tags: Object.freeze([] as string[]), attributes: Object.freeze({}) }),
    startedAt: FIXED_TIMESTAMP,
    completedAt: FIXED_TIMESTAMP,
    frozenAt: FIXED_TIMESTAMP,
    ...overrides,
  }) as WorkoutAgentResult;
}

export function createMockRecoveryResult(
  overrides: Partial<RecoveryAgentResult> = {},
): RecoveryAgentResult {
  return Object.freeze({
    id: "rresult:mock:1",
    request: Object.freeze({
      id: "rreq:mock:1",
      athleteId: "athlete-1",
      conversationId: "conv-1",
      message: "recovery",
      intentHint: null,
      goalHint: null,
      sleepHours: null,
      sleepQuality: null,
      stressLevel: null,
      fatigueLevel: null,
      sorenessLevel: null,
      hrvScore: null,
      readinessHint: null,
      trainingLoadHint: null,
      constraints: Object.freeze([] as string[]),
      metadata: Object.freeze({ tags: Object.freeze([] as string[]), attributes: Object.freeze({}) }),
      createdAt: FIXED_TIMESTAMP,
    }),
    context: {} as RecoveryAgentResult["context"],
    conversation: {} as RecoveryAgentResult["conversation"],
    reasoning: Object.freeze([]),
    decision: Object.freeze({
      id: "rdecision:1",
      accepted: true,
    }) as RecoveryAgentResult["decision"],
    recommendations: Object.freeze([
      Object.freeze({
        id: "rrec:1",
        category: "sleep" as const,
        title: "Prioritize sleep",
        detail: "Aim for 8 hours",
        priority: 20,
      }),
    ]),
    explanation: Object.freeze({
      id: "rexplain:1",
      summary: "Recovery plan proposed",
    }) as RecoveryAgentResult["explanation"],
    validation: Object.freeze({ valid: true, issues: Object.freeze([]) }),
    snapshot: {} as RecoveryAgentResult["snapshot"],
    statistics: {} as RecoveryAgentResult["statistics"],
    success: true,
    message: "Recovery ok",
    metadata: Object.freeze({ tags: Object.freeze([] as string[]), attributes: Object.freeze({}) }),
    startedAt: FIXED_TIMESTAMP,
    completedAt: FIXED_TIMESTAMP,
    frozenAt: FIXED_TIMESTAMP,
    ...overrides,
  }) as RecoveryAgentResult;
}

export function createMockNutritionResult(
  overrides: Partial<NutritionAgentResult> = {},
): NutritionAgentResult {
  return Object.freeze({
    id: "nresult:mock:1",
    request: Object.freeze({
      id: "nreq:mock:1",
      athleteId: "athlete-1",
      conversationId: "conv-1",
      message: "nutrition",
      intentHint: null,
      goalHint: null,
      bodyWeightKg: null,
      activityLevel: null,
      constraints: Object.freeze([] as string[]),
      preferences: null,
      metadata: Object.freeze({ tags: Object.freeze([] as string[]), attributes: Object.freeze({}) }),
      createdAt: FIXED_TIMESTAMP,
    }),
    context: {} as NutritionAgentResult["context"],
    conversation: {} as NutritionAgentResult["conversation"],
    reasoning: Object.freeze([]),
    decision: Object.freeze({
      id: "ndecision:1",
      accepted: true,
    }) as NutritionAgentResult["decision"],
    recommendations: Object.freeze([
      Object.freeze({
        id: "nrec:1",
        category: "macros" as const,
        title: "Hit protein target",
        detail: "Distribute protein across meals",
        priority: 15,
        confidence: mockConfidence(0.9),
        relatedPlanId: null,
      }),
    ]),
    explanation: Object.freeze({
      id: "nexplain:1",
      summary: "Nutrition plan proposed",
    }) as NutritionAgentResult["explanation"],
    validation: Object.freeze({ valid: true, issues: Object.freeze([]) }),
    snapshot: {} as NutritionAgentResult["snapshot"],
    statistics: {} as NutritionAgentResult["statistics"],
    domainInvocations: Object.freeze([]),
    success: true,
    message: "Nutrition ok",
    metadata: Object.freeze({ tags: Object.freeze([] as string[]), attributes: Object.freeze({}) }),
    startedAt: FIXED_TIMESTAMP,
    completedAt: FIXED_TIMESTAMP,
    frozenAt: FIXED_TIMESTAMP,
    ...overrides,
  }) as NutritionAgentResult;
}

export function createMockSpecialistPorts(
  options: {
    readonly workout?: WorkoutAgentResult;
    readonly recovery?: RecoveryAgentResult;
    readonly nutrition?: NutritionAgentResult;
    readonly failWorkout?: boolean;
  } = {},
): SpecialistAgentPorts {
  return Object.freeze({
    processWorkout: () => {
      if (options.failWorkout) {
        throw new Error("Workout agent exploded");
      }
      return options.workout ?? createMockWorkoutResult();
    },
    processRecovery: () => options.recovery ?? createMockRecoveryResult(),
    processNutrition: () => options.nutrition ?? createMockNutritionResult(),
  });
}

export function createTestAgentService(
  ports: SpecialistAgentPorts = createMockSpecialistPorts(),
): CoachAgentService {
  return createCoachAgentService({
    clock: createFixedClock(),
    nowMs: () => FIXED_NOW_MS,
    agentId: "agent:coach:test",
    ports,
  });
}

export function createCoachRequestFixture(
  overrides: Partial<CoachRequest> = {},
): CoachRequest {
  return Object.freeze({
    id: "creq:test:1",
    athleteId: "athlete-1",
    conversationId: "conv-1",
    message: "Help me with training, recovery, and nutrition",
    intentHint: CoachIntents.HOLISTIC,
    agentHints: Object.freeze([] as CoachRequest["agentHints"]),
    workoutRequest: null,
    recoveryRequest: null,
    nutritionRequest: null,
    constraints: Object.freeze([] as string[]),
    metadata: EMPTY_COACH_METADATA,
    createdAt: FIXED_TIMESTAMP,
    ...overrides,
  });
}

export function createWorkoutFocusRequest(): CoachRequest {
  return createCoachRequestFixture({
    id: "creq:workout:1",
    message: "Build me a strength workout program",
    intentHint: CoachIntents.WORKOUT_FOCUS,
    agentHints: Object.freeze([SpecialistAgentKinds.WORKOUT]),
  });
}

export function createMockCoachResponse(): CoachResponse {
  return Object.freeze({
    id: "coach:resp:1",
    sourceResponseId: "ai:1",
    message: createCoachMessage("msg:1", "Here is a holistic coaching plan."),
    intent: CoachResponseIntents.RECOMMENDATION,
    recommendations: Object.freeze([]),
    warnings: Object.freeze([]),
    insights: Object.freeze([]),
    actions: Object.freeze([]),
    exercises: Object.freeze([]),
    nutrition: Object.freeze([]),
    recovery: Object.freeze([]),
    questions: Object.freeze([]),
    citations: Object.freeze([]),
    sections: Object.freeze([]),
    confidence: DEFAULT_COACH_CONFIDENCE,
    formatting: DEFAULT_COACH_FORMATTING,
    metadata: EMPTY_FORMATTER_METADATA,
    reasoning: null,
    createdAt: FIXED_TIMESTAMP,
    frozenAt: FIXED_TIMESTAMP,
  });
}

export function createMockActionPlan(): ActionPlan {
  return Object.freeze({
    id: "action:plan:1",
    sourceResponseId: "coach:resp:1",
    intent: ActionIntents.ADJUST_NUTRITION,
    steps: Object.freeze([]),
    dependencies: Object.freeze([]),
    constraints: Object.freeze([]),
    priority: ActionPriorities.MEDIUM,
    status: ActionStatuses.READY,
    metadata: EMPTY_ACTION_METADATA,
    createdAt: FIXED_TIMESTAMP,
    frozenAt: FIXED_TIMESTAMP,
  });
}

export function createMockToolExecutionResult(): ToolExecutionResult {
  return Object.freeze({
    id: "texec:result:1",
    requestId: "texec:req:1",
    planId: "texec:plan:1",
    actionPlanId: "action:plan:1",
    success: true,
    status: ToolExecutionStatuses.SUCCEEDED,
    results: Object.freeze([]),
    completedStepIds: Object.freeze([] as string[]),
    failedStepIds: Object.freeze([] as string[]),
    skippedStepIds: Object.freeze([] as string[]),
    message: "ok",
    startedAt: FIXED_TIMESTAMP,
    completedAt: FIXED_TIMESTAMP,
    durationMs: 10,
  });
}
