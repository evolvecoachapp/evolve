/**
 * Preparation metadata recording how a conversation context was assembled.
 */
export interface ConversationPreparation {
  readonly preparedAt: string;
  readonly coachingContextId: string;
  readonly selectorNames: readonly string[];
  readonly goalCount: number;
  readonly constraintCount: number;
  readonly evidenceCount: number;
  readonly turnCount: number;
  readonly messageCount: number;
  readonly missingInformation: readonly string[];
}
