import { ToolCallRequestBuilder } from "../../tool-calling/builders/ToolCallRequestBuilder";
import { ToolExecutionContextBuilder } from "../../tool-calling/builders/ToolExecutionContextBuilder";
import type { ToolCallRequest } from "../../tool-calling/models/ToolCallRequest";
import type { ToolExecutionContext } from "../../tool-calling/models/ToolExecutionContext";
import { createAthleteToolAdapter } from "../adapters/AthleteToolAdapter";
import { createCoachToolAdapter } from "../adapters/CoachToolAdapter";
import { createRecoveryToolAdapter } from "../adapters/RecoveryToolAdapter";
import { createWorkoutToolAdapter } from "../adapters/WorkoutToolAdapter";
import type { IDomainToolAdapter } from "../contracts/IDomainToolAdapter";
import { DomainToolIds } from "../models/DomainToolIds";
import { createDomainToolService } from "../services/DomainToolService";

export const FIXED_TIMESTAMP = "2026-07-23T12:00:00.000Z";

export function createExecutionContext(
  overrides: Partial<ToolExecutionContext> = {},
): ToolExecutionContext {
  return new ToolExecutionContextBuilder()
    .withConversationId(overrides.conversationId ?? "conv-1")
    .withAthleteId(overrides.athleteId ?? "athlete-1")
    .withStreamId(overrides.streamId ?? null)
    .withExecutionRequestId(overrides.executionRequestId ?? null)
    .withNow(overrides.now ?? FIXED_TIMESTAMP)
    .withAttributes(overrides.attributes ?? {})
    .build();
}

export function createDomainToolRequest(options: {
  readonly toolId: string;
  readonly parameters?: Readonly<Record<string, unknown>>;
  readonly requestId?: string;
  readonly callId?: string;
  readonly context?: ToolExecutionContext;
  readonly createdAt?: string;
}): ToolCallRequest {
  const createdAt = options.createdAt ?? FIXED_TIMESTAMP;
  return new ToolCallRequestBuilder()
    .withId(options.requestId ?? `tool-req:${options.toolId}`)
    .withCreatedAt(createdAt)
    .withContext(options.context ?? createExecutionContext({ now: createdAt }))
    .withToolCall({
      callId: options.callId ?? `call:${options.toolId}`,
      toolId: options.toolId,
      parameters: options.parameters ?? {},
      createdAt,
    })
    .build();
}

export function createMockDomainResult(tag: string): Readonly<Record<string, unknown>> {
  return Object.freeze({
    tag,
    frozenAt: FIXED_TIMESTAMP,
  });
}

/**
 * Test harness with injected domain invokers (no real domain execution).
 */
export function createTestDomainToolHarness() {
  const calls: string[] = [];

  const adapters: readonly IDomainToolAdapter[] = Object.freeze([
    createWorkoutToolAdapter({
      clock: () => FIXED_TIMESTAMP,
      nowMs: () => 1_000,
      generateWorkoutProgram: async () => {
        calls.push("generateWorkoutProgram");
        return createMockDomainResult("workout-generate") as never;
      },
      analyzeWorkoutPerformance: () => {
        calls.push("analyzeWorkoutPerformance");
        return createMockDomainResult("workout-performance") as never;
      },
    }),
    createRecoveryToolAdapter({
      clock: () => FIXED_TIMESTAMP,
      nowMs: () => 1_000,
      analyzeRecovery: () => {
        calls.push("analyzeRecovery");
        return createMockDomainResult("recovery-analyze") as never;
      },
      summarizeRecovery: () => {
        calls.push("summarizeRecovery");
        return createMockDomainResult("recovery-summarize") as never;
      },
    }),
    createCoachToolAdapter({
      clock: () => FIXED_TIMESTAMP,
      nowMs: () => 1_000,
      prepareCoachingContext: () => {
        calls.push("prepareCoachingContext");
        return createMockDomainResult("coach-prepare") as never;
      },
      generateInsights: () => {
        calls.push("generateInsights");
        return createMockDomainResult("coach-insights") as never;
      },
      summarizeCoachingContext: () => {
        calls.push("summarizeCoachingContext");
        return createMockDomainResult("coach-summarize") as never;
      },
    }),
    createAthleteToolAdapter({
      clock: () => FIXED_TIMESTAMP,
      nowMs: () => 1_000,
      buildAthleteHistory: () => {
        calls.push("buildAthleteHistory");
        return createMockDomainResult("athlete-history") as never;
      },
      summarizeHistory: () => {
        calls.push("summarizeHistory");
        return createMockDomainResult("athlete-summarize") as never;
      },
      evaluateAchievements: () => {
        calls.push("evaluateAchievements");
        return createMockDomainResult("athlete-achievements") as never;
      },
    }),
  ]);

  const service = createDomainToolService({
    adapters,
    clock: () => FIXED_TIMESTAMP,
    nowMs: () => 1_000,
  });

  return { service, adapters, calls, DomainToolIds };
}
