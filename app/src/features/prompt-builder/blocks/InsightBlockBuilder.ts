import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";

/**
 * Builds the insight block independently from ConversationContext.
 */
export class InsightBlockBuilder {
  build(conversationContext: ConversationContext): PromptBlock {
    const ref = conversationContext.id;
    const insightIds = conversationContext.knowledge.insightIds;
    const snapshotId = conversationContext.session.insightSnapshotId;
    return new PromptBlockBuilder()
      .withId(`prompt-block:insight:${ref}`)
      .withType(PromptBlockTypes.INSIGHT)
      .withSection(PromptSections.INSIGHT)
      .withPriority(74)
      .withTitle("Insight")
      .withStatement(
        `Insight refs: ${insightIds.length} linked from snapshot ${snapshotId ?? "none"}.`,
      )
      .withRefs(
        Object.freeze(
          [ref, snapshotId, ...insightIds.slice(0, 5)].filter(
            (v): v is string => typeof v === "string" && v.length > 0,
          ),
        ),
      )
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["insight"]),
          attributes: Object.freeze({
            insightCount: insightIds.length,
            insightSnapshotId: snapshotId,
          }),
        }),
      )
      .withAttributes(
        Object.freeze({
          insightCount: insightIds.length,
        }),
      )
      .build();
  }
}

export function createInsightBlockBuilder(): InsightBlockBuilder {
  return new InsightBlockBuilder();
}
