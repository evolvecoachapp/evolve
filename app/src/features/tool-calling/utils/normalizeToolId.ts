/**
 * Normalize a tool id for registry lookups.
 * Lowercase, trim, collapse whitespace / hyphens to underscores.
 */
export function normalizeToolId(toolId: string): string {
  return toolId
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_");
}
