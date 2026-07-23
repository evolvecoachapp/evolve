import type { CoachRecommendation } from "../models/CoachRecommendation";
import {
  CoachRecommendationCategories,
  CoachSeverities,
} from "../models/CoachRecommendation";
import type { CoachSection } from "../models/CoachSection";
import { CoachSectionKinds } from "../models/CoachSection";
import { RecommendationClassifier } from "../classifiers/RecommendationClassifier";
import { SeverityClassifier } from "../classifiers/SeverityClassifier";
import { freezeRecommendation } from "../utils/freezeObjects";
import { slugId, stripBulletPrefix } from "../utils/formattingHelpers";
import {
  extractBulletLines,
  findSectionContent,
} from "./sectionHelpers";

/**
 * Parse recommendations from dedicated sections.
 */
export class RecommendationParser {
  constructor(
    private readonly recommendationClassifier = new RecommendationClassifier(),
    private readonly severityClassifier = new SeverityClassifier(),
  ) {}

  parse(
    sections: readonly CoachSection[],
    fallbackLines: readonly string[] = [],
  ): readonly CoachRecommendation[] {
    const content =
      findSectionContent(sections, CoachSectionKinds.RECOMMENDATIONS) ?? "";
    const lines =
      content.trim().length > 0
        ? extractBulletLines(content)
        : fallbackLines;

    return Object.freeze(
      lines.map((line, index) => {
        const text = stripBulletPrefix(line);
        return freezeRecommendation({
          id: slugId("recommendation", index),
          text,
          category: this.recommendationClassifier.classify(text),
          priority: index + 1,
          severity: this.severityClassifier.classify(text),
        });
      }),
    );
  }

  parseLines(lines: readonly string[]): readonly CoachRecommendation[] {
    return Object.freeze(
      lines.map((line, index) => {
        const text = stripBulletPrefix(line);
        return freezeRecommendation({
          id: slugId("recommendation", index),
          text,
          category:
            this.recommendationClassifier.classify(text) ||
            CoachRecommendationCategories.GENERAL,
          priority: index + 1,
          severity:
            this.severityClassifier.classify(text) || CoachSeverities.INFO,
        });
      }),
    );
  }
}

export const recommendationParser = new RecommendationParser();
