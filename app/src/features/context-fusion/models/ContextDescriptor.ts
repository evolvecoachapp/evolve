import type { ContextMetadata } from "./ContextMetadata";

/**
 * Immutable capability descriptor for Context Fusion Engine.
 */
export interface ContextDescriptor {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly sourceKinds: readonly string[];
  readonly metadata: ContextMetadata;
  readonly createdAt: string;
}
