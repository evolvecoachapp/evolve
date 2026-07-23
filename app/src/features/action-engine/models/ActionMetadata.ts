/**
 * Immutable metadata attached to action plans / steps.
 */
export interface ActionMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly sourceResponseId: string | null;
  readonly plannerId: string | null;
  readonly notes: string | null;
}

export const EMPTY_ACTION_METADATA: ActionMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({}),
  sourceResponseId: null,
  plannerId: null,
  notes: null,
});
