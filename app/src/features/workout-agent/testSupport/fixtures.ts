import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import { ActionIntents } from "../../action-engine/models/ActionIntent";
import { ActionPriorities } from "../../action-engine/models/ActionPriority";
import { ActionStatuses } from "../../action-engine/models/ActionStatus";
import { EMPTY_ACTION_METADATA } from "../../action-engine/models/ActionMetadata";
import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import { DEFAULT_COACH_CONFIDENCE } from "../../response-formatter/models/CoachConfidence";
import { DEFAULT_COACH_FORMATTING } from "../../response-formatter/models/CoachFormatting";
import { createCoachMessage } from "../../response-formatter/models/CoachMessage";
import { EMPTY_COACH_METADATA } from "../../response-formatter/models/CoachMetadata";
import { CoachResponseIntents } from "../../response-formatter/models/CoachResponseIntent";
import type { ToolExecutionResult } from "../../tool-runtime/models/ToolExecutionResult";
import { ToolExecutionStatuses } from "../../tool-runtime/models/ToolExecutionStatus";
import { EMPTY_WORKOUT_AGENT_METADATA } from "../models/WorkoutAgentMetadata";
import { WorkoutIntents } from "../models/WorkoutIntent";
import { WorkoutObjectives } from "../models/WorkoutObjective";
import type { WorkoutRequest } from "../models/WorkoutRequest";
import { WorkoutExperienceLevels } from "../models/WorkoutRequest";
import { createWorkoutAgentService } from "../services/WorkoutAgentService";

export const FIXED_TIMESTAMP = "2026-07-23T12:00:00.000Z";
export const FIXED_NOW_MS = 1_721_736_000_000;

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createTestAgentService(
  overrides: Parameters<typeof createWorkoutAgentService>[0] = {},
) {
  return createWorkoutAgentService({
    clock: createFixedClock(),
    nowMs: () => FIXED_NOW_MS,
    agentId: "agent:workout:test",
    ...overrides,
  });
}

export function createWorkoutRequestFixture(
  overrides: Partial<WorkoutRequest> = {},
): WorkoutRequest {
  return Object.freeze({
    id: "wreq:test:1",
    athleteId: "athlete-1",
    conversationId: "conv-1",
    message: "Build a hypertrophy workout plan for 4 days per week",
    intentHint: WorkoutIntents.PLAN_WORKOUT,
    objectiveHint: WorkoutObjectives.HYPERTROPHY,
    daysPerWeek: 4,
    experienceLevel: WorkoutExperienceLevels.INTERMEDIATE,
    constraints: Object.freeze([] as string[]),
    metadata: EMPTY_WORKOUT_AGENT_METADATA,
    createdAt: FIXED_TIMESTAMP,
    ...overrides,
  });
}

export function createMockCoachResponse(): CoachResponse {
  return Object.freeze({
    id: "coach:resp:1",
    sourceResponseId: "ai:1",
    message: createCoachMessage("msg:1", "Here is a hypertrophy plan."),
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
    metadata: EMPTY_COACH_METADATA,
    reasoning: null,
    createdAt: FIXED_TIMESTAMP,
    frozenAt: FIXED_TIMESTAMP,
  });
}

export function createMockActionPlan(): ActionPlan {
  return Object.freeze({
    id: "action:plan:1",
    sourceResponseId: "coach:resp:1",
    intent: ActionIntents.START_WORKOUT,
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
