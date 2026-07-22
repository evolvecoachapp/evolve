import type { ToolResult } from "../../../tool-calling/models/ToolResult";
import type { WorkflowCapability } from "../../models/WorkflowCapability";
import type { WorkflowContext } from "../../models/WorkflowContext";
import type { WorkflowRequest } from "../../models/WorkflowRequest";
import type { WorkflowStep } from "../../models/WorkflowStep";
import type { AIWorkflow } from "../AIWorkflow";

/** Placeholder — planning only; no deload planning. */
export class PlanDeloadWorkflow implements AIWorkflow {
  name(): string {
    return "plan_deload";
  }

  description(): string {
    return "Plan a deload workflow via domain tools.";
  }

  capabilities(): readonly WorkflowCapability[] {
    return Object.freeze(["plan_deload" as const]);
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
        id: "step-workout-history",
        name: "load_workout_history",
        toolName: "get_workout_history",
        arguments: Object.freeze([
          Object.freeze({ name: "limit", value: 10 }),
        ]),
        order: 0,
        conditional: false,
        earlyExitOnSuccess: false,
        maxRetries: 0,
      }),
      freezeStep({
        id: "step-coach-summary",
        name: "load_coach_summary",
        toolName: "get_coach_summary",
        arguments: Object.freeze([]),
        order: 1,
        conditional: false,
        earlyExitOnSuccess: true,
        maxRetries: 0,
      }),
      freezeStep({
        id: "step-memory-context",
        name: "load_memory_context",
        toolName: "get_memory_context",
        arguments: Object.freeze([]),
        order: 2,
        conditional: false,
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
      kind: "plan_deload",
      placeholder: true,
      stepCount: stepResults.length,
      capturedAt: context.now,
    });
  }
}

function freezeStep(step: WorkflowStep): WorkflowStep {
  return Object.freeze(step);
}
