/**
 * Deterministic lexicographic sort by id (ascending).
 * Never randomizes.
 */
export function sortByIdAsc<T extends { readonly id: string }>(
  items: readonly T[],
): readonly T[] {
  return Object.freeze(
    [...items].sort((left, right) => left.id.localeCompare(right.id)),
  );
}

/**
 * Deterministic sort: higher score first, then lower id.
 */
export function sortByScoreDescThenIdAsc<
  T extends { readonly score: { readonly total: number }; readonly id: string },
>(items: readonly T[]): readonly T[] {
  return Object.freeze(
    [...items].sort((left, right) => {
      if (right.score.total !== left.score.total) {
        return right.score.total - left.score.total;
      }
      return left.id.localeCompare(right.id);
    }),
  );
}

/**
 * Stable compare for candidates that expose exerciseId + score.
 */
export function compareCandidatesByScoreThenId(
  left: {
    readonly exerciseId: string;
    readonly score: { readonly total: number };
  },
  right: {
    readonly exerciseId: string;
    readonly score: { readonly total: number };
  },
): number {
  if (right.score.total !== left.score.total) {
    return right.score.total - left.score.total;
  }
  return left.exerciseId.localeCompare(right.exerciseId);
}
