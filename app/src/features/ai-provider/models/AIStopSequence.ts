/**
 * Immutable stop sequence descriptor.
 */
export interface AIStopSequence {
  readonly value: string;
  readonly index: number;
}

export function createStopSequences(
  values: readonly string[],
): readonly AIStopSequence[] {
  return Object.freeze(
    values.map((value, index) => Object.freeze({ value, index })),
  );
}
