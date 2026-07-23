import type { CoachSection } from "../models/CoachSection";
import { parseSections } from "../parsers/sectionHelpers";

/**
 * Extract structured sections from raw content.
 */
export class SectionExtractor {
  extract(rawContent: string): readonly CoachSection[] {
    return parseSections(rawContent);
  }
}

export const sectionExtractor = new SectionExtractor();
