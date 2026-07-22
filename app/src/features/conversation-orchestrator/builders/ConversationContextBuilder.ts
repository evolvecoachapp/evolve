import type { ConversationAudience } from "../models/ConversationAudience";
import { ConversationAudiences } from "../models/ConversationAudience";
import type { ConversationConstraint } from "../models/ConversationConstraint";
import type { ConversationContext } from "../models/ConversationContext";
import type { ConversationEvidence } from "../models/ConversationEvidence";
import type { ConversationGoal } from "../models/ConversationGoal";
import type { ConversationIntent } from "../models/ConversationIntent";
import { ConversationIntents } from "../models/ConversationIntent";
import type { ConversationKnowledge } from "../models/ConversationKnowledge";
import type { ConversationMessage } from "../models/ConversationMessage";
import type { ConversationMetadata } from "../models/ConversationMetadata";
import type { ConversationPreparation } from "../models/ConversationPreparation";
import type { ConversationRequest } from "../models/ConversationRequest";
import type { ConversationResponsePlaceholder } from "../models/ConversationResponsePlaceholder";
import type { ConversationSession } from "../models/ConversationSession";
import type { ConversationStage } from "../models/ConversationStage";
import { ConversationStages } from "../models/ConversationStage";
import type { ConversationState } from "../models/ConversationState";
import { ConversationStates } from "../models/ConversationState";
import type { ConversationSummary } from "../models/ConversationSummary";
import type { ConversationTurn } from "../models/ConversationTurn";
import { freezeContext } from "../utils/freezeContext";

/**
 * Fluent builder for immutable ConversationContext.
 */
export class ConversationContextBuilder {
  private id = "";
  private session: ConversationSession | null = null;
  private audience: ConversationAudience = ConversationAudiences.ATHLETE;
  private state: ConversationState = ConversationStates.READY;
  private stage: ConversationStage = ConversationStages.REQUEST_READY;
  private intent: ConversationIntent = ConversationIntents.FOCUS;
  private goals: readonly ConversationGoal[] = [];
  private constraints: readonly ConversationConstraint[] = [];
  private evidence: readonly ConversationEvidence[] = [];
  private knowledge: ConversationKnowledge | null = null;
  private messages: readonly ConversationMessage[] = [];
  private turns: readonly ConversationTurn[] = [];
  private request: ConversationRequest | null = null;
  private responsePlaceholder: ConversationResponsePlaceholder | null = null;
  private preparation: ConversationPreparation | null = null;
  private metadata: ConversationMetadata = Object.freeze({
    tags: Object.freeze([] as string[]),
    attributes: Object.freeze({}),
  });
  private summary: ConversationSummary | null = null;
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withSession(session: ConversationSession): this {
    this.session = session;
    return this;
  }

  withAudience(audience: ConversationAudience): this {
    this.audience = audience;
    return this;
  }

  withState(state: ConversationState): this {
    this.state = state;
    return this;
  }

  withStage(stage: ConversationStage): this {
    this.stage = stage;
    return this;
  }

  withIntent(intent: ConversationIntent): this {
    this.intent = intent;
    return this;
  }

  withGoals(goals: readonly ConversationGoal[]): this {
    this.goals = goals;
    return this;
  }

  withConstraints(constraints: readonly ConversationConstraint[]): this {
    this.constraints = constraints;
    return this;
  }

  withEvidence(evidence: readonly ConversationEvidence[]): this {
    this.evidence = evidence;
    return this;
  }

  withKnowledge(knowledge: ConversationKnowledge): this {
    this.knowledge = knowledge;
    return this;
  }

  withMessages(messages: readonly ConversationMessage[]): this {
    this.messages = messages;
    return this;
  }

  withTurns(turns: readonly ConversationTurn[]): this {
    this.turns = turns;
    return this;
  }

  withRequest(request: ConversationRequest): this {
    this.request = request;
    return this;
  }

  withResponsePlaceholder(
    placeholder: ConversationResponsePlaceholder,
  ): this {
    this.responsePlaceholder = placeholder;
    return this;
  }

  withPreparation(preparation: ConversationPreparation): this {
    this.preparation = preparation;
    return this;
  }

  withMetadata(metadata: ConversationMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withSummary(summary: ConversationSummary): this {
    this.summary = summary;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): ConversationContext {
    if (
      !this.id ||
      !this.session ||
      !this.knowledge ||
      !this.request ||
      !this.responsePlaceholder ||
      !this.preparation ||
      !this.summary ||
      !this.frozenAt
    ) {
      throw new Error("ConversationContextBuilder missing required fields");
    }

    return freezeContext({
      id: this.id,
      session: this.session,
      audience: this.audience,
      state: this.state,
      stage: this.stage,
      intent: this.intent,
      goals: this.goals,
      constraints: this.constraints,
      evidence: this.evidence,
      knowledge: this.knowledge,
      messages: this.messages,
      turns: this.turns,
      request: this.request,
      responsePlaceholder: this.responsePlaceholder,
      preparation: this.preparation,
      metadata: this.metadata,
      summary: this.summary,
      frozenAt: this.frozenAt,
    });
  }
}
