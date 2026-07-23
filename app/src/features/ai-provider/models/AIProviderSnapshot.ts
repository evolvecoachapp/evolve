import type { AIProvider } from "./AIProvider";
import type { AIProviderFeatures } from "./AIProviderFeatures";
import type { AIProviderStatistics } from "./AIProviderStatistics";

/**
 * Immutable point-in-time snapshot of a provider descriptor.
 */
export interface AIProviderSnapshot {
  readonly id: string;
  readonly provider: AIProvider;
  readonly features: AIProviderFeatures;
  readonly statistics: AIProviderStatistics;
  readonly capturedAt: string;
}
