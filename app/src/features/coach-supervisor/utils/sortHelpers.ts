/** Deterministic lexicographic sort for string ids. */
export function sortIdsDeterministic(ids: readonly string[]): readonly string[] {
  return Object.freeze([...ids].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
}

/** Stable sort by orderIndex then id. */
export function sortByOrderIndex<T extends { readonly orderIndex: number; readonly id: string }>(
  items: readonly T[],
): readonly T[] {
  return Object.freeze(
    [...items].sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    }),
  );
}
