/**
 * Top-level execution policy flags.
 *
 * Streaming and tools remain reserved / disabled.
 */
export interface ExecutionPolicy {
  readonly allowStreaming: boolean;
  readonly allowTools: boolean;
  readonly requireProvider: boolean;
}
