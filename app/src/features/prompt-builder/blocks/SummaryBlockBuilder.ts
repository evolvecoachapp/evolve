import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";

/**
 * Builds the summary block independently from ConversationContext.
 */
export class SummaryBlockBuilder {
  build(conversationContext: ConversationContext): PromptBlock {
    const ref = conversationContext.id;
    const summary = conversationContext.summary;
    return new PromptBlockBuilder()
      .withId(`prompt-block:summary:${ref}`)
      .withType(PromptBlockTypes.SUMMARY)
      .withSection(PromptSections.SUMMARY)
      .withPriority(60)
      .withTitle("Summary")
      .withStatement(
        `Conversation summary composition for ${ref}: intent ${summary.primaryIntent ?? "none"}.`,
      )
      .withRefs(Object.freeze([ref]))
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["summary"]),
          attributes: Object.freeze({
            primaryIntent: summary.primaryIntent,
          }),
        }),
      )
      .withAttributes(
        Object.freeze({
          goalCount: conversationContext.goals.length,
          evidenceCount: conversationContext.evidence.length,
        }),
      )
      .build();
  }
}

export function createSummaryBlockBuilder(): SummaryBlockBuilder {
  return new SummaryBlockBuilder();
}
