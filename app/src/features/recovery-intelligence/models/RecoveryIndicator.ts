/**
 * Single observational recovery indicator.
 */
export interface RecoveryIndicator {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly unit: string;
  readonly attributes: Readonly<Record<string, string | number | boolean | null>>;
}
