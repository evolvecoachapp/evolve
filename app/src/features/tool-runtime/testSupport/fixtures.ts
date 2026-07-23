import { ActionPlanBuilder } from "../../action-engine/builders/ActionPlanBuilder";
import { ActionStepBuilder } from "../../action-engine/builders/ActionStepBuilder";
import { ActionIntents } from "../../action-engine/models/ActionIntent";
import { ActionPriorities } from "../../action-engine/models/ActionPriority";
import { ActionStatuses } from "../../action-engine/models/ActionStatus";
import { ActionTypes } from "../../action-engine/models/ActionType";
import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import { EMPTY_ACTION_METADATA } from "../../action-engine/models/ActionMetadata";
import type { IDomainToolAdapter } from "../../domain-tools/contracts/IDomainToolAdapter";
import { DomainToolIds } from "../../domain-tools/models/DomainToolIds";
import type { FoundationToolResult } from "../../tool-calling/models/FoundationToolResult";
import type { ToolCallRequest } from "../../tool-calling/models/ToolCallRequest";
import {
  createToolDefinition,
  type ToolDefinition,
} from "../../tool-calling/models/ToolDefinition";
import type { ToolDescriptor } from "../../tool-calling/models/ToolDescriptor";
import type { DomainToolDomain } from "../../domain-tools/models/DomainToolDomain";
import { createToolRuntimeService } from "../services/ToolRuntimeService";

export const FIXED_TIMESTAMP = "2026-07-23T12:00:00.000Z";

function mockDefinition(toolId: string): ToolDefinition {
  return createToolDefinition({
    id: toolId,
    name: toolId,
    description: `Mock ${toolId}`,
    capabilities: Object.freeze(["query" as const]),
    metadata: Object.freeze({
      version: "test",
      tags: Object.freeze([] as string[]),
      createdAt: FIXED_TIMESTAMP,
    }),
  });
}

function mockDescriptor(toolId: string): ToolDescriptor {
  return Object.freeze({
    id: toolId,
    name: toolId,
    description: `Mock ${toolId}`,
    category: "domain" as const,
    capabilities: Object.freeze(["query" as const]),
  });
}

/**
 * Minimal mock Domain Tool Adapter — never invokes real domain services.
 */
export function createMockDomainToolAdapter(options: {
  readonly id: string;
  readonly domain: DomainToolDomain;
  readonly toolIds: readonly string[];
  readonly executeImpl?: (
    request: ToolCallRequest,
  ) => Promise<FoundationToolResult>;
}): IDomainToolAdapter {
  const toolIds = Object.freeze([...options.toolIds]);
  return {
    id: () => options.id,
    domain: () => options.domain,
    supportedToolIds: () => toolIds,
    canHandle: (toolId: string) => toolIds.includes(toolId),
    definition: (toolId: string): ToolDefinition | null =>
      toolIds.includes(toolId) ? mockDefinition(toolId) : null,
    describe: (toolId: string): ToolDescriptor | null =>
      toolIds.includes(toolId) ? mockDescriptor(toolId) : null,
    listTools: () => Object.freeze(toolIds.map(mockDescriptor)),
    execute: async (request: ToolCallRequest): Promise<FoundationToolResult> => {
      if (options.executeImpl) {
        return options.executeImpl(request);
      }
      return Object.freeze({
        executionId: `exec:${request.id}`,
        requestId: request.id,
        callId: request.call.id,
        toolId: request.call.toolId,
        output: Object.freeze({
          data: Object.freeze({ mock: true, toolId: request.call.toolId }),
        }),
        error: null,
        status: "succeeded",
        durationMs: 1,
        completedAt: FIXED_TIMESTAMP,
      });
    },
  };
}

export function createMockAdapterCatalog(): readonly IDomainToolAdapter[] {
  return Object.freeze([
    createMockDomainToolAdapter({
      id: "adapter.workout.mock",
      domain: "workout",
      toolIds: [
        DomainToolIds.WORKOUT_GENERATE,
        DomainToolIds.WORKOUT_ANALYZE_PERFORMANCE,
      ],
    }),
    createMockDomainToolAdapter({
      id: "adapter.recovery.mock",
      domain: "recovery",
      toolIds: [
        DomainToolIds.RECOVERY_ANALYZE,
        DomainToolIds.RECOVERY_SUMMARIZE,
      ],
    }),
    createMockDomainToolAdapter({
      id: "adapter.coach.mock",
      domain: "coach",
      toolIds: [
        DomainToolIds.COACH_PREPARE_CONTEXT,
        DomainToolIds.COACH_GENERATE_INSIGHTS,
        DomainToolIds.COACH_SUMMARIZE,
      ],
    }),
    createMockDomainToolAdapter({
      id: "adapter.athlete.mock",
      domain: "athlete",
      toolIds: [
        DomainToolIds.ATHLETE_BUILD_HISTORY,
        DomainToolIds.ATHLETE_SUMMARIZE_HISTORY,
        DomainToolIds.ATHLETE_EVALUATE_ACHIEVEMENTS,
      ],
    }),
  ]);
}

export function createWorkoutActionPlanFixture(
  overrides: { readonly id?: string } = {},
): ActionPlan {
  const planId = overrides.id ?? "plan:workout:1";
  const step = new ActionStepBuilder()
    .withId("step:workout:1")
    .withPlanId(planId)
    .withType(ActionTypes.WORKOUT)
    .withIntent(ActionIntents.START_WORKOUT)
    .withLabel("Generate workout")
    .withDescription("Plan a lower-body session")
    .withPriority(ActionPriorities.HIGH)
    .withStatus(ActionStatuses.READY)
    .withOrder(0)
    .withArguments(
      Object.freeze([
        Object.freeze({
          name: "focus",
          value: "lower",
          required: false,
        }),
      ]),
    )
    .withMetadata({
      ...EMPTY_ACTION_METADATA,
      sourceResponseId: "coach:1",
      tags: Object.freeze(["workout"]),
    })
    .build();

  return new ActionPlanBuilder()
    .withId(planId)
    .withSourceResponseId("coach:1")
    .withIntent(ActionIntents.START_WORKOUT)
    .withSteps(Object.freeze([step]))
    .withPriority(ActionPriorities.HIGH)
    .withStatus(ActionStatuses.READY)
    .withMetadata({
      ...EMPTY_ACTION_METADATA,
      sourceResponseId: "coach:1",
    })
    .withCreatedAt(FIXED_TIMESTAMP)
    .withFrozenAt(FIXED_TIMESTAMP)
    .build();
}

export function createMultiStepActionPlanFixture(): ActionPlan {
  const planId = "plan:multi:1";
  const workout = new ActionStepBuilder()
    .withId("step:workout:1")
    .withPlanId(planId)
    .withType(ActionTypes.WORKOUT)
    .withIntent(ActionIntents.START_WORKOUT)
    .withLabel("Generate workout")
    .withPriority(ActionPriorities.HIGH)
    .withStatus(ActionStatuses.READY)
    .withOrder(0)
    .build();

  const recovery = new ActionStepBuilder()
    .withId("step:recovery:1")
    .withPlanId(planId)
    .withType(ActionTypes.RECOVERY)
    .withIntent(ActionIntents.RECOVER)
    .withLabel("Analyze recovery")
    .withPriority(ActionPriorities.MEDIUM)
    .withStatus(ActionStatuses.READY)
    .withOrder(1)
    .withDependsOn(Object.freeze(["step:workout:1"]))
    .build();

  const reminder = new ActionStepBuilder()
    .withId("step:reminder:1")
    .withPlanId(planId)
    .withType(ActionTypes.REMINDER)
    .withIntent(ActionIntents.SCHEDULE_REMINDER)
    .withLabel("Set reminder")
    .withPriority(ActionPriorities.LOW)
    .withStatus(ActionStatuses.READY)
    .withOrder(2)
    .withDependsOn(Object.freeze(["step:recovery:1"]))
    .build();

  return new ActionPlanBuilder()
    .withId(planId)
    .withSourceResponseId("coach:multi")
    .withIntent(ActionIntents.COMPOSITE)
    .withSteps(Object.freeze([workout, recovery, reminder]))
    .withPriority(ActionPriorities.HIGH)
    .withStatus(ActionStatuses.READY)
    .withCreatedAt(FIXED_TIMESTAMP)
    .withFrozenAt(FIXED_TIMESTAMP)
    .build();
}

export function createEmptyActionPlanFixture(): ActionPlan {
  return new ActionPlanBuilder()
    .withId("plan:empty:1")
    .withSourceResponseId("coach:empty")
    .withIntent(ActionIntents.UNKNOWN)
    .withSteps(Object.freeze([]))
    .withStatus(ActionStatuses.SKIPPED)
    .withCreatedAt(FIXED_TIMESTAMP)
    .withFrozenAt(FIXED_TIMESTAMP)
    .build();
}

export function createTestRuntimeHarness() {
  const adapters = createMockAdapterCatalog();
  const service = createToolRuntimeService({
    adapters,
    clock: () => FIXED_TIMESTAMP,
    nowMs: () => 1_000,
  });
  return Object.freeze({ service, adapters });
}
