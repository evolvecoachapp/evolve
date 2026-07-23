import type { ToolCapability } from "./ToolCapability";
import type { ToolCategory } from "./ToolCategory";

/** Lightweight immutable catalog descriptor for a registered tool. */
export interface ToolDescriptor {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ToolCategory;
  readonly capabilities: readonly ToolCapability[];
}
