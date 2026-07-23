/**
 * Immutable tool-call request emitted by a future tool-calling provider.
 */
export interface AIToolCall {
  readonly id: string;
  readonly name: string;
  readonly argumentsJson: string;
  readonly index: number;
}
