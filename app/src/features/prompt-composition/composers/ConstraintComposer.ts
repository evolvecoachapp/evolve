import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import type { PromptConstraints } from "../models/PromptConstraints";
import { PromptSections } from "../models/PromptSection";
import { freezeConstraints } from "../utils/freezePackage";

export interface ConstraintComposition {
  readonly constraints: PromptConstraints;
  readonly block: PromptBlock;
}

/**
 * Composes constraint facts from ConversationContext.
 * One responsibility: constraint composition only.
 */
export class ConstraintComposer {
  compose(conversationContext: ConversationContext): ConstraintComposition {
    const constraints = freezeConstraints({
      id: `prompt-constraints:${conversationContext.id}`,
      constraintIds: Object.freeze(
        conversationContext.constraints.map((item) => item.id),
      ),
      codes: Object.freeze(
        conversationContext.constraints.map((item) => item.code),
      ),
      statement: `Constraint composition with ${conversationContext.constraints.length} constraint(s).`,
    });

    const block = new PromptBlockBuilder()
      .withId(`prompt-block:constraints:${conversationContext.id}`)
      .withType(PromptBlockTypes.CONSTRAINTS)
      .withSection(PromptSections.CONSTRAINTS)
      .withPriority(80)
      .withTitle("Constraints")
      .withStatement(constraints.statement)
      .withRefs(constraints.constraintIds)
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["constraints"]),
          attributes: Object.freeze({
            constraintCount: constraints.constraintIds.length,
          }),
        }),
      )
      .build();

    return Object.freeze({ constraints, block });
  }
}

export function createConstraintComposer(): ConstraintComposer {
  return new ConstraintComposer();
}
