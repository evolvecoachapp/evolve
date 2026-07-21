import type { AthleteGoal } from "../../../athlete-context/models/AthleteGoal";
import type { TrainingExperience } from "../../../athlete-context/models/TrainingExperience";
import { buildRecommendations } from "../buildRecommendations";
import type { CoachInsight } from "../../models/CoachInsight";
import type { RiskFlag } from "../../models/RiskFlag";
import type { TrainingTrend } from "../../models/TrainingTrend";
import type { ProgressStatus } from "../../models/ProgressStatus";
import type { RecoveryStatus } from "../../models/RecoveryStatus";

const volumeTrend: TrainingTrend = Object.freeze({
  metric: "volume",
  direction: "decreasing",
  changeRatio: -0.2,
  windowWeeks: 8,
});

const frequencyTrend: TrainingTrend = Object.freeze({
  metric: "frequency",
  direction: "stable",
  changeRatio: 0.01,
  windowWeeks: 8,
});

const recovery: RecoveryStatus = Object.freeze({
  level: "moderate",
  daysSinceLastSession: 2,
  fatigueScore: 0.3,
});

const progress: ProgressStatus = Object.freeze({
  level: "maintaining",
  recentPRCount: 0,
  plateauExerciseCount: 0,
});

describe("buildRecommendations", () => {
  it("recommends return_to_training for inactivity", () => {
    const insights: readonly CoachInsight[] = Object.freeze([
      Object.freeze({
        id: "insight:inactivity",
        kind: "inactivity" as const,
        confidence: 0.9,
        detectedAt: "2026-07-21T12:00:00.000Z",
        payload: Object.freeze({ daysSinceLastSession: 20 }),
      }),
    ]);
    const risks: readonly RiskFlag[] = Object.freeze([
      Object.freeze({
        code: "long_inactivity" as const,
        severity: "medium" as const,
        evidence: Object.freeze({ daysSinceLastSession: 20 }),
      }),
    ]);

    const result = buildRecommendations({
      insights,
      risks,
      volumeTrend,
      frequencyTrend,
      recovery,
      progress,
      consistencyScore: 0.2,
    });

    expect(result.some((item) => item.code === "return_to_training")).toBe(
      true,
    );
  });

  it("recommends increase_volume when volume is decreasing", () => {
    const insights: readonly CoachInsight[] = Object.freeze([
      Object.freeze({
        id: "insight:volume_trend",
        kind: "volume_trend" as const,
        confidence: 0.8,
        detectedAt: "2026-07-21T12:00:00.000Z",
        payload: Object.freeze({ direction: "decreasing" }),
      }),
    ]);

    const result = buildRecommendations({
      insights,
      risks: Object.freeze([]),
      volumeTrend,
      frequencyTrend,
      recovery,
      progress,
      consistencyScore: 0.5,
    });

    expect(result.some((item) => item.code === "increase_volume")).toBe(true);
  });

  it("recommends deload for elevated fatigue", () => {
    const result = buildRecommendations({
      insights: Object.freeze([]),
      risks: Object.freeze([
        Object.freeze({
          code: "elevated_fatigue" as const,
          severity: "high" as const,
          evidence: Object.freeze({ fatigueScore: 0.9 }),
        }),
      ]),
      volumeTrend: Object.freeze({
        metric: "volume",
        direction: "increasing",
        changeRatio: 0.4,
        windowWeeks: 8,
      }),
      frequencyTrend,
      recovery: Object.freeze({
        level: "high",
        daysSinceLastSession: 0,
        fatigueScore: 0.9,
      }),
      progress,
      consistencyScore: 0.8,
    });

    expect(result.some((item) => item.code === "deload")).toBe(true);
  });

  it("uses beginner experience to prefer maintain_consistency over increase_volume", () => {
    const experience: TrainingExperience = Object.freeze({
      level: "beginner",
      trainingStartedAt: null,
      yearsTraining: 0.5,
    });

    const result = buildRecommendations({
      insights: Object.freeze([]),
      risks: Object.freeze([]),
      volumeTrend,
      frequencyTrend,
      recovery,
      progress,
      consistencyScore: 0.4,
      trainingExperience: experience,
    });

    expect(result.some((item) => item.code === "maintain_consistency")).toBe(
      true,
    );
    expect(result.some((item) => item.code === "increase_volume")).toBe(false);
  });

  it("raises progress_load priority for advanced athletes with recent PRs", () => {
    const experience: TrainingExperience = Object.freeze({
      level: "advanced",
      trainingStartedAt: "2015-01-01T00:00:00.000Z",
      yearsTraining: 10,
    });
    const goal: AthleteGoal = Object.freeze({
      primary: "strength",
      secondary: null,
      targetDate: null,
    });

    const result = buildRecommendations({
      insights: Object.freeze([
        Object.freeze({
          id: "insight:recent_pr",
          kind: "recent_pr" as const,
          confidence: 0.9,
          detectedAt: "2026-07-21T12:00:00.000Z",
          payload: Object.freeze({ ageDays: 2 }),
        }),
      ]),
      risks: Object.freeze([]),
      volumeTrend: Object.freeze({
        metric: "volume",
        direction: "stable",
        changeRatio: 0.01,
        windowWeeks: 8,
      }),
      frequencyTrend,
      recovery,
      progress: Object.freeze({
        level: "improving",
        recentPRCount: 1,
        plateauExerciseCount: 0,
      }),
      consistencyScore: 0.8,
      athleteGoal: goal,
      trainingExperience: experience,
    });

    const progressLoad = result.find((item) => item.code === "progress_load");
    expect(progressLoad?.priority).toBe("high");
  });
});
