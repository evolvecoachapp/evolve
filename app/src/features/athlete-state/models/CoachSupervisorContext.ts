import type { AthleteMetadata } from "./AthleteMetadata";
import type { AthleteState } from "./AthleteState";
import type { AthleteSnapshot } from "./AthleteSnapshot";
import type { StateSummary } from "./StateSummary";

/**
 * Immutable context produced for Coach Supervisor consumption.
 */
export interface CoachSupervisorContext {
  readonly athleteId: string;
  readonly state: AthleteState;
  readonly snapshot: AthleteSnapshot | null;
  readonly summary: StateSummary | null;
  readonly focusAreas: readonly string[];
  readonly metadata: AthleteMetadata;
  readonly createdAt: string;
}
