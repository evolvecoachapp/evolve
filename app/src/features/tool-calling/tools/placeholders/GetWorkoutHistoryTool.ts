import type { ToolArgument } from "../../models/ToolArgument";
import type { ToolCapability } from "../../models/ToolCapability";
import type { ToolContext } from "../../models/ToolContext";
import type { AITool } from "../AITool";

/** Placeholder — returns a local workout-history stub. */
export class GetWorkoutHistoryTool implements AITool {
  name(): string {
    return "get_workout_history";
  }

  description(): string {
    return "Load recent workout history entries.";
  }

  capabilities(): readonly ToolCapability[] {
    return Object.freeze(["workout_history" as const]);
  }

  validateArguments(args: readonly ToolArgument[]): readonly string[] {
    for (const arg of args) {
      if (arg.name !== "limit") {
        return Object.freeze(["invalid_argument_name"]);
      }
      if (
        typeof arg.value !== "number" ||
        !Number.isFinite(arg.value) ||
        arg.value < 0
      ) {
        return Object.freeze(["invalid_argument_value"]);
      }
    }
    return Object.freeze([]);
  }

  async execute(
    args: readonly ToolArgument[],
    context: ToolContext,
  ): Promise<unknown> {
    const limitArg = args.find((arg) => arg.name === "limit")?.value;
    const limit = typeof limitArg === "number" ? limitArg : 5;
    return Object.freeze({
      kind: "workout_history",
      limit,
      entries: Object.freeze([]),
      placeholder: true,
      capturedAt: context.now,
    });
  }
}
