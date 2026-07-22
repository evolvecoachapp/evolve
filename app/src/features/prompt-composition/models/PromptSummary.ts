/**
 * Compact public summary of a PromptPackage.
 */
export interface PromptSummary {
  readonly packageId: string;
  readonly conversationContextId: string;
  readonly athleteId: string | null;
  readonly blockCount: number;
  readonly sectionCount: number;
  readonly instructionCount: number;
  readonly blockTypes: readonly string[];
  readonly topBlockIds: readonly string[];
  readonly primaryIntent: string | null;
  readonly summaryText: string;
}
