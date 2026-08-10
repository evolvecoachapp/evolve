import { buildRecoveryPlan } from "../../recovery-agent/application";
import { RecoveryGoals } from "../../recovery-agent/models/RecoveryGoal";
import { RecoveryIntents } from "../../recovery-agent/models/RecoveryIntent";
import { EMPTY_RECOVERY_AGENT_METADATA } from "../../recovery-agent/models/RecoveryMetadata";
import type { RecoveryAssessment } from "../../recovery-agent/models/RecoveryAssessment";
import type { RecoveryDashboard } from "../models";

export interface AssessRuntimeRecoveryInput {
  readonly dashboard: RecoveryDashboard;
  readonly athleteId: string;
  readonly assessedAt: string;
}

export interface AssessRuntimeRecoveryResult {
  readonly dashboard: RecoveryDashboard;
  readonly assessment: RecoveryAssessment;
}

/** Runs recovery assessment through existing Recovery Agent application API. */
export function assessRuntimeRecovery(
  input: AssessRuntimeRecoveryInput,
): AssessRuntimeRecoveryResult {
  const plan = buildRecoveryPlan({
    request: {
      id: `rreq:runtime:${input.dashboard.day.isoDate}`,
      athleteId: input.athleteId,
      conversationId: null,
      message: "Assess current recovery state",
      intentHint: RecoveryIntents.ASSESS_RECOVERY,
      goalHint: RecoveryGoals.FATIGUE_MANAGEMENT,
      sleepHours: input.dashboard.sleep.hours,
      sleepQuality: input.dashboard.sleep.quality,
      stressLevel: 50,
      fatigueLevel: Math.max(0, 100 - input.dashboard.recoveryScore),
      sorenessLevel: 40,
      hrvScore: input.dashboard.readiness.score,
      readinessHint: input.dashboard.readiness.score,
      trainingLoadHint: 60,
      constraints: Object.freeze([]),
      metadata: EMPTY_RECOVERY_AGENT_METADATA,
      createdAt: input.assessedAt,
    },
  });

  const assessment = plan.assessment;
  const recoveryScore = assessment.recoveryScore.score;

  const dashboard = Object.freeze({
    ...input.dashboard,
    headline: `${recoveryScore}% recovery`,
    summary: assessment.summary,
    recoveryScore,
    status: assessment.readiness.label,
    sleep: Object.freeze({
      ...input.dashboard.sleep,
      hours: assessment.sleep.hours,
      quality: assessment.sleep.quality,
      label: assessment.sleep.label,
      logged: true,
    }),
    readiness: Object.freeze({
      ...input.dashboard.readiness,
      score: assessment.readiness.score,
      label: assessment.readiness.label,
    }),
  });

  return Object.freeze({ dashboard, assessment });
}
