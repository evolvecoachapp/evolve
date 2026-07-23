/**
 * Immutable supervisor metadata bag.
 */
export interface CoachSupervisorMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_SUPERVISOR_METADATA: CoachSupervisorMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
