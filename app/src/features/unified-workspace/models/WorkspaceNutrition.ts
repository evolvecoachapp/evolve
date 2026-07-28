import type {
  HomeNutritionCard,
  HomeNutritionMacros,
} from "../../home-experience/models/HomeNutritionCard";

/**
 * Immutable nutrition projection from Home / Daily / Weekly nutrition artifacts.
 */
export interface WorkspaceNutrition {
  readonly athleteId: string;
  readonly present: boolean;
  readonly card: HomeNutritionCard | null;
  readonly planId: string | null;
  readonly macros: HomeNutritionMacros | null;
  readonly phaseHint: string | null;
  readonly summary: string;
}
