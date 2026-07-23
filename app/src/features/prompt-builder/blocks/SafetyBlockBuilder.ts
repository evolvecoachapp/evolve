import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";

/**
 * Builds the safety block independently from ConversationContext.
 */
export class SafetyBlockBuilder {
  build(conversationContext: ConversationContext): PromptBlock {
    const ref = conversationContext.id;
    const constraintIds = conversationContext.constraints.map((c) => c.id);
    return new PromptBlockBuilder()
      .withId(`prompt-block:safety:${ref}`)
      .withType(PromptBlockTypes.SAFETY)
      .withSection(PromptSections.SAFETY)
      .withPriority(92)
      .withTitle("Safety")
      .withStatement(
        `Safety markers for conversation ${ref} with ${constraintIds.length} linked constraints.`,
      )
      .withRefs(Object.freeze([ref, ...constraintIds.slice(0, 5)]))
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["safety"]),
          attributes: Object.freeze({
            constraintCount: constraintIds.length,
          }),
        }),
      )
      .withAttributes(
        Object.freeze({
          codes: "coach_safety",
        }),
      )
      .build();
  }
}

export function createSafetyBlockBuilder(): SafetyBlockBuilder {
  return new SafetyBlockBuilder();
}
