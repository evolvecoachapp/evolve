import type { AchievementEvidence } from "./AchievementEvidence";
import type { PersonalRecordType } from "./PersonalRecordType";

/**
 * Personal Record–specific evidence (extends generic achievement evidence).
 */
export interface PersonalRecordEvidence extends AchievementEvidence {
  readonly personalRecordType: PersonalRecordType;
  readonly exerciseId: string | null;
  readonly exerciseRuntimeId: string | null;
}
