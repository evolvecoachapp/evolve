import type { RecoveryAssessment } from "../models/RecoveryAssessment";
import type { RecoveryEngineResult } from "../models/RecoveryEngineResult";
import type { RecoveryMetrics } from "../models/RecoveryMetrics";
import type { RecoverySnapshot } from "../models/RecoverySnapshot";
import type { RecoverySummary } from "../models/RecoverySummary";

function freezeMetrics(metrics: RecoveryMetrics): RecoveryMetrics {
  return Object.freeze({
    trainingLoad: Object.freeze({ ...metrics.trainingLoad }),
    fatigue: Object.freeze({ ...metrics.fatigue }),
    densityLoad: Object.freeze({ ...metrics.densityLoad }),
    frequencyLoad: Object.freeze({ ...metrics.frequencyLoad }),
    recoveryWindow: Object.freeze({ ...metrics.recoveryWindow }),
    status: Object.freeze({ ...metrics.status }),
  });
}

function freezeAssessment(
  assessment: RecoveryAssessment,
): RecoveryAssessment {
  return Object.freeze({
    ...assessment,
    status: Object.freeze({ ...assessment.status }),
    metrics: freezeMetrics(assessment.metrics),
    indicators: Object.freeze(
      assessment.indicators.map((indicator) =>
        Object.freeze({
          ...indicator,
          attributes: Object.freeze({ ...indicator.attributes }),
        }),
      ),
    ),
    evidence: Object.freeze({
      ...assessment.evidence,
      attributes: Object.freeze({ ...assessment.evidence.attributes }),
    }),
  });
}

export function freezeSummary(summary: RecoverySummary): RecoverySummary {
  return Object.freeze({ ...summary });
}

/**
 * Deep-freeze a recovery snapshot for immutability guarantees.
 */
export function freezeSnapshot(snapshot: RecoverySnapshot): RecoverySnapshot {
  return Object.freeze({
    ...snapshot,
    context: Object.freeze({ ...snapshot.context }),
    metrics: freezeMetrics(snapshot.metrics),
    assessment: freezeAssessment(snapshot.assessment),
    summary: freezeSummary(snapshot.summary),
  });
}

export function freezeEngineResult(
  result: RecoveryEngineResult,
): RecoveryEngineResult {
  return Object.freeze({
    snapshot: freezeSnapshot(result.snapshot),
    assessment: freezeAssessment(result.assessment),
    summary: freezeSummary(result.summary),
    validationIssues: Object.freeze([...result.validationIssues]),
  });
}
