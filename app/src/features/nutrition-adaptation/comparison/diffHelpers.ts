export interface KeyDiff {
  readonly added: readonly string[];
  readonly removed: readonly string[];
  readonly shared: readonly string[];
}

export function diffKeys(
  before: readonly string[],
  after: readonly string[],
): KeyDiff {
  const a = new Set(before);
  const b = new Set(after);
  const added: string[] = [];
  const removed: string[] = [];
  const shared: string[] = [];
  for (const k of b) {
    if (a.has(k)) shared.push(k);
    else added.push(k);
  }
  for (const k of a) {
    if (!b.has(k)) removed.push(k);
  }
  return Object.freeze({
    added: Object.freeze(added.sort()),
    removed: Object.freeze(removed.sort()),
    shared: Object.freeze(shared.sort()),
  });
}
