import type { HomeExperience } from "../../home-experience/models/HomeExperience";

/**
 * Home Experience projection with no transformation.
 */
export interface WorkspaceHome {
  readonly present: boolean;
  readonly experience: HomeExperience | null;
}
