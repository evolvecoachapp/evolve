import type { WorkoutAnalyticsRepository } from "../../analytics/repository";
import type { AthleteContextRepository } from "../../athlete-context/repository";
import type { WorkoutRecordsRepository } from "../../records/repository";
import type { WorkoutHistoryRepository } from "../../workout/repository";
import type { CoachInsight } from "../models/CoachInsight";
import type { CoachRecommendation } from "../models/CoachRecommendation";
import type { CoachSummary } from "../models/CoachSummary";
import type { RiskFlag } from "../models/RiskFlag";
import {
  buildCoachSummary,
  buildHighFrequencyRisk,
  buildInactivityRisk,
  buildProgressStatus,
  buildRecommendations,
  buildStagnationRisk,
  detectExercisePlateau,
  detectFrequencyTrend,
  detectInactivity,
  detectRecentPR,
  detectRecoveryRisk,
  detectVolumeTrend,
  scoreTrainingConsistency,
} from "../utils";
import type {
  CoachIntelligenceRepository,
  CoachIntelligenceSnapshot,
} from "./CoachIntelligenceRepository";

const DEFAULT_TREND_WEEKS = 8;

/**
 * Coach intelligence backed by analytics, records, history, and athlete context.
 *
 * Produces structured insights only — no natural language, no AI providers.
 */
export class HistoryBackedCoachIntelligenceRepository
  implements CoachIntelligenceRepository
{
  constructor(
    private readonly analytics: WorkoutAnalyticsRepository,
    private readonly records: WorkoutRecordsRepository,
    private readonly history: WorkoutHistoryRepository,
    private readonly athleteContext: AthleteContextRepository,
  ) {}

  async getSnapshot(
    referenceDate: Date = new Date(),
  ): Promise<CoachIntelligenceSnapshot> {
    return this.computeSnapshot(referenceDate);
  }

  async getCoachSummary(referenceDate: Date = new Date()): Promise<CoachSummary> {
    const snapshot = await this.computeSnapshot(referenceDate);
    return snapshot.summary;
  }

  async getInsights(
    referenceDate: Date = new Date(),
  ): Promise<readonly CoachInsight[]> {
    const snapshot = await this.computeSnapshot(referenceDate);
    return snapshot.insights;
  }

  async getRiskFlags(
    referenceDate: Date = new Date(),
  ): Promise<readonly RiskFlag[]> {
    const snapshot = await this.computeSnapshot(referenceDate);
    return snapshot.riskFlags;
  }

  async getRecommendations(
    referenceDate: Date = new Date(),
  ): Promise<readonly CoachRecommendation[]> {
    const snapshot = await this.computeSnapshot(referenceDate);
    return snapshot.recommendations;
  }

  private async computeSnapshot(
    referenceDate: Date,
  ): Promise<CoachIntelligenceSnapshot> {
    const [
      volumeSeries,
      frequencySeries,
      workoutRecord,
      exerciseRecords,
      sessions,
      athleteSnapshot,
    ] = await Promise.all([
      this.analytics.getVolumeTrend(DEFAULT_TREND_WEEKS, referenceDate),
      this.analytics.getWorkoutFrequency(DEFAULT_TREND_WEEKS, referenceDate),
      this.records.getWorkoutRecord(),
      this.records.getExerciseRecords(),
      this.history.getCompletedSessions(),
      this.athleteContext.getSnapshot(referenceDate),
    ]);

    const athleteGoal = athleteSnapshot.profile.goal;
    const trainingExperience = athleteSnapshot.profile.experience;

    const volumeTrend = detectVolumeTrend(volumeSeries);
    const frequencyTrend = detectFrequencyTrend(frequencySeries);
    const consistencyScore = scoreTrainingConsistency(frequencySeries);
    const detectedAt = referenceDate.toISOString();

    const insights: CoachInsight[] = [];

    if (volumeTrend.direction !== "insufficient_data") {
      insights.push(
        Object.freeze({
          id: "insight:volume_trend",
          kind: "volume_trend" as const,
          confidence: 0.8,
          detectedAt,
          payload: Object.freeze({
            direction: volumeTrend.direction,
            changeRatio: volumeTrend.changeRatio,
            windowWeeks: volumeTrend.windowWeeks,
          }),
        }),
      );
    }

    if (frequencyTrend.direction !== "insufficient_data") {
      insights.push(
        Object.freeze({
          id: "insight:frequency_trend",
          kind: "frequency_trend" as const,
          confidence: 0.8,
          detectedAt,
          payload: Object.freeze({
            direction: frequencyTrend.direction,
            changeRatio: frequencyTrend.changeRatio,
            windowWeeks: frequencyTrend.windowWeeks,
          }),
        }),
      );
    }

    if (sessions.length > 0) {
      insights.push(
        Object.freeze({
          id: "insight:training_consistency",
          kind: "training_consistency" as const,
          confidence: 0.85,
          detectedAt,
          payload: Object.freeze({
            consistencyScore,
            windowWeeks: frequencySeries.points.length,
          }),
        }),
      );
    }

    const recentPR = detectRecentPR(workoutRecord, { referenceDate });
    if (recentPR != null) {
      insights.push(recentPR);
    }

    const plateauInsights = detectExercisePlateau(exerciseRecords, sessions, {
      referenceDate,
    });
    insights.push(...plateauInsights);

    const inactivity = detectInactivity(sessions, { referenceDate });
    if (inactivity != null) {
      insights.push(inactivity);
    }

    const recoveryResult = detectRecoveryRisk(sessions, volumeSeries, {
      referenceDate,
    });
    if (recoveryResult.insightKind != null) {
      insights.push(
        Object.freeze({
          id: `insight:${recoveryResult.insightKind}`,
          kind: recoveryResult.insightKind,
          confidence: 0.7,
          detectedAt,
          payload: Object.freeze({
            level: recoveryResult.recovery.level,
            fatigueScore: recoveryResult.recovery.fatigueScore,
            daysSinceLastSession: recoveryResult.recovery.daysSinceLastSession,
          }),
        }),
      );
    }

    const risks: RiskFlag[] = [];
    const inactivityRisk = buildInactivityRisk(inactivity);
    if (inactivityRisk != null) {
      risks.push(inactivityRisk);
    }
    const stagnationRisk = buildStagnationRisk(plateauInsights);
    if (stagnationRisk != null) {
      risks.push(stagnationRisk);
    }
    if (recoveryResult.risk != null) {
      risks.push(recoveryResult.risk);
    }

    const recentWeeklyAverage =
      frequencySeries.points.length === 0
        ? 0
        : frequencySeries.points
            .slice(-2)
            .reduce((acc, point) => acc + point.value, 0) /
          Math.min(2, frequencySeries.points.length);
    const highFrequencyRisk = buildHighFrequencyRisk(
      frequencyTrend,
      recentWeeklyAverage,
    );
    if (highFrequencyRisk != null) {
      risks.push(highFrequencyRisk);
    }

    const progress = buildProgressStatus({
      recentPRCount: recentPR == null ? 0 : 1,
      plateauExerciseCount: plateauInsights.length,
      volumeTrend,
    });

    const frozenInsights = Object.freeze(insights);
    const frozenRisks = Object.freeze(risks);

    const recommendations = buildRecommendations({
      insights: frozenInsights,
      risks: frozenRisks,
      volumeTrend,
      frequencyTrend,
      recovery: recoveryResult.recovery,
      progress,
      consistencyScore,
      athleteGoal,
      trainingExperience,
    });

    const summary = buildCoachSummary({
      volumeTrend,
      frequencyTrend,
      recovery: recoveryResult.recovery,
      progress,
      consistencyScore,
      insights: frozenInsights,
      risks: frozenRisks,
      recommendationCount: recommendations.length,
      athleteGoal,
      trainingExperience,
      generatedAt: detectedAt,
    });

    return Object.freeze({
      summary,
      insights: frozenInsights,
      riskFlags: frozenRisks,
      recommendations,
    });
  }
}
