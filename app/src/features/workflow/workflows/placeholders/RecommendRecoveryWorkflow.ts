import type { ToolResult } from "../../../tool-calling/models/ToolResult";
import type { WorkflowCapability } from "../../models/WorkflowCapability";
import type { WorkflowContext } from "../../models/WorkflowContext";
import type { WorkflowRequest } from "../../models/WorkflowRequest";
import type { WorkflowStep } from "../../models/WorkflowStep";
import type { AIWorkflow } from "../AIWorkflow";

/** Placeholder — planning only; no recovery recommendations. */
export class RecommendRecoveryWorkflow implements AIWorkflow {
  name(): string {
    return "recommend_recovery";
  }

  description(): string {
    return "Plan a recovery-recommendation workflow via domain tools.";
  }

  capabilities(): readonly WorkflowCapability[] {
    return Object.freeze(["recommend_recovery" as const]);
  }

  validate(request: WorkflowRequest): readonly string[] {
    if (!Array.isArray(request.arguments)) {
      return Object.freeze(["invalid_arguments"]);
    }
    return Object.freeze([]);
  }

  plan(
    _request: WorkflowRequest,
    _context: WorkflowContext,
  ): readonly WorkflowStep[] {
    return Object.freeze([
      freezeStep({
        id: "step-athlete-profile",
        name: "load_athlete_profile",
        toolName: "get_athlete_profile",
        arguments: Object.freeze([]),
        order: 0,
        conditional: false,
        earlyExitOnSuccess: false,
        maxRetries: 0,
      }),
      freezeStep({
        id: "step-memory-context",
        name: "load_memory_context",
        toolName: "get_memory_context",
        arguments: Object.freeze([]),
        order: 1,
        conditional: true,
        conditionKey: "includeMemory",
        earlyExitOnSuccess: false,
        maxRetries: 0,
      }),
    ]);
  }

  async execute(
    _request: WorkflowRequest,
    context: WorkflowContext,
    stepResults: readonly ToolResult[],
  ): Promise<unknown> {
    return Object.freeze({
      kind: "recommend_recovery",
      placeholder: true,
      stepCount: stepResults.length,
      capturedAt: context.now,
    });
  }
}

function freezeStep(step: WorkflowStep): WorkflowStep {
  return Object.freeze(step);
}
