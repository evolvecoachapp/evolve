import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";

/**
 * Builds the system block independently from ConversationContext.
 */
export class SystemBlockBuilder {
  build(conversationContext: ConversationContext): PromptBlock {
    const ref = conversationContext.id;
    return new PromptBlockBuilder()
      .withId(`prompt-block:system:${ref}`)
      .withType(PromptBlockTypes.SYSTEM)
      .withSection(PromptSections.SYSTEM)
      .withPriority(90)
      .withTitle("System")
      .withStatement(
        `Structured system block for conversation ${ref} at stage ${conversationContext.stage}.`,
      )
      .withRefs(Object.freeze([ref, conversationContext.request.id]))
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["system"]),
          attributes: Object.freeze({
            stage: conversationContext.stage,
            state: conversationContext.state,
          }),
        }),
      )
      .withAttributes(
        Object.freeze({
          stage: conversationContext.stage,
          state: conversationContext.state,
        }),
      )
      .build();
  }
}

export function createSystemBlockBuilder(): SystemBlockBuilder {
  return new SystemBlockBuilder();
}
