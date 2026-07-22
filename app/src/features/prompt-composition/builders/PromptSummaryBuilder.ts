import type { PromptSummary } from "../models/PromptSummary";
import { freezePromptSummary } from "../utils/freezePackage";

/**
 * Fluent builder for immutable PromptSummary.
 */
export class PromptSummaryBuilder {
  private packageId = "";
  private conversationContextId = "";
  private athleteId: string | null = null;
  private blockCount = 0;
  private sectionCount = 0;
  private instructionCount = 0;
  private blockTypes: readonly string[] = [];
  private topBlockIds: readonly string[] = [];
  private primaryIntent: string | null = null;
  private summaryText = "";

  withIds(ids: {
    readonly packageId: string;
    readonly conversationContextId: string;
    readonly athleteId: string | null;
  }): this {
    this.packageId = ids.packageId;
    this.conversationContextId = ids.conversationContextId;
    this.athleteId = ids.athleteId;
    return this;
  }

  withBlockCount(count: number): this {
    this.blockCount = count;
    return this;
  }

  withSectionCount(count: number): this {
    this.sectionCount = count;
    return this;
  }

  withInstructionCount(count: number): this {
    this.instructionCount = count;
    return this;
  }

  withBlockTypes(types: readonly string[]): this {
    this.blockTypes = types;
    return this;
  }

  withTopBlockIds(ids: readonly string[]): this {
    this.topBlockIds = ids;
    return this;
  }

  withPrimaryIntent(intent: string | null): this {
    this.primaryIntent = intent;
    return this;
  }

  withSummaryText(text: string): this {
    this.summaryText = text;
    return this;
  }

  build(): PromptSummary {
    if (
      !this.packageId ||
      !this.conversationContextId ||
      !this.summaryText
    ) {
      throw new Error("PromptSummaryBuilder missing required fields");
    }

    return freezePromptSummary({
      packageId: this.packageId,
      conversationContextId: this.conversationContextId,
      athleteId: this.athleteId,
      blockCount: this.blockCount,
      sectionCount: this.sectionCount,
      instructionCount: this.instructionCount,
      blockTypes: Object.freeze([...this.blockTypes]),
      topBlockIds: Object.freeze([...this.topBlockIds]),
      primaryIntent: this.primaryIntent,
      summaryText: this.summaryText,
    });
  }
}
