import type { ToolResult } from "../../../tool-calling/models/ToolResult";
import type { WorkflowCapability } from "../../models/WorkflowCapability";
import type { WorkflowContext } from "../../models/WorkflowContext";
import type { WorkflowRequest } from "../../models/WorkflowRequest";
import type { WorkflowStep } from "../../models/WorkflowStep";
import type { AIWorkflow } from "../AIWorkflow";

/** Placeholder — planning only; no workout generation. */
export class GenerateWorkoutWorkflow implements AIWorkflow {
  name(): string {
    return "generate_workout";
  }

  description(): string {
    return "Plan a workout-generation workflow via domain tools.";
  }

  capabilities(): readonly WorkflowCapability[] {
    return Object.freeze(["generate_workout" as const]);
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
        id: "step-workout-history",
        name: "load_workout_history",
        toolName: "get_workout_history",
        arguments: Object.freeze([
          Object.freeze({ name: "limit", value: 5 }),
        ]),
        order: 1,
        conditional: false,
        earlyExitOnSuccess: false,
        maxRetries: 1,
      }),
    ]);
  }

  async execute(
    _request: WorkflowRequest,
    context: WorkflowContext,
    stepResults: readonly ToolResult[],
  ): Promise<unknown> {
    return Object.freeze({
      kind: "generate_workout",
      placeholder: true,
      stepCount: stepResults.length,
      capturedAt: context.now,
    });
  }
}

function freezeStep(step: WorkflowStep): WorkflowStep {
  return Object.freeze(step);
}
