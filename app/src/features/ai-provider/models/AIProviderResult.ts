import type { AIExecutionContext } from "./AIExecutionContext";
import type { AIProvider } from "./AIProvider";
import type { AIRequest } from "./AIRequest";
import type { AIResponse } from "./AIResponse";

/**
 * Frozen orchestration result from AI Provider Abstraction.
 *
 * Carries prepared request + resolved provider contract + context.
 * Does not execute providers or contain live network responses unless
 * a future sprint fills `response`.
 */
export interface AIProviderResult {
  readonly request: AIRequest;
  readonly provider: AIProvider | null;
  readonly context: AIExecutionContext | null;
  readonly response: AIResponse | null;
  readonly validationIssues: readonly string[];
  readonly preparedAt: string;
}
