import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { WorkspaceHome } from "../models/WorkspaceHome";

export interface BuildHomeProjectionInput {
  readonly homeExperience?: HomeExperience | null;
}

/**
 * Projects Home Experience with no transformation.
 */
export function buildHomeProjection(
  input: BuildHomeProjectionInput,
): WorkspaceHome {
  return Object.freeze({
    present: input.homeExperience != null,
    experience: input.homeExperience ?? null,
  });
}
