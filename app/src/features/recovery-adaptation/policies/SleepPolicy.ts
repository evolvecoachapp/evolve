import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import type { RecoveryError } from "../models/RecoveryError";

export function applySleepPolicy(
  adaptation: RecoveryAdaptation | null,
): readonly RecoveryError[] {
  void adaptation;
  return Object.freeze([] as RecoveryError[]);
}
