import type { AchievementContext } from "../models/AchievementContext";
import type { AchievementEngineResult } from "../models/AchievementEngineResult";
import type { AchievementEvaluationInput } from "../models/AchievementEvaluationInput";
import type { PersonalRecordResult } from "../models/PersonalRecordResult";
import { AchievementSummaryBuilder } from "../builders/AchievementSummaryBuilder";
import {
  createDefaultPersonalRecordDetectors,
  type PersonalRecordDetector,
} from "../detectors";
import { createAchievementEvents } from "../events";
import {
  aggregateAchievements,
  extractPersonalRecords,
  freezeEngineResult,
} from "../utils";
import {
  validateAchievements,
  validateEvaluationInput,
} from "../validators";

const DEFAULT_EVALUATED_AT = "2026-07-22T00:00:00.000Z";

/**
 * Achievement Engine — detects immutable achievements from performance snapshots.
 *
 * First category: Personal Records. Architecture supports future categories.
 * No AI. No persistence. No networking. No history implementation.
 * Never modifies Performance Engine or Workout Runtime.
 */
export class AchievementEngine {
  constructor(
    private readonly detectors: readonly PersonalRecordDetector[] = createDefaultPersonalRecordDetectors(),
  ) {}

  /**
   * Evaluate achievements for a completed workout performance snapshot.
   */
  evaluate(input: AchievementEvaluationInput): AchievementEngineResult {
    const softIssues = [
      ...validateEvaluationInput(
        input.performanceSnapshot,
        input.workoutResult,
      ),
    ];

    const evaluatedAt = input.evaluatedAt ?? DEFAULT_EVALUATED_AT;
    const evaluationId =
      input.evaluationId ??
      `ach:${input.workoutResult.runtimeId}:${evaluatedAt}`;

    const context: AchievementContext = Object.freeze({
      sessionId: input.workoutResult.sessionId,
      runtimeId: input.workoutResult.runtimeId,
      athleteId: input.performanceSnapshot.context.athleteId,
      performanceSnapshotId: input.performanceSnapshot.id,
      dayId: input.performanceSnapshot.context.dayId,
      weekNumber: input.performanceSnapshot.context.weekNumber,
      evaluatedAt,
    });

    const detected = this.detectors.flatMap((detector) =>
      detector.detect({
        performanceSnapshot: input.performanceSnapshot,
        workoutResult: input.workoutResult,
        baselineProvider: input.baselineProvider,
        context,
        evaluatedAt,
      }),
    );

    const achievements = aggregateAchievements(detected);
    softIssues.push(...validateAchievements(achievements));

    const personalRecords = extractPersonalRecords(achievements);
    const events = createAchievementEvents(achievements);

    const summary = new AchievementSummaryBuilder()
      .fromAchievements(
        evaluationId,
        input.workoutResult.sessionId,
        input.workoutResult.runtimeId,
        achievements,
      )
      .build();

    return freezeEngineResult({
      result: Object.freeze({
        evaluationId,
        performanceSnapshotId: input.performanceSnapshot.id,
        sessionId: input.workoutResult.sessionId,
        runtimeId: input.workoutResult.runtimeId,
        achievements,
        personalRecords,
        events,
        unlockedCount: achievements.filter((a) => a.status === "unlocked")
          .length,
        evaluatedAt,
        frozenAt: evaluatedAt,
      }),
      summary,
      validationIssues: Object.freeze([...new Set(softIssues)]),
    });
  }

  /**
   * Detect Personal Records only.
   */
  detectPersonalRecords(
    input: AchievementEvaluationInput,
  ): PersonalRecordResult {
    const engineResult = this.evaluate(input);
    return Object.freeze({
      personalRecords: engineResult.result.personalRecords,
      detectedCount: engineResult.result.personalRecords.length,
      validationIssues: engineResult.validationIssues,
    });
  }
}

export function createAchievementEngine(
  detectors?: readonly PersonalRecordDetector[],
): AchievementEngine {
  return new AchievementEngine(detectors);
}
