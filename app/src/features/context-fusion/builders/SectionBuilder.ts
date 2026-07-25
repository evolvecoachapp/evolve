import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import type { ContextSection } from "../models/ContextSection";
import { ContextSectionKinds } from "../models/ContextSection";
import type { ContextSlice } from "../models/ContextSlice";
import type { ContextSourceKind } from "../models/ContextSource";
import { freezeSection } from "../utils/FreezeContext";

const KIND_MAP: Record<ContextSourceKind, ContextSection["kind"]> = {
  conversation: ContextSectionKinds.CONVERSATION,
  session: ContextSectionKinds.SESSION,
  athlete: ContextSectionKinds.ATHLETE,
  workout: ContextSectionKinds.WORKOUT,
  nutrition: ContextSectionKinds.NUTRITION,
  recovery: ContextSectionKinds.RECOVERY,
  goal: ContextSectionKinds.GOAL,
  supervisor: ContextSectionKinds.SUPERVISOR,
};

export function buildSectionFromSlice(input: {
  readonly slice: ContextSlice;
  readonly sourceId: string;
}): ContextSection {
  return freezeSection({
    id: `section:${input.slice.sourceKind}:${input.slice.id}`,
    kind: KIND_MAP[input.slice.sourceKind],
    sourceKind: input.slice.sourceKind,
    sourceId: input.sourceId,
    title: input.slice.label,
    facts: input.slice.facts,
    notes: input.slice.notes,
    metadata: input.slice.metadata ?? EMPTY_CONTEXT_METADATA,
  });
}

export function buildSectionsFromContext(input: {
  readonly slices: readonly (ContextSlice | null)[];
  readonly sourceIdFor: (kind: ContextSourceKind) => string;
}): readonly ContextSection[] {
  const sections: ContextSection[] = [];
  for (const slice of input.slices) {
    if (!slice) continue;
    sections.push(
      buildSectionFromSlice({
        slice,
        sourceId: input.sourceIdFor(slice.sourceKind),
      }),
    );
  }
  return Object.freeze(sections);
}
