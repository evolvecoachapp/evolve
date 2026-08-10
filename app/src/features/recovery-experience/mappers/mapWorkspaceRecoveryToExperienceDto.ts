import type { WorkspaceRecovery } from "../../unified-workspace/models/WorkspaceRecovery";
import type { RecoveryDashboardDto } from "../services";
import type { RecoveryDay } from "../models";

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

function inferSleepQuality(hours: number | null): number {
  if (hours == null || hours <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(hours * 10)));
}

function inferReadinessScore(fatigueScore: number | null): number {
  if (fatigueScore == null) {
    return 0;
  }
  return Math.max(0, Math.min(100, 100 - fatigueScore));
}

function inferReadinessLabel(score: number): "poor" | "fair" | "good" | "excellent" {
  if (score >= 80) return "excellent";
  if (score >= 65) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

function inferSleepLabel(
  label: string | null,
): "poor" | "fair" | "good" | "excellent" {
  if (label === "poor" || label === "fair" || label === "good" || label === "excellent") {
    return label;
  }
  return "fair";
}

function buildEmptyDashboard(day: RecoveryDay): RecoveryDashboardDto {
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

export interface MapWorkspaceRecoveryToExperienceDtoInput {
  readonly recovery: WorkspaceRecovery;
  readonly day: RecoveryDay;
  readonly sleepHours?: number;
  readonly sleepQuality?: number;
  readonly sleepLogged?: boolean;
  readonly readinessScore?: number;
  readonly assessedScore?: number;
}

/** Maps hydrated Unified Workspace recovery into the Recovery Experience DTO. */
export function mapWorkspaceRecoveryToExperienceDto(
  input: MapWorkspaceRecoveryToExperienceDtoInput,
): RecoveryDashboardDto {
  const { recovery, day } = input;

  if (!recovery.present) {
    return buildEmptyDashboard(day);
  }

  const sleepHours = input.sleepHours ?? recovery.sleepHours ?? 0;
  const sleepQuality =
    input.sleepQuality ?? inferSleepQuality(recovery.sleepHours);
  const readinessScore =
    input.readinessScore ??
    inferReadinessScore(recovery.fatigueScore);
  const recoveryScore =
    input.assessedScore ??
    recovery.fatigueScore ??
    readinessScore;
  const status = recovery.status?.trim() || "unknown";

  return Object.freeze({
    day,
    availableDays: buildAvailableDays(day),
    headline: `${recoveryScore}% recovery`,
    summary: recovery.summary,
    todaysGoal:
      sleepHours > 0
        ? "Protect sleep quality and keep training load manageable today."
        : "Log sleep to establish today's recovery baseline.",
    recoveryScore,
    status,
    sleep: Object.freeze({
      hours: sleepHours,
      quality: sleepQuality,
      label: inferSleepLabel(recovery.sleepLabel),
      logged: input.sleepLogged ?? sleepHours > 0,
      destination: "/(app)/recovery/history",
    }),
    readiness: Object.freeze({
      score: readinessScore,
      label: inferReadinessLabel(readinessScore),
      destination: "/(app)/recovery/readiness",
    }),
    signals: Object.freeze(
      recovery.signalSummaries.map((summary, index) =>
        Object.freeze({
          id: `signal-${index}`,
          summary,
        }),
      ),
    ),
    assessmentAvailable: recovery.present,
    historyDestination: "/(app)/recovery/history",
  });
}
