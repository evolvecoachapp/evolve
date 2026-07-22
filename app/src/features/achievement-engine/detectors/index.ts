export { isPersonalRecord } from "./compareBaseline";
export { CompletedSetsPRDetector } from "./CompletedSetsPRDetector";
export { DensityPRDetector } from "./DensityPRDetector";
export { ExerciseVolumeDetector } from "./ExerciseVolumeDetector";
export { RepetitionPRDetector } from "./RepetitionPRDetector";
export { SessionVolumeDetector } from "./SessionVolumeDetector";
export { TonnagePRDetector } from "./TonnagePRDetector";
export type {
  PersonalRecordDetectionInput,
  PersonalRecordDetector,
} from "./types";
export { VolumePRDetector } from "./VolumePRDetector";
export { WeightPRDetector } from "./WeightPRDetector";

import { CompletedSetsPRDetector } from "./CompletedSetsPRDetector";
import { DensityPRDetector } from "./DensityPRDetector";
import { ExerciseVolumeDetector } from "./ExerciseVolumeDetector";
import { RepetitionPRDetector } from "./RepetitionPRDetector";
import { SessionVolumeDetector } from "./SessionVolumeDetector";
import { TonnagePRDetector } from "./TonnagePRDetector";
import type { PersonalRecordDetector } from "./types";
import { VolumePRDetector } from "./VolumePRDetector";
import { WeightPRDetector } from "./WeightPRDetector";

/**
 * Default Personal Record detector set for Sprint 18.4.
 */
export function createDefaultPersonalRecordDetectors(): readonly PersonalRecordDetector[] {
  return Object.freeze([
    new WeightPRDetector(),
    new VolumePRDetector(),
    new TonnagePRDetector(),
    new RepetitionPRDetector(),
    new CompletedSetsPRDetector(),
    new DensityPRDetector(),
    new SessionVolumeDetector(),
    new ExerciseVolumeDetector(),
  ]);
}
