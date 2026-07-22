import type { ToolResult } from "../../../tool-calling/models/ToolResult";
import type { WorkflowCapability } from "../../models/WorkflowCapability";
import type { WorkflowContext } from "../../models/WorkflowContext";
import type { WorkflowRequest } from "../../models/WorkflowRequest";
import type { WorkflowStep } from "../../models/WorkflowStep";
import type { AIWorkflow } from "../AIWorkflow";

/** Placeholder — planning only; no progress analysis. */
export class AnalyzeProgressWorkflow implements AIWorkflow {
  name(): string {
    return "analyze_progress";
  }

  description(): string {
    return "Plan a progress-analysis workflow via domain tools.";
  }

  capabilities(): readonly WorkflowCapability[] {
    return Object.freeze(["analyze_progress" as const]);
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
        id: "step-workout-summary",
        name: "load_workout_summary",
        toolName: "get_workout_summary",
        arguments: Object.freeze([]),
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
      kind: "analyze_progress",
      placeholder: true,
      stepCount: stepResults.length,
      capturedAt: context.now,
    });
  }
}

function freezeStep(step: WorkflowStep): WorkflowStep {
  return Object.freeze(step);
}
