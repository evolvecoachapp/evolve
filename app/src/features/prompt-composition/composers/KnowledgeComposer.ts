import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import type { PromptKnowledge } from "../models/PromptKnowledge";
import { PromptSections } from "../models/PromptSection";
import { freezeKnowledge } from "../utils/freezePackage";

export interface KnowledgeComposition {
  readonly knowledge: PromptKnowledge;
  readonly block: PromptBlock;
}

/**
 * Composes knowledge references from ConversationContext (+ optional InsightSnapshot).
 * One responsibility: knowledge composition only.
 */
export class KnowledgeComposer {
  compose(
    conversationContext: ConversationContext,
    insightSnapshot?: InsightSnapshot,
  ): KnowledgeComposition {
    const knowledgeSource = conversationContext.knowledge;
    const insightIds = Object.freeze([
      ...knowledgeSource.insightIds,
      ...(insightSnapshot ? [insightSnapshot.id] : []),
    ]);

    const knowledge = freezeKnowledge({
      id: `prompt-knowledge:${conversationContext.id}`,
      coachingContextId: knowledgeSource.coachingContextId,
      conversationContextId: conversationContext.id,
      objectiveIds: Object.freeze([...knowledgeSource.selectedObjectiveIds]),
      insightIds,
      evidenceIds: Object.freeze(
        conversationContext.evidence.map((item) => item.id),
      ),
      knowledgeRefs: Object.freeze([
        ...conversationContext.request.knowledgeRefs,
      ]),
      recoveryReferenced: knowledgeSource.recoveryReferenced,
      historyReferenced: knowledgeSource.historyReferenced,
      performanceReferenced: knowledgeSource.performanceReferenced,
      achievementReferenced: knowledgeSource.achievementReferenced,
      statement: `Knowledge composition with ${knowledgeSource.selectedObjectiveIds.length} selected objective(s).`,
    });

    const block = new PromptBlockBuilder()
      .withId(`prompt-block:knowledge:${conversationContext.id}`)
      .withType(PromptBlockTypes.KNOWLEDGE)
      .withSection(PromptSections.KNOWLEDGE)
      .withPriority(70)
      .withTitle("Knowledge")
      .withStatement(knowledge.statement)
      .withRefs(
        Object.freeze([
          knowledge.coachingContextId ?? conversationContext.id,
          ...knowledge.knowledgeRefs.slice(0, 5),
        ]),
      )
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["knowledge"]),
          attributes: Object.freeze({
            objectiveCount: knowledge.objectiveIds.length,
            evidenceCount: knowledge.evidenceIds.length,
          }),
        }),
      )
      .build();

    return Object.freeze({ knowledge, block });
  }
}

export function createKnowledgeComposer(): KnowledgeComposer {
  return new KnowledgeComposer();
}
