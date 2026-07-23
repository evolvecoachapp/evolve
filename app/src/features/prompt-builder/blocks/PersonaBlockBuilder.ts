import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";

/**
 * Builds the persona block independently from ConversationContext.
 */
export class PersonaBlockBuilder {
  build(conversationContext: ConversationContext): PromptBlock {
    const ref = conversationContext.id;
    return new PromptBlockBuilder()
      .withId(`prompt-block:persona:${ref}`)
      .withType(PromptBlockTypes.PERSONA)
      .withSection(PromptSections.PERSONA)
      .withPriority(85)
      .withTitle("Persona")
      .withStatement(
        `Coach persona for audience ${conversationContext.audience}.`,
      )
      .withRefs(Object.freeze([ref]))
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["persona"]),
          attributes: Object.freeze({
            audience: conversationContext.audience,
          }),
        }),
      )
      .withAttributes(
        Object.freeze({
          audience: conversationContext.audience,
        }),
      )
      .build();
  }
}

export function createPersonaBlockBuilder(): PersonaBlockBuilder {
  return new PersonaBlockBuilder();
}
