import type { Achievement } from "../models/Achievement";
import type { AchievementEngineResult } from "../models/AchievementEngineResult";
import type { AchievementEvent } from "../models/AchievementEvent";
import type { AchievementResult } from "../models/AchievementResult";
import type { AchievementSummary } from "../models/AchievementSummary";
import type { PersonalRecord } from "../models/PersonalRecord";

function freezeEvidence<T extends Achievement["evidence"]>(evidence: T): T {
  return Object.freeze({
    ...evidence,
    attributes: Object.freeze({ ...evidence.attributes }),
  }) as T;
}

function freezeMetadata(
  metadata: Achievement["metadata"],
): Achievement["metadata"] {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeAchievement(achievement: Achievement): Achievement {
  return Object.freeze({
    ...achievement,
    rule: Object.freeze({ ...achievement.rule }),
    evidence: freezeEvidence(achievement.evidence),
    context: Object.freeze({ ...achievement.context }),
    metadata: freezeMetadata(achievement.metadata),
  });
}

export function freezePersonalRecord(record: PersonalRecord): PersonalRecord {
  return Object.freeze({
    ...freezeAchievement(record),
    personalRecordType: record.personalRecordType,
    evidence: freezeEvidence(record.evidence),
  }) as PersonalRecord;
}

export function freezeSummary(summary: AchievementSummary): AchievementSummary {
  return Object.freeze({
    ...summary,
    categories: Object.freeze([...summary.categories]),
  });
}

export function freezeEvent(event: AchievementEvent): AchievementEvent {
  return Object.freeze({
    ...event,
    payload: Object.freeze({ ...event.payload }),
  });
}

export function freezeAchievementResult(
  result: AchievementResult,
): AchievementResult {
  return Object.freeze({
    ...result,
    achievements: Object.freeze(
      result.achievements.map((a) => freezeAchievement(a)),
    ),
    personalRecords: Object.freeze(
      result.personalRecords.map((pr) => freezePersonalRecord(pr)),
    ),
    events: Object.freeze(result.events.map((e) => freezeEvent(e))),
  });
}

export function freezeEngineResult(
  result: AchievementEngineResult,
): AchievementEngineResult {
  return Object.freeze({
    result: freezeAchievementResult(result.result),
    summary: freezeSummary(result.summary),
    validationIssues: Object.freeze([...result.validationIssues]),
  });
}
