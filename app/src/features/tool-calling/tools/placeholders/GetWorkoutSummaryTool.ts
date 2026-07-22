import type { ToolArgument } from "../../models/ToolArgument";
import type { ToolCapability } from "../../models/ToolCapability";
import type { ToolContext } from "../../models/ToolContext";
import type { AITool } from "../AITool";

/** Placeholder — returns a local workout-summary stub. */
export class GetWorkoutSummaryTool implements AITool {
  name(): string {
    return "get_workout_summary";
  }

  description(): string {
    return "Load the latest workout summary.";
  }

  capabilities(): readonly ToolCapability[] {
    return Object.freeze(["workout_summary" as const]);
  }

  validateArguments(args: readonly ToolArgument[]): readonly string[] {
    if (args.length > 1) {
      return Object.freeze(["unexpected_arguments"]);
    }
    if (args.length === 1 && args[0]?.name !== "workoutId") {
      return Object.freeze(["invalid_argument_name"]);
    }
    return Object.freeze([]);
  }

  async execute(
    args: readonly ToolArgument[],
    context: ToolContext,
  ): Promise<unknown> {
    const workoutId = args.find((arg) => arg.name === "workoutId")?.value;
    return Object.freeze({
      kind: "workout_summary",
      workoutId: typeof workoutId === "string" ? workoutId : null,
      placeholder: true,
      capturedAt: context.now,
    });
  }
}
