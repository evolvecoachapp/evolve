/**
 * Immutable metadata bag for athlete-state entities.
 */
export interface AthleteMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_ATHLETE_METADATA: AthleteMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
