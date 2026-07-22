import type { EventStream } from "../../../core/domain-events/models/EventStream";
import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";

/**
 * Inputs for building an immutable AthleteHistory.
 * DomainEventStream is optional architecture reference metadata only.
 */
export interface HistoryBuildInput {
  readonly workoutResult?: WorkoutResult | null;
  readonly performanceSnapshot?: PerformanceSnapshot | null;
  readonly achievementResult?: AchievementResult | null;
  /** Architecture reference only — not required to build history. */
  readonly eventStream?: EventStream | null;
  readonly athleteId?: string | null;
  readonly historyId?: string;
  readonly snapshotId?: string;
  readonly builtAt?: string;
}
