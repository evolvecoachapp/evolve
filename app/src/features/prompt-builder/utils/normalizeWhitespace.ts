/**
 * Normalize whitespace in composition statements.
 * Collapses runs of whitespace and trims ends. Deterministic only.
 */
export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Normalize whitespace across a list of statements.
 */
export function normalizeStatements(
  statements: readonly string[],
): readonly string[] {
  return Object.freeze(statements.map(normalizeWhitespace));
}
