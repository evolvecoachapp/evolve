import type { ToolCapability } from "./ToolCapability";
import type { ToolCategory } from "./ToolCategory";
import type { ToolDescriptor } from "./ToolDescriptor";

/** Immutable snapshot of registry contents. */
export interface ToolRegistrySnapshot {
  readonly toolCount: number;
  readonly frozen: boolean;
  readonly descriptors: readonly ToolDescriptor[];
  readonly categories: readonly ToolCategory[];
  readonly capabilities: readonly ToolCapability[];
  readonly capturedAt: string;
}
