import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import type { PromptInstruction } from "../models/PromptInstruction";
import { PromptSections } from "../models/PromptSection";
import { freezeInstruction } from "../utils/freezePackage";

export interface SystemComposition {
  readonly block: PromptBlock;
  readonly instructions: readonly PromptInstruction[];
}

/**
 * Composes the system block from conversation orchestration facts.
 * One responsibility: system composition only.
 */
export class SystemComposer {
  compose(conversationContext: ConversationContext): SystemComposition {
    const packageRef = conversationContext.id;
    const instruction = freezeInstruction({
      id: `prompt-instruction:system:${packageRef}`,
      code: "compose_system",
      statement: `System composition for conversation context ${packageRef}.`,
      priority: 90,
      sourceRefs: Object.freeze([packageRef]),
      metadata: Object.freeze({
        tags: Object.freeze(["system", "composition"]),
        attributes: Object.freeze({
          stage: conversationContext.stage,
          state: conversationContext.state,
        }),
      }),
    });

    const block = new PromptBlockBuilder()
      .withId(`prompt-block:system:${packageRef}`)
      .withType(PromptBlockTypes.SYSTEM)
      .withSection(PromptSections.SYSTEM)
      .withPriority(90)
      .withTitle("System")
      .withStatement(
        `Structured system block for conversation ${packageRef} at stage ${conversationContext.stage}.`,
      )
      .withRefs(Object.freeze([packageRef, conversationContext.request.id]))
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["system"]),
          attributes: Object.freeze({
            audience: conversationContext.audience,
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

    return Object.freeze({
      block,
      instructions: Object.freeze([instruction]),
    });
  }
}

export function createSystemComposer(): SystemComposer {
  return new SystemComposer();
}
