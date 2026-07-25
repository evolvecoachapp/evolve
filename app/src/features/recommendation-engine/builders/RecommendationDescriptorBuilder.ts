import type { RecommendationDescriptor } from "../models/RecommendationDescriptor";
import { freezeDescriptor } from "../utils/FreezeRecommendationState";

export function buildRecommendationDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): RecommendationDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Recommendation Engine",
    version: "0.6.0",
    capabilities: Object.freeze([
      "buildRecommendations",
      "prioritizeRecommendations",
      "packageRecommendations",
      "describeRecommendations",
      "validateRecommendations",
    ]),
    boundaries: Object.freeze([
      "no_ai",
      "no_nl",
      "no_action_execution",
      "no_domain_calculations",
      "no_persistence",
      "no_networking",
      "no_openai_sdk",
      "no_prompt_builder",
      "no_tool_runtime",
    ]),
    createdAt: input.createdAt,
  });
}
