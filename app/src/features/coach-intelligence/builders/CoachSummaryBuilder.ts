import type { CoachIntent } from "../models/CoachIntent";
import type { CoachingContextSummary } from "../models/CoachingContextSummary";
import { freezeCoachingContextSummary } from "../utils/freezeContext";

/**
 * Fluent builder for immutable CoachingContextSummary (Sprint 18.8).
 */
export class CoachSummaryBuilder {
  private contextId = "";
  private athleteId: string | null = null;
  private objectiveCount = 0;
  private constraintCount = 0;
  private instructionCount = 0;
  private focusCount = 0;
  private evidenceCount = 0;
  private topObjectiveIds: readonly string[] = [];
  private primaryIntent: CoachIntent | null = null;
  private summaryText = "";

  withIds(ids: {
    readonly contextId: string;
    readonly athleteId: string | null;
  }): this {
    this.contextId = ids.contextId;
    this.athleteId = ids.athleteId;
    return this;
  }

  withObjectiveCount(count: number): this {
    this.objectiveCount = count;
    return this;
  }

  withConstraintCount(count: number): this {
    this.constraintCount = count;
    return this;
  }

  withInstructionCount(count: number): this {
    this.instructionCount = count;
    return this;
  }

  withFocusCount(count: number): this {
    this.focusCount = count;
    return this;
  }

  withEvidenceCount(count: number): this {
    this.evidenceCount = count;
    return this;
  }

  withTopObjectiveIds(ids: readonly string[]): this {
    this.topObjectiveIds = ids;
    return this;
  }

  withPrimaryIntent(intent: CoachIntent | null): this {
    this.primaryIntent = intent;
    return this;
  }

  withSummaryText(text: string): this {
    this.summaryText = text;
    return this;
  }

  build(): CoachingContextSummary {
    if (!this.contextId || !this.summaryText) {
      throw new Error("CoachSummaryBuilder missing required fields");
    }

    return freezeCoachingContextSummary({
      contextId: this.contextId,
      athleteId: this.athleteId,
      objectiveCount: this.objectiveCount,
      constraintCount: this.constraintCount,
      instructionCount: this.instructionCount,
      focusCount: this.focusCount,
      evidenceCount: this.evidenceCount,
      topObjectiveIds: Object.freeze([...this.topObjectiveIds]),
      primaryIntent: this.primaryIntent,
      summaryText: this.summaryText,
    });
  }
}
