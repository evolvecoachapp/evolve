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

  withPackageId(packageId: string): this {
    this.packageId = packageId;
    return this;
  }

  withConversationContextId(conversationContextId: string): this {
    this.conversationContextId = conversationContextId;
    return this;
  }

  withAthleteId(athleteId: string | null): this {
    this.athleteId = athleteId;
    return this;
  }

  withBlockCount(blockCount: number): this {
    this.blockCount = blockCount;
    return this;
  }

  withSectionCount(sectionCount: number): this {
    this.sectionCount = sectionCount;
    return this;
  }

  withInstructionCount(instructionCount: number): this {
    this.instructionCount = instructionCount;
    return this;
  }

  withBlockTypes(blockTypes: readonly string[]): this {
    this.blockTypes = blockTypes;
    return this;
  }

  withTopBlockIds(topBlockIds: readonly string[]): this {
    this.topBlockIds = topBlockIds;
    return this;
  }

  withPrimaryIntent(primaryIntent: string | null): this {
    this.primaryIntent = primaryIntent;
    return this;
  }

  withSummaryText(summaryText: string): this {
    this.summaryText = summaryText;
    return this;
  }

  build(): PromptSummary {
    if (!this.packageId || !this.conversationContextId || !this.summaryText) {
      throw new Error("PromptSummaryBuilder missing required fields");
    }

    return freezePromptSummary({
      packageId: this.packageId,
      conversationContextId: this.conversationContextId,
      athleteId: this.athleteId,
      blockCount: this.blockCount,
      sectionCount: this.sectionCount,
      instructionCount: this.instructionCount,
      blockTypes: this.blockTypes,
      topBlockIds: this.topBlockIds,
      primaryIntent: this.primaryIntent,
      summaryText: this.summaryText,
    });
  }
}
