import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationType } from "./RecommendationType";

/**
 * Structured action descriptor — not executed here.
 */
export interface RecommendationAction {
  readonly id: string;
  readonly type: RecommendationType;
  readonly key: string;
  readonly targetKey: string | null;
  readonly parameters: Readonly<Record<string, string>>;
  readonly metadata: RecommendationMetadata;
}
