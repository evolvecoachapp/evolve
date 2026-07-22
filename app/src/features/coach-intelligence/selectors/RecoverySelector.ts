import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";
import type { CoachConstraint } from "../models/CoachConstraint";
import { freezeConstraint } from "../utils/freezeContext";

export interface RecoverySelection {
  readonly referenced: boolean;
  readonly constraints: readonly CoachConstraint[];
  readonly missing: boolean;
}

/**
 * Selects recovery-derived constraints when a RecoverySnapshot is present.
 * One responsibility: recovery constraint selection only.
 */
export class RecoverySelector {
  select(recoverySnapshot?: RecoverySnapshot): RecoverySelection {
    if (!recoverySnapshot) {
      return Object.freeze({
        referenced: false,
        constraints: Object.freeze([] as CoachConstraint[]),
        missing: true,
      });
    }

    const statusLevel = recoverySnapshot.assessment.status.level;
    const fatigueScore =
      recoverySnapshot.assessment.status.score ??
      recoverySnapshot.metrics.fatigue?.score ??
      null;

    const elevated =
      statusLevel === "elevated" || statusLevel === "high";

    const constraint = freezeConstraint({
      id: `coach-constraint:recovery:${recoverySnapshot.id}`,
      code: "recovery_status",
      statement: `Recovery status level is ${statusLevel}.`,
      sourceType: "RecoverySnapshot",
      sourceId: recoverySnapshot.id,
      priority: elevated ? 85 : 60,
      reason: Object.freeze({
        code: "recovery_reference",
        statement: "Derived from RecoverySnapshot assessment",
        attributes: Object.freeze({
          statusLevel,
          fatigueScore,
        }),
      }),
    });

    return Object.freeze({
      referenced: true,
      constraints: Object.freeze([constraint]),
      missing: false,
    });
  }
}

export function createRecoverySelector(): RecoverySelector {
  return new RecoverySelector();
}
