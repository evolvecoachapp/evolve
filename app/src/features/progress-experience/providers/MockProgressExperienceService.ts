import { mockProgressService } from "../../progress/providers/MockProgressService";
import { TimeRanges, type TimeRange } from "../models";
import type {
  BodyMetricsDto,
  ChartPointDto,
  CoachInsightSummaryDto,
  NutritionProgressDto,
  ProgressDashboardDto,
  ProgressExperienceService,
  RecoveryProgressDto,
  StrengthProgressDto,
  VolumeProgressDto,
} from "../services";

const RANGE_SCALE: Record<TimeRange, number> = {
  [TimeRanges.LAST_7_DAYS]: 0.82,
  [TimeRanges.LAST_30_DAYS]: 1,
  [TimeRanges.LAST_90_DAYS]: 1.18,
  [TimeRanges.LAST_YEAR]: 1.34,
  [TimeRanges.ALL_TIME]: 1.52,
};

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function labelsForRange(timeRange: TimeRange): readonly string[] {
  switch (timeRange) {
    case TimeRanges.LAST_7_DAYS:
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    case TimeRanges.LAST_30_DAYS:
      return ["W1", "W2", "W3", "W4", "W5"];
    case TimeRanges.LAST_90_DAYS:
      return ["Apr", "May", "Jun", "Jul"];
    case TimeRanges.LAST_YEAR:
      return ["Q1", "Q2", "Q3", "Q4"];
    case TimeRanges.ALL_TIME:
      return ["Y1", "Y2", "Y3", "Y4"];
  }
}

function buildSeries(id: string, label: string, unit: string, base: readonly number[], timeRange: TimeRange) {
  const scale = RANGE_SCALE[timeRange];
  const labels = labelsForRange(timeRange);
  const points: ChartPointDto[] = base.map((value, index) => ({
    label: labels[index] ?? `P${index + 1}`,
    value: round(value * scale),
  }));
  return { id, label, unit, points };
}

async function buildStrengthProgress(timeRange: TimeRange): Promise<StrengthProgressDto> {
  const dashboard = await mockProgressService.getDashboard();
  const records = await mockProgressService.getPersonalRecords();
  const scale = RANGE_SCALE[timeRange];
  return {
    estimatedOneRepMaxKg: round(102 * scale),
    changePercent: round(dashboard.strength.overallChangePercent * scale),
    strongestLift: dashboard.strength.exercises[0]?.exerciseName ?? "Bench Press",
    personalRecordsCount: records.recentCount,
    chart: buildSeries("strength", "Estimated 1RM", "kg", [95, 97, 100, 102], timeRange),
    destination: "/(app)/progress/detailed-analytics",
  };
}

async function buildVolumeProgress(timeRange: TimeRange): Promise<VolumeProgressDto> {
  const volume = await mockProgressService.getTrainingVolume();
  const latest = volume.weeks[volume.weeks.length - 1];
  const scale = RANGE_SCALE[timeRange];
  return {
    totalVolumeKg: round((latest?.totalWeightKg ?? 14200) * scale),
    changePercent: round(volume.changePercent * scale),
    workoutsCompleted: Math.max(1, Math.round(4 * scale)),
    weeklyProgressLabel: `+${round(4 * scale)}% vs last week`,
    monthlyProgressLabel: `+${round(9 * scale)}% vs last month`,
    chart: buildSeries("volume", "Training Volume", "kg", [12400, 13100, 13450, 14200], timeRange),
    destination: "/(app)/progress/exercise-history",
  };
}

function buildRecoveryProgress(timeRange: TimeRange): RecoveryProgressDto {
  const trend = timeRange === TimeRanges.LAST_7_DAYS ? "declining" : "stable";
  return {
    averageScore: timeRange === TimeRanges.LAST_7_DAYS ? 72 : 78,
    trend,
    sleepAverageHours: timeRange === TimeRanges.LAST_7_DAYS ? 6.8 : 7.3,
    readinessLabel: trend === "declining" ? "Recovery declining" : "Recovery stable",
    chart: buildSeries("recovery", "Recovery Score", "score", [82, 80, 79, 72], timeRange),
    destination: "/(app)/progress/detailed-analytics",
  };
}

function buildNutritionProgress(timeRange: TimeRange): NutritionProgressDto {
  return {
    caloriesAdherencePercent: timeRange === TimeRanges.LAST_7_DAYS ? 89 : 92,
    proteinAdherencePercent: 94,
    averageCalories: 2150,
    averageProteinGrams: 152,
    chart: buildSeries("nutrition", "Protein Adherence", "%", [90, 92, 94, 94], timeRange),
    destination: "/(app)/progress/detailed-analytics",
  };
}

async function buildBodyMetrics(timeRange: TimeRange): Promise<BodyMetricsDto> {
  const dashboard = await mockProgressService.getDashboard();
  const history = await mockProgressService.getWeightHistory();
  const latestWeight = history[history.length - 1]?.weightKg ?? 78.5;
  return {
    bodyWeightKg: latestWeight,
    bodyWeightChangeKg: dashboard.monthly.weightChangeKg,
    bodyFatPercent: dashboard.bodyComposition.bodyFatPercent ?? null,
    leanMassKg: dashboard.bodyComposition.leanMassKg ?? 0,
    chart: buildSeries("body-weight", "Body Weight", "kg", [80.2, 79.8, 79.4, latestWeight], timeRange),
    destination: "/(app)/progress/body-metrics",
  };
}

async function buildCoachInsights(timeRange: TimeRange): Promise<readonly CoachInsightSummaryDto[]> {
  return Object.freeze([
    {
      id: "bench-plus-four",
      title: "Bench +4%",
      summary: "Estimated bench 1RM is trending up while weekly volume remains sustainable.",
      metric: "+4%",
      severity: "positive",
      destination: "/(app)/progress/coach-insights/bench-plus-four",
    },
    {
      id: "recovery-declining",
      title: "Recovery declining",
      summary:
        timeRange === TimeRanges.LAST_7_DAYS
          ? "Sleep and readiness slipped this week. Consider trimming accessory volume."
          : "Recovery is stable overall, but sleep quality should stay above 7 hours.",
      metric: timeRange === TimeRanges.LAST_7_DAYS ? "72/100" : "78/100",
      severity: timeRange === TimeRanges.LAST_7_DAYS ? "warning" : "action",
      destination: "/(app)/progress/coach-insights/recovery-declining",
    },
    {
      id: "protein-adherence",
      title: "Protein adherence 94%",
      summary: "Nutrition is supporting strength progression. Keep protein consistent on training days.",
      metric: "94%",
      severity: "positive",
      destination: "/(app)/progress/coach-insights/protein-adherence",
    },
  ]);
}

export const mockProgressExperienceService: ProgressExperienceService = {
  providerId: "mock",
  async getDashboard(timeRange): Promise<ProgressDashboardDto> {
    const dashboard = await mockProgressService.getDashboard();
    const records = await mockProgressService.getPersonalRecords();
    const strength = await buildStrengthProgress(timeRange);
    const volume = await buildVolumeProgress(timeRange);
    const recovery = buildRecoveryProgress(timeRange);
    const nutrition = buildNutritionProgress(timeRange);
    const bodyMetrics = await buildBodyMetrics(timeRange);
    const coachInsights = await buildCoachInsights(timeRange);

    return {
      timeRange,
      headline: `${strength.estimatedOneRepMaxKg} kg est. 1RM`,
      summary: "Training, nutrition, recovery, and coaching are aggregated into one athlete performance dashboard.",
      strength,
      volume,
      recovery,
      nutrition,
      bodyMetrics,
      coachInsights,
      personalRecords: records.records.map((record) => ({
        id: record.id,
        exerciseName: record.exerciseName,
        weightKg: record.weightKg,
        reps: record.reps,
        estimatedOneRepMaxKg: round(record.weightKg * (1 + record.reps / 30)),
        achievedAt: record.achievedAt,
      })),
      trainingStreak: {
        currentDays: dashboard.weekly.workoutsCompleted + 1,
        bestDays: 11,
        completedWeeks: 4,
        destination: "/(app)/progress/exercise-history",
      },
      goalProgress: {
        id: dashboard.goal.id,
        title: dashboard.goal.title,
        currentValue: dashboard.goal.currentValue,
        targetValue: dashboard.goal.targetValue,
        unit: dashboard.goal.unit,
        completionPercent: dashboard.goal.progressPercent,
        status: dashboard.status.label,
        destination: "/(app)/progress/goal-details/goal-1",
      },
      detailsDestination: "/(app)/progress/detailed-analytics",
    };
  },
  getStrengthProgress: buildStrengthProgress,
  getVolumeProgress: buildVolumeProgress,
  async getRecoveryProgress(timeRange) {
    return buildRecoveryProgress(timeRange);
  },
  async getNutritionProgress(timeRange) {
    return buildNutritionProgress(timeRange);
  },
  getBodyMetrics: buildBodyMetrics,
  getCoachInsights: buildCoachInsights,
};

export const emptyMockProgressExperienceService: ProgressExperienceService = {
  ...mockProgressExperienceService,
  async getDashboard(timeRange): Promise<ProgressDashboardDto> {
    return {
      timeRange,
      headline: "No progress yet",
      summary: "Complete a few workouts to unlock performance analytics.",
      strength: {
        estimatedOneRepMaxKg: 0,
        changePercent: 0,
        strongestLift: "No data",
        personalRecordsCount: 0,
        chart: buildSeries("strength", "Estimated 1RM", "kg", [0, 0, 0, 0], timeRange),
      },
      volume: {
        totalVolumeKg: 0,
        changePercent: 0,
        workoutsCompleted: 0,
        weeklyProgressLabel: "No weekly trend",
        monthlyProgressLabel: "No monthly trend",
        chart: buildSeries("volume", "Training Volume", "kg", [0, 0, 0, 0], timeRange),
      },
      recovery: {
        averageScore: 0,
        trend: "stable",
        sleepAverageHours: 0,
        readinessLabel: "No data",
        chart: buildSeries("recovery", "Recovery Score", "score", [0, 0, 0, 0], timeRange),
      },
      nutrition: {
        caloriesAdherencePercent: 0,
        proteinAdherencePercent: 0,
        averageCalories: 0,
        averageProteinGrams: 0,
        chart: buildSeries("nutrition", "Protein Adherence", "%", [0, 0, 0, 0], timeRange),
      },
      bodyMetrics: {
        bodyWeightKg: 0,
        bodyWeightChangeKg: 0,
        bodyFatPercent: null,
        leanMassKg: 0,
        chart: buildSeries("body-weight", "Body Weight", "kg", [0, 0, 0, 0], timeRange),
      },
      coachInsights: [],
      personalRecords: [],
      trainingStreak: {
        currentDays: 0,
        bestDays: 0,
        completedWeeks: 0,
        destination: "/(app)/progress/exercise-history",
      },
      goalProgress: {
        id: "goal-empty",
        title: "Complete your first training block",
        currentValue: 0,
        targetValue: 1,
        unit: "block",
        completionPercent: 0,
        status: "Not started",
        destination: "/(app)/progress/goal-details/goal-empty",
      },
      detailsDestination: "/(app)/progress/detailed-analytics",
    };
  },
  async getCoachInsights() {
    return [];
  },
};
