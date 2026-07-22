import type { InMemoryToolRegistry } from "../registry/InMemoryToolRegistry";
import type { ToolRegistry } from "../registry/ToolRegistry";
import { ToolError } from "../models/ToolError";

/**
 * Freeze a registry so no further tools can be registered.
 *
 * Accepts InMemoryToolRegistry (or any registry exposing freeze()).
 */
export function freezeToolRegistry(registry: ToolRegistry): ToolRegistry {
  if (typeof (registry as InMemoryToolRegistry).freeze === "function") {
    (registry as InMemoryToolRegistry).freeze();
    return registry;
  }

  throw new ToolError(
    "registry_not_freezable",
    "Tool registry does not support freeze().",
  );
}
