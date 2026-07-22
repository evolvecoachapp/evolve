import type { AchievementCategory } from "./AchievementCategory";
import type { AchievementType } from "./AchievementType";
import type { PersonalRecordType } from "./PersonalRecordType";

/**
 * Known achievement event types.
 * Open string so future event kinds can be added without changing consumers.
 */
export type AchievementEventType = string;

export const AchievementEventTypes = {
  ACHIEVEMENT_UNLOCKED: "achievement_unlocked",
  PERSONAL_RECORD_UNLOCKED: "personal_record_unlocked",
} as const satisfies Record<string, AchievementEventType>;

/**
 * Immutable achievement domain event (engine-emitted; no subscribers yet).
 */
export interface AchievementEvent {
  readonly id: string;
  readonly type: AchievementEventType;
  readonly achievementId: string;
  readonly achievementType: AchievementType;
  readonly category: AchievementCategory;
  readonly sessionId: string;
  readonly runtimeId: string;
  readonly occurredAt: string;
  readonly payload: Readonly<Record<string, string | number | boolean | null>>;
}

/**
 * Emitted when any achievement is unlocked.
 */
export interface AchievementUnlockedEvent extends AchievementEvent {
  readonly type: typeof AchievementEventTypes.ACHIEVEMENT_UNLOCKED;
}

/**
 * Emitted when a Personal Record is unlocked.
 */
export interface PersonalRecordUnlockedEvent extends AchievementEvent {
  readonly type: typeof AchievementEventTypes.PERSONAL_RECORD_UNLOCKED;
  readonly personalRecordType: PersonalRecordType;
}
