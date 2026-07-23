export interface PromptStatistics {
  readonly blockCount: number;
  readonly sectionCount: number;
  readonly instructionCount: number;
  readonly constraintCount: number;
  readonly approxTokenCount: number;
  readonly characterCount: number;
  readonly blockTypeCounts: Readonly<Record<string, number>>;
}
