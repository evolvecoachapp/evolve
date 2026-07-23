import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";

/**
 * Builds the conversation block independently from ConversationContext.
 */
export class ConversationBlockBuilder {
  build(conversationContext: ConversationContext): PromptBlock {
    const ref = conversationContext.id;
    return new PromptBlockBuilder()
      .withId(`prompt-block:conversation:${ref}`)
      .withType(PromptBlockTypes.CONVERSATION)
      .withSection(PromptSections.CONVERSATION)
      .withPriority(80)
      .withTitle("Conversation")
      .withStatement(
        `Conversation structure: ${conversationContext.turns.length} turns, ${conversationContext.messages.length} messages, ${conversationContext.goals.length} goals.`,
      )
      .withRefs(
        Object.freeze([
          ref,
          conversationContext.request.id,
          ...conversationContext.goals.map((g) => g.id).slice(0, 5),
        ]),
      )
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["conversation"]),
          attributes: Object.freeze({
            turnCount: conversationContext.turns.length,
            messageCount: conversationContext.messages.length,
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

export function createConversationBlockBuilder(): ConversationBlockBuilder {
  return new ConversationBlockBuilder();
}
