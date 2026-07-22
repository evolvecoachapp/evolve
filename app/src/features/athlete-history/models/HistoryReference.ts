/**
 * Immutable link between a history entry and a related domain entity.
 */
export interface HistoryReference {
  readonly kind: string;
  readonly id: string;
  readonly label: string | null;
}
