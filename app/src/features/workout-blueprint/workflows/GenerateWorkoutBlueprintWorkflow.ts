import type { ToolResult } from "../../tool-calling/models/ToolResult";
import type { WorkflowCapability } from "../../workflow/models/WorkflowCapability";
import type { WorkflowContext } from "../../workflow/models/WorkflowContext";
import type { WorkflowRequest } from "../../workflow/models/WorkflowRequest";
import type { WorkflowStep } from "../../workflow/models/WorkflowStep";
import type { AIWorkflow } from "../../workflow/workflows/AIWorkflow";
import { WorkoutBlueprintBuilder } from "../builder/WorkoutBlueprintBuilder";
import type { WorkoutBlueprint } from "../models/WorkoutBlueprint";
import type { WorkoutBlueprintAIOutput } from "../models/WorkoutBlueprintAIOutput";

/**
 * Workflow that produces a strategic WorkoutBlueprint.
 *
 * Loads athlete, memory, history, and coach context via tools.
 * Builds the blueprint from AI strategic decisions (request argument
 * `ai_blueprint`) — never selects exercises or talks to repositories.
 */
export class GenerateWorkoutBlueprintWorkflow implements AIWorkflow {
  constructor(
    private readonly builder: WorkoutBlueprintBuilder = new WorkoutBlueprintBuilder(),
  ) {}

  name(): string {
    return "generate_workout_blueprint";
  }

  description(): string {
    return "Plan a workout-blueprint generation workflow via domain tools.";
  }

  capabilities(): readonly WorkflowCapability[] {
    return Object.freeze(["generate_workout_blueprint" as const]);
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
        order: 2,
        conditional: false,
        earlyExitOnSuccess: false,
        maxRetries: 1,
      }),
      freezeStep({
        id: "step-coach-summary",
        name: "load_coach_summary",
        toolName: "get_coach_summary",
        arguments: Object.freeze([]),
        order: 3,
        conditional: false,
        earlyExitOnSuccess: false,
        maxRetries: 0,
      }),
    ]);
  }

  async execute(
    request: WorkflowRequest,
    context: WorkflowContext,
    stepResults: readonly ToolResult[],
  ): Promise<WorkoutBlueprint> {
    const aiOutput = extractAIBlueprint(request) ?? deriveStrategicBlueprint(
      context,
      stepResults,
    );

    return this.builder.build(aiOutput, {
      athleteId: context.athleteId,
      createdAt: context.now,
      source: extractAIBlueprint(request) ? "ai" : "derived",
    });
  }
}

function extractAIBlueprint(
  request: WorkflowRequest,
): WorkoutBlueprintAIOutput | null {
  const argument = request.arguments.find(
    (entry) => entry.name === "ai_blueprint",
  );
  if (!argument || argument.value === null || argument.value === undefined) {
    return null;
  }
  if (typeof argument.value !== "object") {
    return null;
  }
  return argument.value as WorkoutBlueprintAIOutput;
}

/**
 * Foundation fallback when AI strategic payload is absent.
 * Uses workflow context only — no exercise selection.
 */
function deriveStrategicBlueprint(
  context: WorkflowContext,
  stepResults: readonly ToolResult[],
): WorkoutBlueprintAIOutput {
  return Object.freeze({
    id: `blueprint-${context.athleteId}`,
    split: Object.freeze({
      type: "upper_lower",
      daysPerWeek: 4,
      cycleLengthDays: 7,
    }),
    priority: Object.freeze({
      primary: "hypertrophy",
      secondary: "strength",
    }),
    focus: Object.freeze({
      primary: "full_body",
      secondary: null,
    }),
    constraints: Object.freeze([]),
    blocks: Object.freeze([
      Object.freeze({
        id: "block-1",
        name: "primary",
        order: 0,
        weekCount: 4,
        priority: Object.freeze({
          primary: "hypertrophy",
          secondary: "strength",
        }),
        focus: Object.freeze({
          primary: "full_body",
          secondary: null,
        }),
      }),
    ]),
    weeklyFrequency: 4,
    metadata: Object.freeze({
      version: "1.0.0",
      source: "derived",
      athleteId: context.athleteId,
      createdAt: context.now,
      tags: Object.freeze([
        "workout_blueprint",
        `steps:${stepResults.length}`,
      ]),
    }),
  });
}

function freezeStep(step: WorkflowStep): WorkflowStep {
  return Object.freeze(step);
}
