/**
 * Immutable descriptor of a Tool Runtime instance configuration.
 */
export interface ToolRuntime {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly strategyId: string;
  readonly pipelineId: string;
  readonly adapterIds: readonly string[];
  readonly policyIds: readonly string[];
  readonly createdAt: string;
}
