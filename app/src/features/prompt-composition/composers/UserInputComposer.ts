import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import type { PromptUserInput } from "../models/PromptUserInput";
import { PromptSections } from "../models/PromptSection";
import { freezeUserInput } from "../utils/freezePackage";

export interface UserInputComposition {
  readonly userInput: PromptUserInput;
  readonly block: PromptBlock;
}

/**
 * Composes the structured user-input slot from ConversationRequest / goals.
 * One responsibility: user-input composition only.
 */
export class UserInputComposer {
  compose(conversationContext: ConversationContext): UserInputComposition {
    const userInput = freezeUserInput({
      id: `prompt-user-input:${conversationContext.id}`,
      conversationContextId: conversationContext.id,
      requestId: conversationContext.request.id,
      goalIds: Object.freeze(
        conversationContext.request.goalIds.length > 0
          ? [...conversationContext.request.goalIds]
          : conversationContext.goals.map((goal) => goal.id),
      ),
      primaryIntent:
        conversationContext.request.primaryIntent ?? conversationContext.intent,
      statement: `User input composition for request ${conversationContext.request.id}.`,
    });

    const block = new PromptBlockBuilder()
      .withId(`prompt-block:user-input:${conversationContext.id}`)
      .withType(PromptBlockTypes.USER_INPUT)
      .withSection(PromptSections.USER_INPUT)
      .withPriority(50)
      .withTitle("User Input")
      .withStatement(userInput.statement)
      .withRefs(
        Object.freeze([
          userInput.conversationContextId,
          ...(userInput.requestId ? [userInput.requestId] : []),
        ]),
      )
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["user_input"]),
          attributes: Object.freeze({
            goalCount: userInput.goalIds.length,
            primaryIntent: userInput.primaryIntent,
          }),
        }),
      )
      .build();

    return Object.freeze({ userInput, block });
  }
}

export function createUserInputComposer(): UserInputComposer {
  return new UserInputComposer();
}
