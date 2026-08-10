import { createRecoveryDay, type RecoveryDay } from "../models";
import type {
  ReadinessProgressDto,
  RecoveryDashboardDto,
  RecoveryExperienceService,
  SleepStateDto,
} from "../services";

function buildAvailableDays(base: RecoveryDay): readonly RecoveryDay[] {
  return Object.freeze([
    Object.freeze({
      ...base,
      id: `${base.isoDate}-minus-1`,
      label: "Yesterday",
      shortLabel: "Yday",
      relativeLabel: "Yesterday",
      isToday: false,
    }),
    Object.freeze({ ...base }),
    Object.freeze({
      ...base,
      id: `${base.isoDate}-plus-1`,
      label: "Tomorrow",
      shortLabel: "Tom",
      relativeLabel: "Tomorrow",
      isToday: false,
    }),
  ]);
}

const DEFAULT_DAY = createRecoveryDay({
  id: "today",
  isoDate: new Date().toISOString().slice(0, 10),
  label: "Today",
  shortLabel: "Today",
  relativeLabel: "Today",
  isToday: true,
});

function buildPopulatedDashboard(
  day: RecoveryDay = DEFAULT_DAY,
  overrides: {
    readonly sleep?: Partial<SleepStateDto>;
    readonly readiness?: Partial<ReadinessProgressDto>;
    readonly recoveryScore?: number;
  } = {},
): RecoveryDashboardDto {
  const sleep: SleepStateDto = Object.freeze({
    hours: overrides.sleep?.hours ?? 7.2,
    quality: overrides.sleep?.quality ?? 78,
    label: overrides.sleep?.label ?? "good",
    logged: overrides.sleep?.logged ?? true,
    destination: "/(app)/recovery/history",
  });
  const readiness: ReadinessProgressDto = Object.freeze({
    score: overrides.readiness?.score ?? 74,
    label: overrides.readiness?.label ?? "good",
    destination: "/(app)/recovery/readiness",
  });
  const recoveryScore = overrides.recoveryScore ?? 74;

  return Object.freeze({
    day,
    availableDays: buildAvailableDays(day),
    headline: `${recoveryScore}% recovery`,
    summary: "Fatigue 62 · adequate · Sleep 7.2h (good)",
    todaysGoal: "Protect sleep quality and keep training load manageable today.",
    recoveryScore,
    status: "adequate",
    sleep,
    readiness,
    signals: Object.freeze([
      Object.freeze({ id: "fatigue", summary: "Fatigue 62 · adequate" }),
      Object.freeze({ id: "sleep", summary: "Sleep 7.2h (good)" }),
    ]),
    assessmentAvailable: true,
    historyDestination: "/(app)/recovery/history",
  });
}

function buildEmptyDashboard(day: RecoveryDay = DEFAULT_DAY): RecoveryDashboardDto {
  return Object.freeze({
    day,
    availableDays: buildAvailableDays(day),
    headline: "No recovery data yet",
    summary: "Log sleep and check readiness to unlock recovery guidance.",
    todaysGoal: "Build your first consistent recovery baseline.",
    recoveryScore: 0,
    status: "",
    sleep: Object.freeze({
      hours: 0,
      quality: 0,
      label: "fair",
      logged: false,
      destination: "/(app)/recovery/history",
    }),
    readiness: Object.freeze({
      score: 0,
      label: "fair",
      destination: "/(app)/recovery/readiness",
    }),
    signals: Object.freeze([]),
    assessmentAvailable: false,
    historyDestination: "/(app)/recovery/history",
  });
}

function createMockService(
  seed: (day: RecoveryDay) => RecoveryDashboardDto,
): RecoveryExperienceService {
  const sessionState = new Map<string, RecoveryDashboardDto>();

  function dayKey(day: RecoveryDay): string {
    return day.isoDate;
  }

  return {
    providerId: "mock",
    async getDashboard(day: RecoveryDay) {
      const key = dayKey(day);
      if (!sessionState.has(key)) {
        sessionState.set(key, seed(day));
      }
      return sessionState.get(key)!;
    },
    async logSleep(day: RecoveryDay, hours: number) {
      const current = await this.getDashboard(day);
      const next = buildPopulatedDashboard(day, {
        sleep: {
          hours,
          quality: Math.min(100, Math.round(hours * 10)),
          label: hours >= 7 ? "good" : "fair",
          logged: true,
        },
        readiness: current.readiness,
        recoveryScore: current.recoveryScore,
      });
      sessionState.set(dayKey(day), next);
      return next;
    },
    async updateReadiness(day: RecoveryDay, score: number) {
      const current = await this.getDashboard(day);
      const label =
        score >= 80 ? "excellent" : score >= 65 ? "good" : score >= 50 ? "fair" : "poor";
      const next = buildPopulatedDashboard(day, {
        sleep: current.sleep,
        readiness: { score, label },
        recoveryScore: Math.round((current.recoveryScore + score) / 2),
      });
      sessionState.set(dayKey(day), next);
      return next;
    },
    async assessRecovery(day: RecoveryDay) {
      const current = await this.getDashboard(day);
      const next = buildPopulatedDashboard(day, {
        sleep: current.sleep,
        readiness: current.readiness,
        recoveryScore: Math.max(current.recoveryScore, current.readiness.score),
      });
      sessionState.set(dayKey(day), next);
      return next;
    },
  };
}

export const mockRecoveryExperienceService = createMockService(buildPopulatedDashboard);

export const emptyMockRecoveryExperienceService = createMockService(buildEmptyDashboard);

export function resetMockRecoveryExperienceState(): void {
  // Each mock service owns an isolated session map; reset is a no-op unless
  // tests recreate services. Kept for API symmetry with other experience mocks.
}
