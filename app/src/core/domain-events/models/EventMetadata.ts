/**
 * Lightweight metadata tags for a domain event.
 */
export interface EventMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string | number | boolean>>;
}

export const EMPTY_EVENT_METADATA: EventMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string | number | boolean>),
});
