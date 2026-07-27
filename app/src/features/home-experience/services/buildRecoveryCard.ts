import type { SleepProfile } from "../../recovery-agent/models/SleepProfile";
import type { RecoveryMetrics } from "../../recovery-intelligence/models/RecoveryMetrics";
import type { HomeRecoveryCard } from "../models/HomeRecoveryCard";

export interface BuildRecoveryCardInput {
  readonly recoveryMetrics?: RecoveryMetrics | null;
  readonly sleepProfile?: SleepProfile | null;
  readonly recoveryNotes?: readonly string[];
}

/**
 * Compose Home recovery card from Recovery Engine + sleep signals.
 * No duplicated recovery logic.
 */
export function buildRecoveryCard(
  input: BuildRecoveryCardInput = {},
): HomeRecoveryCard {
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
      signalSummaries: Object.freeze([]),
      summary: "No recovery signals.",
    });
  }

  const signalSummaries: string[] = [];
  if (metrics) {
    signalSummaries.push(
      `Fatigue ${metrics.fatigue.score} · ${metrics.status.label}`,
    );
  }
  if (sleep) {
    signalSummaries.push(`Sleep ${sleep.hours}h (${sleep.label})`);
  }
  for (const note of notes) {
    if (note) signalSummaries.push(note);
  }

  return Object.freeze({
    present: true,
    status: metrics?.status.level ?? null,
    fatigueScore: metrics?.fatigue.score ?? null,
    sleepLabel: sleep?.label ?? null,
    sleepHours: sleep?.hours ?? null,
    signalSummaries: Object.freeze(signalSummaries),
    summary:
      signalSummaries.length > 0
        ? signalSummaries.join(" · ")
        : "Recovery signals available.",
  });
}
