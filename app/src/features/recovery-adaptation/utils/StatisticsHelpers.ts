import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import type { RecoveryStatistics } from "../models/RecoveryStatistics";

export function buildStatistics(adaptation: RecoveryAdaptation | null): RecoveryStatistics {
  if (!adaptation) {
    return Object.freeze({
      modificationCount: 0,
      adjustmentCount: 0,
      replacementCount: 0,
      decisionKeyCount: 0,
      dayKeyCount: 0,
      readinessKeyCount: 0,
    });
  }
  return Object.freeze({
    modificationCount: adaptation.modifications.length,
    adjustmentCount:
      adaptation.adjustments.length +
      adaptation.recoveryDayAdjustments.length +
      adaptation.sleepAdjustments.length +
      adaptation.fatigueAdjustments.length +
      adaptation.readinessAdjustments.length +
      adaptation.hrvAdjustments.length +
      adaptation.cardioAdjustments.length +
      adaptation.stressAdjustments.length +
      adaptation.mobilityAdjustments.length +
      adaptation.stretchingAdjustments.length +
      adaptation.deloadAdjustments.length +
      adaptation.recoveryProtocolAdjustments.length +
      adaptation.readinessAdjustments.length +
      adaptation.weeklyAdjustments.length,
    replacementCount:
      adaptation.replacements.length + adaptation.recoveryDayReplacements.length,
    decisionKeyCount: adaptation.decisionKeys.length,
    dayKeyCount: adaptation.recoveryDayAdjustments.length,
    readinessKeyCount: adaptation.readinessAdjustments.length,
  });
}
