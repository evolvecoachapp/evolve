import type { CoachSummary } from "../../coach-intelligence/models/CoachSummary";
import type { TrainingContext } from "../models/TrainingContext";

/** Build training trend context from a coach summary. */
export function buildTrainingContext(summary: CoachSummary): TrainingContext {
  return Object.freeze({
    volumeTrend: summary.volumeTrend,
    frequencyTrend: summary.frequencyTrend,
  });
}
