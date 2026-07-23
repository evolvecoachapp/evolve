import type { IDomainToolAdapter } from "../contracts/IDomainToolAdapter";
import { DomainToolIds } from "../models/DomainToolIds";
import { createDomainToolService } from "../services/DomainToolService";
import {
  createDomainToolRequest,
  createMockDomainResult,
  createTestDomainToolHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { createToolDefinition } from "../../tool-calling/models/ToolDefinition";
import type { FoundationToolResult } from "../../tool-calling/models/FoundationToolResult";
import type { ToolCallRequest } from "../../tool-calling/models/ToolCallRequest";
import type { ToolDefinition } from "../../tool-calling/models/ToolDefinition";
import type { ToolDescriptor } from "../../tool-calling/models/ToolDescriptor";
import { FoundationToolResultBuilder } from "../builders/FoundationToolResultBuilder";
import {
  describeDomainTool,
  executeDomainTool,
  listDomainTools,
} from "../application";

describe("domain-tools integration", () => {
  it("runs end-to-end across workout → athlete → recovery → coach tools", async () => {
    const { service, calls } = createTestDomainToolHarness();

    const sequence = [
      {
        toolId: DomainToolIds.WORKOUT_GENERATE,
        parameters: { request: { athleteContext: { id: "a1" } } },
      },
      {
        toolId: DomainToolIds.WORKOUT_ANALYZE_PERFORMANCE,
        parameters: {
          workoutResult: { id: "w1" },
          eventStream: { id: "e1" },
        },
      },
      {
        toolId: DomainToolIds.ATHLETE_EVALUATE_ACHIEVEMENTS,
        parameters: {
          performanceSnapshot: { id: "p1" },
          workoutResult: { id: "w1" },
        },
      },
      {
        toolId: DomainToolIds.ATHLETE_BUILD_HISTORY,
        parameters: { athleteId: "athlete-1" },
      },
      {
        toolId: DomainToolIds.RECOVERY_ANALYZE,
        parameters: {
          athleteHistory: { id: "h1" },
          performanceSnapshot: { id: "p1" },
        },
      },
      {
        toolId: DomainToolIds.COACH_GENERATE_INSIGHTS,
        parameters: {
          performanceSnapshot: { id: "p1" },
          achievementResult: { id: "a1" },
          recoverySnapshot: { id: "r1" },
          athleteHistory: { id: "h1" },
        },
      },
      {
        toolId: DomainToolIds.COACH_PREPARE_CONTEXT,
        parameters: { insightSnapshot: { id: "i1" } },
      },
    ] as const;

    for (const step of sequence) {
      const result = await executeDomainTool({
        service,
        request: createDomainToolRequest(step),
      });
      expect(result.status).toBe("succeeded");
      expect(Object.isFrozen(result)).toBe(true);
    }

    expect(calls).toEqual(
      expect.arrayContaining([
        "generateWorkoutProgram",
        "analyzeWorkoutPerformance",
        "evaluateAchievements",
        "buildAthleteHistory",
        "analyzeRecovery",
        "generateInsights",
        "prepareCoachingContext",
      ]),
    );
  });

  it("supports future adapter registration without touching existing domains", async () => {
    const { adapters } = createTestDomainToolHarness();

    const nutritionDefinition = createToolDefinition({
      id: "domain.nutrition.plan",
      name: "Nutrition Plan",
      description: "Future nutrition adapter placeholder",
      category: "domain",
      capabilities: ["query"],
      metadata: Object.freeze({
        version: "1.0.0",
        tags: Object.freeze(["nutrition"]),
        createdAt: FIXED_TIMESTAMP,
      }),
    });

    const nutritionAdapter: IDomainToolAdapter = {
      id: () => "adapter.nutrition",
      domain: () => "nutrition",
      supportedToolIds: () => Object.freeze(["domain.nutrition.plan"]),
      canHandle: (toolId) => toolId === "domain.nutrition.plan",
      definition: (toolId): ToolDefinition | null =>
        toolId === "domain.nutrition.plan" ? nutritionDefinition : null,
      describe: (toolId): ToolDescriptor | null =>
        toolId === "domain.nutrition.plan"
          ? Object.freeze({
              id: nutritionDefinition.id,
              name: nutritionDefinition.name,
              description: nutritionDefinition.description,
              category: nutritionDefinition.category,
              capabilities: nutritionDefinition.capabilities,
            })
          : null,
      listTools: () =>
        Object.freeze([
          Object.freeze({
            id: nutritionDefinition.id,
            name: nutritionDefinition.name,
            description: nutritionDefinition.description,
            category: nutritionDefinition.category,
            capabilities: nutritionDefinition.capabilities,
          }),
        ]),
      execute: async (
        request: ToolCallRequest,
      ): Promise<FoundationToolResult> =>
        new FoundationToolResultBuilder()
          .fromRequest({
            requestId: request.id,
            callId: request.call.id,
            toolId: request.call.toolId,
            completedAt: FIXED_TIMESTAMP,
            durationMs: 1,
          })
          .succeeded(createMockDomainResult("nutrition"))
          .build(),
    };

    const service = createDomainToolService({ adapters: [...adapters] });
    service.registerAdapter(nutritionAdapter);
    service.freeze();

    expect(
      describeDomainTool({ service, toolId: "domain.nutrition.plan" })?.id,
    ).toBe("domain.nutrition.plan");
    expect(listDomainTools({ service }).some((t) => t.id === "domain.nutrition.plan")).toBe(
      true,
    );

    const result = await executeDomainTool({
      service,
      request: createDomainToolRequest({
        toolId: "domain.nutrition.plan",
        parameters: { plan: { calories: 2000 } },
      }),
    });
    expect(result.status).toBe("succeeded");
    expect(result.output?.data).toEqual(
      expect.objectContaining({ tag: "nutrition" }),
    );

    expect(() => service.registerAdapter(nutritionAdapter)).toThrow(/frozen/);
  });
});
