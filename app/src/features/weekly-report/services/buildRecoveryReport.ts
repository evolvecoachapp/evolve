import type { SleepProfile } from "../../recovery-agent/models/SleepProfile";
import type { RecoveryMetrics } from "../../recovery-intelligence/models/RecoveryMetrics";
import type { WeeklyRecoveryReport } from "../models/WeeklyRecoveryReport";

export interface BuildRecoveryReportInput {
  readonly recoveryMetrics?: RecoveryMetrics | null;
  readonly sleepProfile?: SleepProfile | null;
  readonly recoveryNotes?: readonly string[];
  readonly fatigueTrend?: string | null;
  readonly sleepTrend?: string | null;
  readonly recoveryTrend?: string | null;
}

/**
 * Compose Weekly Coach Report recovery section from Recovery Engine + sleep.
 * No duplicated recovery logic.
 */
export function buildRecoveryReport(
  input: BuildRecoveryReportInput = {},
): WeeklyRecoveryReport {
  const metrics = input.recoveryMetrics ?? null;
  const sleep = input.sleepProfile ?? null;
  const notes = input.recoveryNotes ?? Object.freeze([]);

  if (!metrics && !sleep && notes.length === 0) {
    return Object.freeze({
      present: false,
      status: null,
      fatigueScore: null,
      sleepLabel: null,
      sleepHours: null,
      fatigueTrend: null,
      sleepTrend: null,
      recoveryTrend: null,
      signalSummaries: Object.freeze([]),
      summary: "No recovery signals this week.",
    });
  }

  const fatigueTrend =
    input.fatigueTrend ??
    (metrics ? `Fatigue ${metrics.fatigue.score}` : null);
  const sleepTrend =
    input.sleepTrend ??
    (sleep ? `Sleep ${sleep.hours}h (${sleep.label})` : null);
  const recoveryTrend =
    input.recoveryTrend ??
    (metrics ? `Recovery ${metrics.status.label}` : null);

  const signalSummaries: string[] = [];
  if (metrics) {
    signalSummaries.push(
      `Fatigue ${metrics.fatigue.score} · ${metrics.status.label}`,
    );
  }
  if (sleep) {
    signalSummaries.push(`Sleep ${sleep.hours}h (${sleep.label})`);
  }
  if (fatigueTrend) signalSummaries.push(`Fatigue trend: ${fatigueTrend}`);
  if (sleepTrend) signalSummaries.push(`Sleep trend: ${sleepTrend}`);
  if (recoveryTrend) signalSummaries.push(`Recovery trend: ${recoveryTrend}`);
  for (const note of notes) {
    if (note) signalSummaries.push(note);
  }

  return Object.freeze({
    present: true,
    status: metrics?.status.level ?? null,
    fatigueScore: metrics?.fatigue.score ?? null,
    sleepLabel: sleep?.label ?? null,
    sleepHours: sleep?.hours ?? null,
    fatigueTrend,
    sleepTrend,
    recoveryTrend,
    signalSummaries: Object.freeze(signalSummaries),
    summary:
      signalSummaries.length > 0
        ? signalSummaries.join(" · ")
        : "Recovery signals available.",
  });
}
