import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";
import type { AIProvider } from "../../ai-provider/models/AIProvider";
import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { AIExecutionLifecycle } from "./AIExecutionLifecycle";
import type { AIExecutionMetadata } from "./AIExecutionMetadata";
import type { AIExecutionPolicy } from "./AIExecutionPolicy";
import type { AIExecutionState } from "./AIExecutionState";

/**
 * Immutable pipeline execution context.
 *
 * Distinct from ai-provider's prepared AIExecutionContext — this tracks
 * pipeline lifecycle, policy, and stage progression.
 */
export interface AIExecutionContext {
  readonly id: string;
  readonly requestId: string;
  readonly providerId: AIProviderId;
  readonly promptPackageId: string;
  readonly modelId: string | null;
  readonly options: AIExecutionOptions;
  readonly state: AIExecutionState;
  readonly lifecycle: AIExecutionLifecycle;
  readonly policy: AIExecutionPolicy;
  readonly metadata: AIExecutionMetadata;
  readonly provider: AIProvider | null;
  readonly preparedAt: string;
  readonly validationIssues: readonly string[];
}
