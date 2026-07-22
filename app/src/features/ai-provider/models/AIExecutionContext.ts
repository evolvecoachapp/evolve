import type { AIExecutionOptions } from "./AIExecutionOptions";
import type { AIProvider } from "./AIProvider";
import type { AIProviderId } from "./AIProviderId";
import type { AIRequest } from "./AIRequest";

/**
 * Immutable execution context prepared for a resolved provider.
 *
 * Ready for a future provider call — this sprint never executes.
 */
export interface AIExecutionContext {
  readonly id: string;
  readonly requestId: string;
  readonly providerId: AIProviderId;
  readonly provider: AIProvider;
  readonly request: AIRequest;
  readonly options: AIExecutionOptions;
  readonly preparedAt: string;
  readonly validationIssues: readonly string[];
}
