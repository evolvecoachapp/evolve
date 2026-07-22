import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import type { PromptIdentity } from "../models/PromptIdentity";
import { PromptSections } from "../models/PromptSection";
import { freezeIdentity } from "../utils/freezePackage";

export interface IdentityComposition {
  readonly identity: PromptIdentity;
  readonly block: PromptBlock;
}

/**
 * Composes identity facts from conversation audience / intent.
 * One responsibility: identity composition only.
 */
export class IdentityComposer {
  compose(conversationContext: ConversationContext): IdentityComposition {
    const id = `prompt-identity:${conversationContext.id}`;
    const identity = freezeIdentity({
      id,
      roleCode: "coach_orchestrator",
      audience: conversationContext.audience,
      communicationStyle: null,
      statement: `Identity composition for audience ${conversationContext.audience}.`,
      refs: Object.freeze([
        conversationContext.id,
        conversationContext.session.coachingContextId,
      ]),
    });

    const block = new PromptBlockBuilder()
      .withId(`prompt-block:identity:${conversationContext.id}`)
      .withType(PromptBlockTypes.IDENTITY)
      .withSection(PromptSections.IDENTITY)
      .withPriority(85)
      .withTitle("Identity")
      .withStatement(identity.statement)
      .withRefs(identity.refs)
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["identity"]),
          attributes: Object.freeze({
            roleCode: identity.roleCode,
            audience: identity.audience,
          }),
        }),
      )
      .build();

    return Object.freeze({ identity, block });
  }
}

export function createIdentityComposer(): IdentityComposer {
  return new IdentityComposer();
}
