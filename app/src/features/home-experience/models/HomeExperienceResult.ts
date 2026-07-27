import type { HomeExperience } from "./HomeExperience";
import type { HomeSummary } from "./HomeSummary";

export interface HomeExperienceValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Immutable result of building / querying a Home Experience.
 */
export interface HomeExperienceResult {
  readonly id: string;
  readonly success: boolean;
  readonly experience: HomeExperience | null;
  readonly summary: HomeSummary | null;
  readonly validation: HomeExperienceValidation;
  readonly message: string;
  readonly generatedAt: string;
}
