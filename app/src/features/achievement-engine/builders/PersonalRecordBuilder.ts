import type { AchievementContext } from "../models/AchievementContext";
import type { AchievementLevel } from "../models/AchievementLevel";
import { AchievementLevels } from "../models/AchievementLevel";
import type { AchievementMetadata } from "../models/AchievementMetadata";
import type { AchievementReason } from "../models/AchievementReason";
import { AchievementReasons } from "../models/AchievementReason";
import type { AchievementRule } from "../models/AchievementRule";
import type { AchievementStatus } from "../models/AchievementStatus";
import { AchievementStatuses } from "../models/AchievementStatus";
import { AchievementCategories } from "../models/AchievementCategory";
import { AchievementTypes } from "../models/AchievementType";
import type { PersonalRecord } from "../models/PersonalRecord";
import type { PersonalRecordEvidence } from "../models/PersonalRecordEvidence";
import type { PersonalRecordType } from "../models/PersonalRecordType";
import { freezePersonalRecord } from "../utils/freezeResults";

const TITLE_BY_TYPE: Record<PersonalRecordType, string> = {
  highest_weight: "Highest Weight",
  highest_volume: "Highest Volume",
  highest_tonnage: "Highest Tonnage",
  highest_repetitions: "Highest Repetitions",
  highest_completed_sets: "Highest Completed Sets",
  highest_density: "Highest Density",
  highest_exercise_volume: "Highest Exercise Volume",
  highest_session_volume: "Highest Session Volume",
};

/**
 * Fluent builder for immutable PersonalRecord achievements.
 */
export class PersonalRecordBuilder {
  private id = "";
  private personalRecordType: PersonalRecordType | null = null;
  private level: AchievementLevel = AchievementLevels.STANDARD;
  private status: AchievementStatus = AchievementStatuses.UNLOCKED;
  private title = "";
  private description = "";
  private reason: AchievementReason = AchievementReasons.SURPASSED_BASELINE;
  private rule: AchievementRule | null = null;
  private evidence: PersonalRecordEvidence | null = null;
  private context: AchievementContext | null = null;
  private metadata: AchievementMetadata = Object.freeze({
    tags: Object.freeze([] as string[]),
    attributes: Object.freeze({} as Record<string, string | number | boolean>),
  });
  private unlockedAt = "";
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withPersonalRecordType(type: PersonalRecordType): this {
    this.personalRecordType = type;
    if (!this.title) {
      this.title = TITLE_BY_TYPE[type];
    }
    return this;
  }

  withLevel(level: AchievementLevel): this {
    this.level = level;
    return this;
  }

  withStatus(status: AchievementStatus): this {
    this.status = status;
    return this;
  }

  withTitle(title: string): this {
    this.title = title;
    return this;
  }

  withDescription(description: string): this {
    this.description = description;
    return this;
  }

  withReason(reason: AchievementReason): this {
    this.reason = reason;
    return this;
  }

  withRule(rule: AchievementRule): this {
    this.rule = rule;
    return this;
  }

  withEvidence(evidence: PersonalRecordEvidence): this {
    this.evidence = evidence;
    return this;
  }

  withContext(context: AchievementContext): this {
    this.context = context;
    return this;
  }

  withMetadata(metadata: AchievementMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withUnlockedAt(unlockedAt: string): this {
    this.unlockedAt = unlockedAt;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): PersonalRecord {
    if (
      !this.id ||
      !this.personalRecordType ||
      !this.rule ||
      !this.evidence ||
      !this.context ||
      !this.unlockedAt ||
      !this.frozenAt
    ) {
      throw new Error("PersonalRecordBuilder missing required fields");
    }

    const description =
      this.description ||
      `${TITLE_BY_TYPE[this.personalRecordType]}: ${this.evidence.currentValue} ${this.evidence.unit}`;

    return freezePersonalRecord({
      id: this.id,
      type: AchievementTypes.PERSONAL_RECORD,
      category: AchievementCategories.PERSONAL_RECORDS,
      level: this.level,
      status: this.status,
      title: this.title || TITLE_BY_TYPE[this.personalRecordType],
      description,
      reason: this.reason,
      rule: this.rule,
      evidence: this.evidence,
      context: this.context,
      metadata: this.metadata,
      unlockedAt: this.unlockedAt,
      frozenAt: this.frozenAt,
      personalRecordType: this.personalRecordType,
    });
  }
}
