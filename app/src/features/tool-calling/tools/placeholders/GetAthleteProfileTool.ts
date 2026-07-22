import type { ToolArgument } from "../../models/ToolArgument";
import type { ToolCapability } from "../../models/ToolCapability";
import type { ToolContext } from "../../models/ToolContext";
import type { AITool } from "../AITool";

/** Placeholder — returns a local athlete-profile stub. */
export class GetAthleteProfileTool implements AITool {
  name(): string {
    return "get_athlete_profile";
  }

  description(): string {
    return "Load the current athlete profile snapshot.";
  }

  capabilities(): readonly ToolCapability[] {
    return Object.freeze(["athlete_profile" as const]);
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
      kind: "athlete_profile",
      athleteId: context.athleteId ?? null,
      placeholder: true,
      capturedAt: context.now,
    });
  }
}
