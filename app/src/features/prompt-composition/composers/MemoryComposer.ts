import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import type { PromptMemory } from "../models/PromptMemory";
import { PromptSections } from "../models/PromptSection";
import { freezeMemory } from "../utils/freezePackage";

export interface MemoryComposition {
  readonly memory: PromptMemory;
  readonly block: PromptBlock;
}

/**
 * Composes memory references (optional / placeholder-capable).
 * One responsibility: memory composition only.
 */
export class MemoryComposer {
  compose(conversationContext: ConversationContext): MemoryComposition {
    const historyId = conversationContext.session.historyId;
    const memoryRefs = Object.freeze(
      [
        historyId,
        conversationContext.knowledge.historyReferenced
          ? `history-ref:${conversationContext.id}`
          : null,
      ].filter((value): value is string => Boolean(value)),
    );

    const memory = freezeMemory({
      id: `prompt-memory:${conversationContext.id}`,
      conversationContextId: conversationContext.id,
      memoryRefs,
      historyReferenced: conversationContext.knowledge.historyReferenced,
      statement:
        memoryRefs.length > 0
          ? `Memory composition with ${memoryRefs.length} memory ref(s).`
          : "Memory composition placeholder with no memory refs.",
    });

    const block = new PromptBlockBuilder()
      .withId(`prompt-block:memory:${conversationContext.id}`)
      .withType(PromptBlockTypes.MEMORY)
      .withSection(PromptSections.MEMORY)
      .withPriority(55)
      .withTitle("Memory")
      .withStatement(memory.statement)
      .withRefs(memory.memoryRefs)
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["memory"]),
          attributes: Object.freeze({
            historyReferenced: memory.historyReferenced,
            refCount: memory.memoryRefs.length,
          }),
        }),
      )
      .build();

    return Object.freeze({ memory, block });
  }
}

export function createMemoryComposer(): MemoryComposer {
  return new MemoryComposer();
}
