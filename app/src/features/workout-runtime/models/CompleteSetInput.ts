/**
 * Performance values recorded when completing the current set.
 */
export interface CompleteSetInput {
  readonly weight?: number | null;
  readonly repetitions?: number | null;
  readonly rpe?: number | null;
  readonly rir?: number | null;
  readonly notes?: readonly string[];
}
