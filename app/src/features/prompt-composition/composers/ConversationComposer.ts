import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import type { PromptConversation } from "../models/PromptConversation";
import { PromptSections } from "../models/PromptSection";
import { freezeConversation } from "../utils/freezePackage";

export interface ConversationComposition {
  readonly conversation: PromptConversation;
  readonly block: PromptBlock;
}

/**
 * Composes conversation structure from goals/turns/messages.
 * One responsibility: conversation composition only.
 */
export class ConversationComposer {
  compose(conversationContext: ConversationContext): ConversationComposition {
    const conversation = freezeConversation({
      id: `prompt-conversation:${conversationContext.id}`,
      conversationContextId: conversationContext.id,
      goalIds: Object.freeze(conversationContext.goals.map((goal) => goal.id)),
      turnIds: Object.freeze(conversationContext.turns.map((turn) => turn.id)),
      messageIds: Object.freeze(
        conversationContext.messages.map((message) => message.id),
      ),
      requestId: conversationContext.request.id,
      primaryIntent: conversationContext.intent,
      statement: `Conversation composition with ${conversationContext.goals.length} goal(s) and ${conversationContext.turns.length} turn(s).`,
    });

    const block = new PromptBlockBuilder()
      .withId(`prompt-block:conversation:${conversationContext.id}`)
      .withType(PromptBlockTypes.CONVERSATION)
      .withSection(PromptSections.CONVERSATION)
      .withPriority(60)
      .withTitle("Conversation")
      .withStatement(conversation.statement)
      .withRefs(
        Object.freeze([
          conversation.conversationContextId,
          ...(conversation.requestId ? [conversation.requestId] : []),
        ]),
      )
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["conversation"]),
          attributes: Object.freeze({
            goalCount: conversation.goalIds.length,
            turnCount: conversation.turnIds.length,
          }),
        }),
      )
      .build();

    return Object.freeze({ conversation, block });
  }
}

export function createConversationComposer(): ConversationComposer {
  return new ConversationComposer();
}
