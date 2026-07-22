/**
 * Detect duplicate exercise ids in a list.
 * Returns sorted unique duplicate ids.
 */
export function detectDuplicateIds(
  ids: readonly string[],
): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    } else {
      seen.add(id);
    }
  }
  return Object.freeze([...duplicates].sort());
}

/**
 * Deduplicate by id, keeping first occurrence (deterministic if input is sorted).
 */
export function dedupeById<T extends { readonly id: string }>(
  items: readonly T[],
): readonly T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    result.push(item);
  }
  return Object.freeze(result);
}
