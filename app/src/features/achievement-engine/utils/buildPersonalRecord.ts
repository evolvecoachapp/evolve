import { PersonalRecordBuilder } from "../builders/PersonalRecordBuilder";
import type { AchievementContext } from "../models/AchievementContext";
import { AchievementCategories } from "../models/AchievementCategory";
import { AchievementLevels } from "../models/AchievementLevel";
import { AchievementReasons } from "../models/AchievementReason";
import type { AchievementRule } from "../models/AchievementRule";
import { AchievementTypes } from "../models/AchievementType";
import type { PersonalRecord } from "../models/PersonalRecord";
import type { PersonalRecordType } from "../models/PersonalRecordType";
import { normalizeValue } from "./normalizeOutput";

export interface BuildPersonalRecordParams {
  readonly personalRecordType: PersonalRecordType;
  readonly metricKey: string;
  readonly currentValue: number;
  readonly previousValue: number | null;
  readonly unit: string;
  readonly isFirst: boolean;
  readonly context: AchievementContext;
  readonly evaluatedAt: string;
  readonly exerciseId?: string | null;
  readonly exerciseRuntimeId?: string | null;
  readonly attributes?: Readonly<Record<string, string | number | boolean>>;
}

/**
 * Shared factory for detector Personal Records.
 */
export function buildPersonalRecord(
  params: BuildPersonalRecordParams,
): PersonalRecord {
  const currentValue = normalizeValue(params.currentValue);
  const previousValue =
    params.previousValue == null
      ? null
      : normalizeValue(params.previousValue);

  const exerciseSuffix = params.exerciseId ? `:${params.exerciseId}` : "";
  const rule: AchievementRule = Object.freeze({
    id: `pr:${params.personalRecordType}${exerciseSuffix}`,
    type: AchievementTypes.PERSONAL_RECORD,
    category: AchievementCategories.PERSONAL_RECORDS,
    description: `Detect ${params.personalRecordType}`,
    comparison: "greater_than" as const,
    metricKey: params.metricKey,
  });

  const level =
    previousValue != null && currentValue >= previousValue * 1.1
      ? AchievementLevels.NOTABLE
      : AchievementLevels.STANDARD;

  return new PersonalRecordBuilder()
    .withId(
      `pr:${params.context.performanceSnapshotId}:${params.personalRecordType}${exerciseSuffix}`,
    )
    .withPersonalRecordType(params.personalRecordType)
    .withLevel(level)
    .withReason(
      params.isFirst
        ? AchievementReasons.FIRST_RECORDED_VALUE
        : AchievementReasons.SURPASSED_BASELINE,
    )
    .withRule(rule)
    .withEvidence(
      Object.freeze({
        metricKey: params.metricKey,
        currentValue,
        previousValue,
        unit: params.unit,
        personalRecordType: params.personalRecordType,
        exerciseId: params.exerciseId ?? null,
        exerciseRuntimeId: params.exerciseRuntimeId ?? null,
        attributes: Object.freeze({ ...(params.attributes ?? {}) }),
      }),
    )
    .withContext(params.context)
    .withMetadata(
      Object.freeze({
        tags: Object.freeze(["personal_record", params.personalRecordType]),
        attributes: Object.freeze({
          metricKey: params.metricKey,
          ...(params.exerciseId ? { exerciseId: params.exerciseId } : {}),
        }),
      }),
    )
    .withUnlockedAt(params.evaluatedAt)
    .withFrozenAt(params.evaluatedAt)
    .build();
}
