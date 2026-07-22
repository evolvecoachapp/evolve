import type { Achievement } from "./Achievement";
import type { AchievementEvent } from "./AchievementEvent";
import type { PersonalRecord } from "./PersonalRecord";

/**
 * Immutable result of achievement evaluation for one session.
 */
export interface AchievementResult {
  readonly evaluationId: string;
  readonly performanceSnapshotId: string;
  readonly sessionId: string;
  readonly runtimeId: string;
  readonly achievements: readonly Achievement[];
  readonly personalRecords: readonly PersonalRecord[];
  readonly events: readonly AchievementEvent[];
  readonly unlockedCount: number;
  readonly evaluatedAt: string;
  readonly frozenAt: string;
}
