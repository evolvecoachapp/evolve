import type { ToolArgument } from "../../models/ToolArgument";
import type { ToolCapability } from "../../models/ToolCapability";
import type { ToolContext } from "../../models/ToolContext";
import type { AITool } from "../AITool";

/** Placeholder — returns a local coach-summary stub. */
export class GetCoachSummaryTool implements AITool {
  name(): string {
    return "get_coach_summary";
  }

  description(): string {
    return "Load the current coach intelligence summary.";
  }

  capabilities(): readonly ToolCapability[] {
    return Object.freeze(["coach_summary" as const]);
  }

  validateArguments(args: readonly ToolArgument[]): readonly string[] {
    if (args.length > 0) {
      return Object.freeze(["unexpected_arguments"]);
    }
    return Object.freeze([]);
  }

  async execute(
    _args: readonly ToolArgument[],
    context: ToolContext,
  ): Promise<unknown> {
    return Object.freeze({
      kind: "coach_summary",
      placeholder: true,
      capturedAt: context.now,
    });
  }
}
