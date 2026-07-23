import type { ToolExecutionContext } from "../../tool-calling/models/ToolExecutionContext";
import type { DomainToolDomain } from "./DomainToolDomain";

/**
 * Immutable adapter execution context.
 *
 * Carries tool-calling context plus adapter/domain identity.
 */
export interface AdapterContext {
  readonly adapterId: string;
  readonly domain: DomainToolDomain;
  readonly toolId: string;
  readonly executionContext: ToolExecutionContext;
  readonly now: string;
  readonly attributes: Readonly<Record<string, unknown>>;
}
