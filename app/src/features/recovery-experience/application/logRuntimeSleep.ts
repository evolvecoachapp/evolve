import type { SleepLabel } from "../../recovery-agent/models/SleepProfile";
import type { RecoveryDashboard } from "../models";
import { createSleepState } from "../models";

function inferSleepLabel(hours: number, quality: number): SleepLabel {
  if (hours >= 8 && quality >= 80) return "excellent";
  if (hours >= 7 && quality >= 65) return "good";
  if (hours >= 6) return "fair";
  return "poor";
}

export interface LogRuntimeSleepInput {
  readonly dashboard: RecoveryDashboard;
  readonly hours: number;
}

/** Updates sleep state in a runtime-driven recovery dashboard. */
export function logRuntimeSleep(input: LogRuntimeSleepInput): RecoveryDashboard {
  if (input.hours <= 0) {
    return input.dashboard;
  }

  const quality = Math.max(0, Math.min(100, Math.round(input.hours * 10)));
  const sleep = createSleepState({
    ...input.dashboard.sleep,
    hours: input.hours,
    quality,
    label: inferSleepLabel(input.hours, quality),
    logged: true,
  });

  return Object.freeze({
    ...input.dashboard,
    headline: `${input.dashboard.recoveryScore}% recovery`,
    summary: `Sleep ${input.hours}h (${sleep.label}) · ${input.dashboard.summary}`,
    sleep,
  });
}
