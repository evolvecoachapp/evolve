import type { CoachFormatting } from "../models/CoachFormatting";
import { DEFAULT_COACH_FORMATTING } from "../models/CoachFormatting";
import { freezeFormatting } from "../utils/freezeObjects";

/**
 * Normalize formatting hints with defaults.
 */
export class FormattingNormalizer {
  normalize(formatting?: Partial<CoachFormatting> | null): CoachFormatting {
    return freezeFormatting({
      preferredFormat:
        formatting?.preferredFormat ??
        DEFAULT_COACH_FORMATTING.preferredFormat,
      includeSections:
        formatting?.includeSections ??
        DEFAULT_COACH_FORMATTING.includeSections,
      includeCitations:
        formatting?.includeCitations ??
        DEFAULT_COACH_FORMATTING.includeCitations,
      includeActions:
        formatting?.includeActions ?? DEFAULT_COACH_FORMATTING.includeActions,
      tone: formatting?.tone ?? DEFAULT_COACH_FORMATTING.tone,
    });
  }
}

export const formattingNormalizer = new FormattingNormalizer();
