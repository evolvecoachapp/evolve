import type { ReadinessLabel } from "../../recovery-agent/models/ReadinessState";
import type { RecoveryDashboard } from "../models";
import { createReadinessProgress } from "../models";

function inferReadinessLabel(score: number): ReadinessLabel {
  if (score >= 80) return "excellent";
  if (score >= 65) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

export interface UpdateRuntimeReadinessInput {
  readonly dashboard: RecoveryDashboard;
  readonly score: number;
}

/** Updates readiness in a runtime-driven recovery dashboard. */
export function updateRuntimeReadiness(
  input: UpdateRuntimeReadinessInput,
): RecoveryDashboard {
  const score = Math.max(0, Math.min(100, Math.round(input.score)));
  const readiness = createReadinessProgress({
    ...input.dashboard.readiness,
    score,
    label: inferReadinessLabel(score),
  });

  return Object.freeze({
    ...input.dashboard,
    readiness,
    recoveryScore: Math.round((input.dashboard.recoveryScore + score) / 2),
  });
}
