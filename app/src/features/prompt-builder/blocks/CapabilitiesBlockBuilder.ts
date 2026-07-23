import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";

/**
 * Builds the capabilities block independently from ConversationContext.
 */
export class CapabilitiesBlockBuilder {
  build(conversationContext: ConversationContext): PromptBlock {
    const ref = conversationContext.id;
    return new PromptBlockBuilder()
      .withId(`prompt-block:capabilities:${ref}`)
      .withType(PromptBlockTypes.CAPABILITIES)
      .withSection(PromptSections.CAPABILITIES)
      .withPriority(70)
      .withTitle("Capabilities")
      .withStatement(
        `Capability scope for intent ${conversationContext.intent ?? "none"}.`,
      )
      .withRefs(Object.freeze([ref]))
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["capabilities"]),
          attributes: Object.freeze({
            intent: conversationContext.intent,
          }),
        }),
      )
      .withAttributes(
        Object.freeze({
          intent: conversationContext.intent,
          goalCount: conversationContext.goals.length,
        }),
      )
      .build();
  }
}

export function createCapabilitiesBlockBuilder(): CapabilitiesBlockBuilder {
  return new CapabilitiesBlockBuilder();
}
