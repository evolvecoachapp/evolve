import type { ConversationAudience } from "../models/ConversationAudience";
import { ConversationAudiences } from "../models/ConversationAudience";
import type { ConversationIntent } from "../models/ConversationIntent";
import type { ConversationMetadata } from "../models/ConversationMetadata";
import type { ConversationRequest } from "../models/ConversationRequest";
import { freezeRequest } from "../utils/freezeContext";

/**
 * Fluent builder for immutable ConversationRequest.
 * Structured handoff for Future Prompt Builder — not a prompt string.
 */
export class ConversationRequestBuilder {
  private id = "";
  private contextId = "";
  private audience: ConversationAudience = ConversationAudiences.ATHLETE;
  private primaryIntent: ConversationIntent | null = null;
  private goalIds: readonly string[] = [];
  private constraintIds: readonly string[] = [];
  private evidenceIds: readonly string[] = [];
  private knowledgeRefs: readonly string[] = [];
  private statement = "";
  private metadata: ConversationMetadata = Object.freeze({
    tags: Object.freeze([] as string[]),
    attributes: Object.freeze({}),
  });

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withContextId(contextId: string): this {
    this.contextId = contextId;
    return this;
  }

  withAudience(audience: ConversationAudience): this {
    this.audience = audience;
    return this;
  }

  withPrimaryIntent(intent: ConversationIntent | null): this {
    this.primaryIntent = intent;
    return this;
  }

  withGoalIds(ids: readonly string[]): this {
    this.goalIds = ids;
    return this;
  }

  withConstraintIds(ids: readonly string[]): this {
    this.constraintIds = ids;
    return this;
  }

  withEvidenceIds(ids: readonly string[]): this {
    this.evidenceIds = ids;
    return this;
  }

  withKnowledgeRefs(refs: readonly string[]): this {
    this.knowledgeRefs = refs;
    return this;
  }

  withStatement(statement: string): this {
    this.statement = statement;
    return this;
  }

  withMetadata(metadata: ConversationMetadata): this {
    this.metadata = metadata;
    return this;
  }

  build(): ConversationRequest {
    if (!this.id || !this.contextId || !this.statement) {
      throw new Error("ConversationRequestBuilder missing required fields");
    }

    return freezeRequest({
      id: this.id,
      contextId: this.contextId,
      audience: this.audience,
      primaryIntent: this.primaryIntent,
      goalIds: Object.freeze([...this.goalIds]),
      constraintIds: Object.freeze([...this.constraintIds]),
      evidenceIds: Object.freeze([...this.evidenceIds]),
      knowledgeRefs: Object.freeze([...this.knowledgeRefs]),
      statement: this.statement,
      metadata: this.metadata,
    });
  }
}
