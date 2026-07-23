/**
 * Immutable citation / reference.
 */
export interface CoachCitation {
  readonly id: string;
  readonly title: string;
  readonly url: string | null;
  readonly source: string | null;
}
