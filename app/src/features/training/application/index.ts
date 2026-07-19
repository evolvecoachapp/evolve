/**
 * Application layer for the `training` feature.
 *
 * Thin orchestration only: maps athlete inputs onto Training Engine
 * contracts and returns engine output. No planning algorithms live here.
 */
export type { AthleteProfile } from "./AthleteProfile";
export { TrainingGenerationService } from "./TrainingGenerationService";
