import type { AthleteStatistics } from "./AthleteStatistics";
import type { AthleteStatusKind } from "./AthleteStatus";
import type { StateVersion } from "./StateVersion";

/**
 * Immutable human-readable state summary.
 */
export interface StateSummary {
  readonly athleteId: string;
  readonly version: StateVersion;
  readonly status: AthleteStatusKind;
  readonly headline: string;
  readonly details: readonly string[];
  readonly statistics: AthleteStatistics;
  readonly createdAt: string;
}
