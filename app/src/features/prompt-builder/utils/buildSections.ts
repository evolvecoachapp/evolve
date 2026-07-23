import type { PromptSection } from "../models/coach/PromptSection";
import type { PromptSectionId } from "../models/coach/PromptSection";

/** Canonical section order for every prompt context. */
export const PROMPT_SECTION_IDS: readonly PromptSectionId[] = Object.freeze([
  "athlete",
  "training_summary",
  "volume_trend",
  "frequency_trend",
  "personal_records",
  "risk_flags",
  "recommendations",
  "metadata",
]);

/** Build the full ordered section list with all sections included. */
export function buildSections(): readonly PromptSection[] {
  return Object.freeze(
    PROMPT_SECTION_IDS.map((id) =>
      Object.freeze({ id, included: true as const }),
    ),
  );
}
