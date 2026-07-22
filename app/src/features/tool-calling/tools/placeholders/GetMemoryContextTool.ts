import type { ToolArgument } from "../../models/ToolArgument";
import type { ToolCapability } from "../../models/ToolCapability";
import type { ToolContext } from "../../models/ToolContext";
import type { AITool } from "../AITool";

/** Placeholder — returns a local memory-context stub. */
export class GetMemoryContextTool implements AITool {
  name(): string {
    return "get_memory_context";
  }

  description(): string {
    return "Load relevant long-term memory context.";
  }

  capabilities(): readonly ToolCapability[] {
    return Object.freeze(["memory_context" as const]);
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
      kind: "memory_context",
      entries: Object.freeze([]),
      placeholder: true,
      capturedAt: context.now,
    });
  }
}
