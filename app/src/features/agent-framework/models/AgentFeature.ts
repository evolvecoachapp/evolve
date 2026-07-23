/**
 * Immutable named feature flag on an agent package / descriptor.
 */
export interface AgentFeature {
  readonly id: string;
  readonly name: string;
  readonly enabled: boolean;
  readonly description: string;
}
