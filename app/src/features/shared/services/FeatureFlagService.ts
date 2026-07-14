import type { FeatureFlagKey, FeatureFlags } from "../models";

/** Remote feature toggle contract — implementations supply flag values at runtime. */
export interface FeatureFlagService {
  getFlags(): FeatureFlags;

  isEnabled(flag: FeatureFlagKey): boolean;
}

export class FeatureFlagServiceError extends Error {
  constructor(
    message: string,
    readonly flag?: FeatureFlagKey,
  ) {
    super(message);
    this.name = "FeatureFlagServiceError";
  }
}
