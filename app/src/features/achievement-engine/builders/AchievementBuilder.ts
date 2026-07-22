import type { Achievement } from "../models/Achievement";
import type { AchievementCategory } from "../models/AchievementCategory";
import type { AchievementContext } from "../models/AchievementContext";
import type { AchievementEvidence } from "../models/AchievementEvidence";
import type { AchievementLevel } from "../models/AchievementLevel";
import { AchievementLevels } from "../models/AchievementLevel";
import type { AchievementMetadata } from "../models/AchievementMetadata";
import type { AchievementReason } from "../models/AchievementReason";
import { AchievementReasons } from "../models/AchievementReason";
import type { AchievementRule } from "../models/AchievementRule";
import type { AchievementStatus } from "../models/AchievementStatus";
import { AchievementStatuses } from "../models/AchievementStatus";
import type { AchievementType } from "../models/AchievementType";
import { freezeAchievement } from "../utils/freezeResults";

/**
 * Fluent builder for immutable Achievement domain objects.
 */
export class AchievementBuilder {
  private id = "";
  private type: AchievementType = "";
  private category: AchievementCategory = "";
  private level: AchievementLevel = AchievementLevels.STANDARD;
  private status: AchievementStatus = AchievementStatuses.UNLOCKED;
  private title = "";
  private description = "";
  private reason: AchievementReason = AchievementReasons.SURPASSED_BASELINE;
  private rule: AchievementRule | null = null;
  private evidence: AchievementEvidence | null = null;
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

  withType(type: AchievementType): this {
    this.type = type;
    return this;
  }

  withCategory(category: AchievementCategory): this {
    this.category = category;
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

  withEvidence(evidence: AchievementEvidence): this {
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

  build(): Achievement {
    if (
      !this.id ||
      !this.type ||
      !this.category ||
      !this.title ||
      !this.rule ||
      !this.evidence ||
      !this.context ||
      !this.unlockedAt ||
      !this.frozenAt
    ) {
      throw new Error("AchievementBuilder missing required fields");
    }

    return freezeAchievement({
      id: this.id,
      type: this.type,
      category: this.category,
      level: this.level,
      status: this.status,
      title: this.title,
      description: this.description,
      reason: this.reason,
      rule: this.rule,
      evidence: this.evidence,
      context: this.context,
      metadata: this.metadata,
      unlockedAt: this.unlockedAt,
      frozenAt: this.frozenAt,
    });
  }
}
