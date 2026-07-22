/**
 * Preparation metadata recording how a coaching context was assembled.
 */
export interface CoachPreparation {
  readonly preparedAt: string;
  readonly insightSnapshotId: string;
  readonly selectorNames: readonly string[];
  readonly objectiveCount: number;
  readonly constraintCount: number;
  readonly instructionCount: number;
  readonly evidenceCount: number;
  readonly missingInformation: readonly string[];
}
