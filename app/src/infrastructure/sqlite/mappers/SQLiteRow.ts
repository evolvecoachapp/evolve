/**
 * Opaque SQLite row shape used by mappers.
 * Infrastructure-only — Domain never sees this.
 */
export interface SQLiteRow {
  readonly id: string;
  readonly payload: string;
}

export function createSQLiteRow(input: {
  readonly id: string;
  readonly payload?: string;
}): SQLiteRow {
  return Object.freeze({
    id: input.id,
    payload: input.payload ?? "{}",
  });
}
