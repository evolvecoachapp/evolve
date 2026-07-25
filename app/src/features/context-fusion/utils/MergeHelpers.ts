import type { ContextConflict } from "../models/ContextConflict";
import { ContextConflictKinds } from "../models/ContextConflict";
import type { ContextSlice } from "../models/ContextSlice";
import type { ContextSourceKind } from "../models/ContextSource";

export function detectFieldConflicts(input: {
  readonly path: string;
  readonly a: ContextSlice | null;
  readonly b: ContextSlice | null;
  readonly aKind: ContextSourceKind;
  readonly bKind: ContextSourceKind;
}): ContextConflict | null {
  if (!input.a || !input.b) return null;
  const keys = new Set([
    ...Object.keys(input.a.facts),
    ...Object.keys(input.b.facts),
  ]);
  for (const key of keys) {
    const av = input.a.facts[key];
    const bv = input.b.facts[key];
    if (av === undefined || bv === undefined) continue;
    if (String(av) !== String(bv)) {
      return Object.freeze({
        id: `conflict:${input.path}:${key}`,
        kind: ContextConflictKinds.FIELD,
        path: `${input.path}.${key}`,
        sources: Object.freeze([input.aKind, input.bKind]),
        values: Object.freeze([String(av), String(bv)]),
        notes: Object.freeze([`Field mismatch on ${key}`]),
      });
    }
  }
  return null;
}

export function overlayFacts(
  base: Readonly<Record<string, string | number | boolean | null>>,
  overlay: Readonly<Record<string, string | number | boolean | null>>,
): Readonly<Record<string, string | number | boolean | null>> {
  return Object.freeze({ ...base, ...overlay });
}
