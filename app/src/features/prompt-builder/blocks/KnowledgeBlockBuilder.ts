import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";

/**
 * Builds the knowledge block independently from ConversationContext.
 */
export class KnowledgeBlockBuilder {
  build(conversationContext: ConversationContext): PromptBlock {
    const ref = conversationContext.id;
    const knowledge = conversationContext.knowledge;
    return new PromptBlockBuilder()
      .withId(`prompt-block:knowledge:${ref}`)
      .withType(PromptBlockTypes.KNOWLEDGE)
      .withSection(PromptSections.KNOWLEDGE)
      .withPriority(75)
      .withTitle("Knowledge")
      .withStatement(
        `Knowledge refs: ${knowledge.insightIds.length} insights, ${knowledge.objectiveIds.length} objectives.`,
      )
      .withRefs(
        Object.freeze([
          ref,
          knowledge.coachingContextId,
          ...knowledge.insightIds.slice(0, 5),
        ]),
      )
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["knowledge"]),
          attributes: Object.freeze({
            insightCount: knowledge.insightIds.length,
            objectiveCount: knowledge.objectiveCount,
          }),
        }),
      )
      .withAttributes(
        Object.freeze({
          recoveryReferenced: knowledge.recoveryReferenced,
          historyReferenced: knowledge.historyReferenced,
          performanceReferenced: knowledge.performanceReferenced,
          achievementReferenced: knowledge.achievementReferenced,
        }),
      )
      .build();
  }
}

export function createKnowledgeBlockBuilder(): KnowledgeBlockBuilder {
  return new KnowledgeBlockBuilder();
}
