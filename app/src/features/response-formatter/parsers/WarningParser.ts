import type { CoachSection } from "../models/CoachSection";
import { CoachSectionKinds } from "../models/CoachSection";
import type { CoachWarning } from "../models/CoachWarning";
import { SeverityClassifier } from "../classifiers/SeverityClassifier";
import { freezeWarning } from "../utils/freezeObjects";
import { slugId, stripBulletPrefix } from "../utils/formattingHelpers";
import {
  extractBulletLines,
  findSectionContent,
} from "./sectionHelpers";

/**
 * Parse warnings from dedicated sections.
 */
export class WarningParser {
  constructor(private readonly severityClassifier = new SeverityClassifier()) {}

  parse(sections: readonly CoachSection[]): readonly CoachWarning[] {
    const content =
      findSectionContent(sections, CoachSectionKinds.WARNINGS) ?? "";
    if (!content.trim()) {
      return Object.freeze([]);
    }

    return Object.freeze(
      extractBulletLines(content).map((line, index) => {
        const text = stripBulletPrefix(line);
        return freezeWarning({
          id: slugId("warning", index),
          text,
          severity: this.severityClassifier.classify(text),
          code: null,
        });
      }),
    );
  }
}

export const warningParser = new WarningParser();
