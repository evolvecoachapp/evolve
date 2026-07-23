import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";

/**
 * Builds the tool block independently from ConversationContext.
 * Foundation placeholder — no tool execution.
 */
export class ToolBlockBuilder {
  build(conversationContext: ConversationContext): PromptBlock {
    const ref = conversationContext.id;
    return new PromptBlockBuilder()
      .withId(`prompt-block:tool:${ref}`)
      .withType(PromptBlockTypes.TOOL)
      .withSection(PromptSections.TOOL)
      .withPriority(50)
      .withTitle("Tools")
      .withStatement(
        `Tool definition placeholder for conversation ${ref} (no execution).`,
      )
      .withRefs(Object.freeze([ref]))
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["tool"]),
          attributes: Object.freeze({ enabled: false }),
        }),
      )
      .withAttributes(Object.freeze({ toolCount: 0 }))
      .build();
  }
}

export function createToolBlockBuilder(): ToolBlockBuilder {
  return new ToolBlockBuilder();
}
