import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";

/**
 * Builds the constraint block independently from ConversationContext.
 */
export class ConstraintBlockBuilder {
  build(conversationContext: ConversationContext): PromptBlock {
    const ref = conversationContext.id;
    const constraints = conversationContext.constraints;
    return new PromptBlockBuilder()
      .withId(`prompt-block:constraint:${ref}`)
      .withType(PromptBlockTypes.CONSTRAINT)
      .withSection(PromptSections.CONSTRAINT)
      .withPriority(88)
      .withTitle("Constraints")
      .withStatement(
        `Constraint set size ${constraints.length} for conversation ${ref}.`,
      )
      .withRefs(
        Object.freeze([
          ref,
          ...constraints.map((c) => c.id).slice(0, 8),
        ]),
      )
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["constraint"]),
          attributes: Object.freeze({
            constraintCount: constraints.length,
          }),
        }),
      )
      .withAttributes(
        Object.freeze({
          constraintCount: constraints.length,
        }),
      )
      .build();
  }
}

export function createConstraintBlockBuilder(): ConstraintBlockBuilder {
  return new ConstraintBlockBuilder();
}
