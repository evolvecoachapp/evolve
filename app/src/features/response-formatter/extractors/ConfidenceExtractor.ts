import type { CoachConfidence } from "../models/CoachConfidence";
import type { CoachSection } from "../models/CoachSection";
import { CoachSectionKinds } from "../models/CoachSection";
import { ConfidenceClassifier } from "../classifiers/ConfidenceClassifier";
import { findSectionContent } from "../parsers/sectionHelpers";

/**
 * Extract confidence from sections or raw content markers.
 */
export class ConfidenceExtractor {
  constructor(
    private readonly classifier = new ConfidenceClassifier(),
  ) {}

  extract(
    sections: readonly CoachSection[],
    rawContent: string,
  ): CoachConfidence {
    const fromSection = findSectionContent(
      sections,
      CoachSectionKinds.CONFIDENCE,
    );
    if (fromSection?.trim()) {
      return this.classifier.classify(fromSection);
    }

    const marker = rawContent.match(
      /(?:^|\n)\s*confidence\s*:\s*([^\n]+)/i,
    );
    if (marker) {
      return this.classifier.classify(marker[1]);
    }

    return this.classifier.classify(null);
  }
}

export const confidenceExtractor = new ConfidenceExtractor();
