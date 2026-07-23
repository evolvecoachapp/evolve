import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";

/**
 * Builds the recovery block independently from ConversationContext.
 */
export class RecoveryBlockBuilder {
  build(conversationContext: ConversationContext): PromptBlock {
    const ref = conversationContext.id;
    const recoveryId = conversationContext.session.recoverySnapshotId;
    const referenced = conversationContext.knowledge.recoveryReferenced;
    return new PromptBlockBuilder()
      .withId(`prompt-block:recovery:${ref}`)
      .withType(PromptBlockTypes.RECOVERY)
      .withSection(PromptSections.RECOVERY)
      .withPriority(72)
      .withTitle("Recovery")
      .withStatement(
        `Recovery ${referenced ? "referenced" : "not referenced"} via ${recoveryId ?? "none"}.`,
      )
      .withRefs(
        Object.freeze(
          [ref, recoveryId].filter(
            (v): v is string => typeof v === "string" && v.length > 0,
          ),
        ),
      )
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["recovery"]),
          attributes: Object.freeze({
            recoveryReferenced: referenced,
            recoverySnapshotId: recoveryId,
          }),
        }),
      )
      .withAttributes(
        Object.freeze({
          recoveryReferenced: referenced,
        }),
      )
      .build();
  }
}

export function createRecoveryBlockBuilder(): RecoveryBlockBuilder {
  return new RecoveryBlockBuilder();
}
