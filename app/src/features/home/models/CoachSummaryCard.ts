/** Immutable coach insight summary for Home. */
export interface CoachSummaryCard {
  readonly present: boolean;
  readonly message: string;
  readonly actionLabel: string;
  readonly destination: string;
}
