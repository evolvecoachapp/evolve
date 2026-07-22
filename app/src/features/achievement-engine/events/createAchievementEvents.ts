import type { Achievement } from "../models/Achievement";
import type {
  AchievementEvent,
  AchievementUnlockedEvent,
  PersonalRecordUnlockedEvent,
} from "../models/AchievementEvent";
import { AchievementEventTypes } from "../models/AchievementEvent";
import type { PersonalRecord } from "../models/PersonalRecord";
import { AchievementTypes } from "../models/AchievementType";
import { freezeEvent } from "../utils/freezeResults";

/**
 * Emit immutable achievement events for unlocked achievements.
 * No subscribers in this sprint.
 */
export function createAchievementEvents(
  achievements: readonly Achievement[],
): readonly AchievementEvent[] {
  const events: AchievementEvent[] = [];

  for (const achievement of achievements) {
    if (achievement.status !== "unlocked") {
      continue;
    }

    const unlocked: AchievementUnlockedEvent = freezeEvent({
      id: `aevt:unlocked:${achievement.id}`,
      type: AchievementEventTypes.ACHIEVEMENT_UNLOCKED,
      achievementId: achievement.id,
      achievementType: achievement.type,
      category: achievement.category,
      sessionId: achievement.context.sessionId,
      runtimeId: achievement.context.runtimeId,
      occurredAt: achievement.unlockedAt,
      payload: Object.freeze({
        title: achievement.title,
        level: achievement.level,
        reason: achievement.reason,
        metricKey: achievement.evidence.metricKey,
        currentValue: achievement.evidence.currentValue,
      }),
    }) as AchievementUnlockedEvent;
    events.push(unlocked);

    if (achievement.type === AchievementTypes.PERSONAL_RECORD) {
      const pr = achievement as PersonalRecord;
      const prEvent = freezeEvent({
        id: `aevt:pr:${achievement.id}`,
        type: AchievementEventTypes.PERSONAL_RECORD_UNLOCKED,
        achievementId: achievement.id,
        achievementType: achievement.type,
        category: achievement.category,
        sessionId: achievement.context.sessionId,
        runtimeId: achievement.context.runtimeId,
        occurredAt: achievement.unlockedAt,
        personalRecordType: pr.personalRecordType,
        payload: Object.freeze({
          personalRecordType: pr.personalRecordType,
          currentValue: pr.evidence.currentValue,
          previousValue: pr.evidence.previousValue,
          unit: pr.evidence.unit,
          exerciseId: pr.evidence.exerciseId,
        }),
      } as PersonalRecordUnlockedEvent) as PersonalRecordUnlockedEvent;
      events.push(prEvent);
    }
  }

  return Object.freeze(events);
}
