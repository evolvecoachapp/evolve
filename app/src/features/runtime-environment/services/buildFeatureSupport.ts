import type { FeatureSupport } from "../models/FeatureSupport";

export interface BuildFeatureSupportInput {
  readonly featureKeys?: readonly string[];
}

/**
 * Builds immutable FeatureSupport descriptors.
 */
export function buildFeatureSupport(
  input: BuildFeatureSupportInput = {},
): FeatureSupport {
  return Object.freeze({
    featureKeys: Object.freeze(
      [...(input.featureKeys ?? [])]
        .map((key) => key.trim())
        .filter((key) => key.length > 0),
    ),
  });
}
