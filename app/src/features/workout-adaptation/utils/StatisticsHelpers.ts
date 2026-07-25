import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import type { WorkoutStatistics } from "../models/WorkoutStatistics";

export function buildStatistics(adaptation: WorkoutAdaptation | null): WorkoutStatistics {
  if (!adaptation) {
    return Object.freeze({
      modificationCount: 0,
      adjustmentCount: 0,
      replacementCount: 0,
      decisionKeyCount: 0,
      exerciseKeyCount: 0,
      sessionKeyCount: 0,
    });
  }
  return Object.freeze({
    modificationCount: adaptation.modifications.length,
    adjustmentCount:
      adaptation.adjustments.length +
      adaptation.exerciseAdjustments.length +
      adaptation.setAdjustments.length +
      adaptation.repAdjustments.length +
      adaptation.loadAdjustments.length +
      adaptation.volumeAdjustments.length +
      adaptation.restAdjustments.length +
      adaptation.tempoAdjustments.length +
      adaptation.frequencyAdjustments.length +
      adaptation.weeklyAdjustments.length +
      adaptation.sessionAdjustments.length,
    replacementCount:
      adaptation.replacements.length + adaptation.exerciseReplacements.length,
    decisionKeyCount: adaptation.decisionKeys.length,
    exerciseKeyCount: adaptation.exerciseAdjustments.length,
    sessionKeyCount: adaptation.sessionAdjustments.length,
  });
}
