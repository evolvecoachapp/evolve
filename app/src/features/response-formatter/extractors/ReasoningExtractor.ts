import type { CoachSection } from "../models/CoachSection";
import { CoachSectionKinds } from "../models/CoachSection";
import { findSectionContent } from "../parsers/sectionHelpers";

/**
 * Extract reasoning text from sections or inline markers.
 */
export class ReasoningExtractor {
  extract(
    sections: readonly CoachSection[],
    rawContent: string,
  ): string | null {
    const fromSection = findSectionContent(
      sections,
      CoachSectionKinds.REASONING,
    );
    if (fromSection?.trim()) {
      return fromSection.trim();
    }

    const marker = rawContent.match(
      /(?:^|\n)\s*(?:reasoning|rationale)\s*:\s*([^\n]+)/i,
    );
    return marker ? marker[1].trim() : null;
  }
}

export const reasoningExtractor = new ReasoningExtractor();
