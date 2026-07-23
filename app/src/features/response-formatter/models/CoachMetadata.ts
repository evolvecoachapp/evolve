/**
 * Immutable coach response metadata tags / attributes.
 */
export interface CoachMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly providerId: string | null;
  readonly modelId: string | null;
  readonly sourceResponseId: string | null;
  readonly sourceRequestId: string | null;
  readonly finishReason: string | null;
}

export const EMPTY_COACH_METADATA: CoachMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({}),
  providerId: null,
  modelId: null,
  sourceResponseId: null,
  sourceRequestId: null,
  finishReason: null,
});
