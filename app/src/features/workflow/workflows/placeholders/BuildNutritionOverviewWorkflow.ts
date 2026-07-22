import type { ToolResult } from "../../../tool-calling/models/ToolResult";
import type { WorkflowCapability } from "../../models/WorkflowCapability";
import type { WorkflowContext } from "../../models/WorkflowContext";
import type { WorkflowRequest } from "../../models/WorkflowRequest";
import type { WorkflowStep } from "../../models/WorkflowStep";
import type { AIWorkflow } from "../AIWorkflow";

/** Placeholder — planning only; no nutrition generation. */
export class BuildNutritionOverviewWorkflow implements AIWorkflow {
  name(): string {
    return "build_nutrition_overview";
  }

  description(): string {
    return "Plan a nutrition-overview workflow via domain tools.";
  }

  capabilities(): readonly WorkflowCapability[] {
    return Object.freeze(["build_nutrition_overview" as const]);
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
      kind: "build_nutrition_overview",
      placeholder: true,
      stepCount: stepResults.length,
      capturedAt: context.now,
    });
  }
}

function freezeStep(step: WorkflowStep): WorkflowStep {
  return Object.freeze(step);
}
