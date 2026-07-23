import type { PromptContext } from "../models/coach/PromptContext";
import type { PromptSectionId } from "../models/coach/PromptSection";
import { PROMPT_SCHEMA_VERSION } from "./buildMetadata";
import { PROMPT_SECTION_IDS } from "./buildSections";

/** Structured validation issue codes — never prose. */
export type PromptValidationCode =
  | "invalid_consistency_score"
  | "missing_athlete_profile"
  | "invalid_schema_version"
  | "metadata_count_mismatch"
  | "missing_required_section"
  | "section_order_mismatch"
  | "empty_sections";

/**
 * Validate structural integrity of a PromptContext.
 *
 * Returns frozen issue codes; an empty array means the context is valid.
 */
export function validatePromptContext(
  context: PromptContext,
): readonly PromptValidationCode[] {
  const issues: PromptValidationCode[] = [];

  if (
    context.athlete.consistencyScore < 0 ||
    context.athlete.consistencyScore > 1
  ) {
    issues.push("invalid_consistency_score");
  }

  if (
    context.profile == null ||
    typeof context.profile.id !== "string" ||
    context.profile.id.trim().length === 0
  ) {
    issues.push("missing_athlete_profile");
  }

  if (context.metadata.schemaVersion !== PROMPT_SCHEMA_VERSION) {
    issues.push("invalid_schema_version");
  }

  if (
    context.metadata.insightCount !== context.coach.insights.length ||
    context.metadata.riskCount !== context.coach.riskFlags.length ||
    context.metadata.recommendationCount !==
      context.coach.recommendations.length
  ) {
    issues.push("metadata_count_mismatch");
  }

  if (context.sections.length === 0) {
    issues.push("empty_sections");
  } else {
    const required = new Set<PromptSectionId>(PROMPT_SECTION_IDS);
    const present = new Set<PromptSectionId>();

    for (const section of context.sections) {
      if (section.included) {
        present.add(section.id);
      }
    }

    for (const id of required) {
      if (!present.has(id)) {
        issues.push("missing_required_section");
        break;
      }
    }

    const orderedIds = context.sections.map((section) => section.id);
    const expectedIds = [...PROMPT_SECTION_IDS];
    if (
      orderedIds.length !== expectedIds.length ||
      orderedIds.some((id, index) => id !== expectedIds[index])
    ) {
      issues.push("section_order_mismatch");
    }
  }

  return Object.freeze(issues);
}
