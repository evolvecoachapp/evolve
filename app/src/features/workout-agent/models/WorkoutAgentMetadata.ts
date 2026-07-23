/**
 * Immutable metadata tags / attributes for Workout Agent artifacts.
 */
export interface WorkoutAgentMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}

export const EMPTY_WORKOUT_AGENT_METADATA: WorkoutAgentMetadata =
  Object.freeze({
    tags: Object.freeze([]) as readonly string[],
    attributes: Object.freeze({}) as Readonly<
      Record<string, string | number | boolean | null>
    >,
  });
