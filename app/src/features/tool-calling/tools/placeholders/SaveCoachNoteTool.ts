import type { ToolArgument } from "../../models/ToolArgument";
import type { ToolCapability } from "../../models/ToolCapability";
import type { ToolContext } from "../../models/ToolContext";
import type { AITool } from "../AITool";

/** Placeholder — acknowledges a coach note locally (no persistence). */
export class SaveCoachNoteTool implements AITool {
  name(): string {
    return "save_coach_note";
  }

  description(): string {
    return "Save a coach note for the current conversation.";
  }

  capabilities(): readonly ToolCapability[] {
    return Object.freeze(["coach_note" as const]);
  }

  validateArguments(args: readonly ToolArgument[]): readonly string[] {
    const note = args.find((arg) => arg.name === "note");
    if (!note) {
      return Object.freeze(["missing_note"]);
    }
    if (typeof note.value !== "string" || note.value.trim().length === 0) {
      return Object.freeze(["invalid_note"]);
    }
    if (args.some((arg) => arg.name !== "note")) {
      return Object.freeze(["unexpected_arguments"]);
    }
    return Object.freeze([]);
  }

  async execute(
    args: readonly ToolArgument[],
    context: ToolContext,
  ): Promise<unknown> {
    const note = args.find((arg) => arg.name === "note")?.value;
    return Object.freeze({
      kind: "coach_note",
      saved: true,
      note: typeof note === "string" ? note.trim() : "",
      conversationId: context.conversationId ?? null,
      placeholder: true,
      capturedAt: context.now,
    });
  }
}
