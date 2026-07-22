import type { ConversationIntent } from "../models/ConversationIntent";
import type { ConversationStage } from "../models/ConversationStage";
import { ConversationStages } from "../models/ConversationStage";
import type { ConversationState } from "../models/ConversationState";
import { ConversationStates } from "../models/ConversationState";
import type { ConversationSummary } from "../models/ConversationSummary";
import { freezeConversationSummary } from "../utils/freezeContext";

/**
 * Fluent builder for immutable ConversationSummary.
 */
export class ConversationSummaryBuilder {
  private contextId = "";
  private athleteId: string | null = null;
  private goalCount = 0;
  private constraintCount = 0;
  private evidenceCount = 0;
  private turnCount = 0;
  private messageCount = 0;
  private topGoalIds: readonly string[] = [];
  private primaryIntent: ConversationIntent | null = null;
  private state: ConversationState = ConversationStates.READY;
  private stage: ConversationStage = ConversationStages.REQUEST_READY;
  private summaryText = "";

  withIds(ids: {
    readonly contextId: string;
    readonly athleteId: string | null;
  }): this {
    this.contextId = ids.contextId;
    this.athleteId = ids.athleteId;
    return this;
  }

  withGoalCount(count: number): this {
    this.goalCount = count;
    return this;
  }

  withConstraintCount(count: number): this {
    this.constraintCount = count;
    return this;
  }

  withEvidenceCount(count: number): this {
    this.evidenceCount = count;
    return this;
  }

  withTurnCount(count: number): this {
    this.turnCount = count;
    return this;
  }

  withMessageCount(count: number): this {
    this.messageCount = count;
    return this;
  }

  withTopGoalIds(ids: readonly string[]): this {
    this.topGoalIds = ids;
    return this;
  }

  withPrimaryIntent(intent: ConversationIntent | null): this {
    this.primaryIntent = intent;
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

  withSummaryText(text: string): this {
    this.summaryText = text;
    return this;
  }

  build(): ConversationSummary {
    if (!this.contextId || !this.summaryText) {
      throw new Error("ConversationSummaryBuilder missing required fields");
    }

    return freezeConversationSummary({
      contextId: this.contextId,
      athleteId: this.athleteId,
      goalCount: this.goalCount,
      constraintCount: this.constraintCount,
      evidenceCount: this.evidenceCount,
      turnCount: this.turnCount,
      messageCount: this.messageCount,
      topGoalIds: Object.freeze([...this.topGoalIds]),
      primaryIntent: this.primaryIntent,
      state: this.state,
      stage: this.stage,
      summaryText: this.summaryText,
    });
  }
}
