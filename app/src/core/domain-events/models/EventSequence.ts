/**
 * Monotonic sequence number within an EventStream.
 * Sequence starts at 1 and increases by 1 for each published event.
 */
export type EventSequence = number;

export function isValidEventSequence(value: number): boolean {
  return Number.isInteger(value) && value >= 1;
}
