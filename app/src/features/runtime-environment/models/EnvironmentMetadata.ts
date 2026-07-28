/**
 * Immutable metadata for Runtime Environment (Sprint 29.2).
 */
export interface EnvironmentMetadata {
  readonly generatedAt: string;
  readonly version: string;
  readonly runtimeId: string;
  readonly schemaVersion: string;
}
