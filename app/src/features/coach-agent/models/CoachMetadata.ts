/**
 * Immutable metadata bag for Coach Agent artifacts.
 */
export interface CoachMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_COACH_METADATA: CoachMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
