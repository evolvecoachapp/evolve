import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";

/**
 * Builds the formatting block independently from ConversationContext.
 */
export class FormattingBlockBuilder {
  build(conversationContext: ConversationContext): PromptBlock {
    const ref = conversationContext.id;
    return new PromptBlockBuilder()
      .withId(`prompt-block:formatting:${ref}`)
      .withType(PromptBlockTypes.FORMATTING)
      .withSection(PromptSections.FORMATTING)
      .withPriority(55)
      .withTitle("Formatting")
      .withStatement(
        `Formatting rules for structured coach response composition (${conversationContext.audience}).`,
      )
      .withRefs(Object.freeze([ref]))
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["formatting"]),
          attributes: Object.freeze({
            audience: conversationContext.audience,
          }),
        }),
      )
      .withAttributes(Object.freeze({ style: "structured_facts" }))
      .build();
  }
}

export function createFormattingBlockBuilder(): FormattingBlockBuilder {
  return new FormattingBlockBuilder();
}
