import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import type { PromptSafety } from "../models/PromptSafety";
import { PromptSections } from "../models/PromptSection";
import { freezeSafety } from "../utils/freezePackage";

export interface SafetyComposition {
  readonly safety: PromptSafety;
  readonly block: PromptBlock;
}

/**
 * Composes safety markers from conversation constraints / codes.
 * One responsibility: safety composition only.
 */
export class SafetyComposer {
  compose(conversationContext: ConversationContext): SafetyComposition {
    const constraintIds = Object.freeze(
      conversationContext.constraints.map((item) => item.id),
    );
    const codes = Object.freeze([
      "safety_composition",
      ...conversationContext.constraints.map((item) => item.code),
    ]);

    const safety = freezeSafety({
      id: `prompt-safety:${conversationContext.id}`,
      codes,
      constraintIds,
      statement: `Safety composition with ${constraintIds.length} linked constraint(s).`,
    });

    const block = new PromptBlockBuilder()
      .withId(`prompt-block:safety:${conversationContext.id}`)
      .withType(PromptBlockTypes.SAFETY)
      .withSection(PromptSections.SAFETY)
      .withPriority(88)
      .withTitle("Safety")
      .withStatement(safety.statement)
      .withRefs(safety.constraintIds)
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["safety"]),
          attributes: Object.freeze({
            codeCount: safety.codes.length,
          }),
        }),
      )
      .build();

    return Object.freeze({ safety, block });
  }
}

export function createSafetyComposer(): SafetyComposer {
  return new SafetyComposer();
}
