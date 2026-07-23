import type { CoachInsight } from "../models/CoachInsight";
import { CoachInsightKinds } from "../models/CoachInsight";
import type { CoachSection } from "../models/CoachSection";
import { CoachSectionKinds } from "../models/CoachSection";
import {
  extractBulletLines,
  findSectionContent,
} from "../parsers/sectionHelpers";
import { freezeInsight } from "../utils/freezeObjects";
import { slugId, stripBulletPrefix } from "../utils/formattingHelpers";

/**
 * Extract insights from sections and reasoning text.
 */
export class InsightExtractor {
  extract(
    sections: readonly CoachSection[],
    reasoning: string | null,
  ): readonly CoachInsight[] {
    const content =
      findSectionContent(sections, CoachSectionKinds.INSIGHTS) ?? "";
    const fromSection = content.trim()
      ? extractBulletLines(content).map((line, index) =>
          freezeInsight({
            id: slugId("insight", index),
            text: stripBulletPrefix(line),
            kind: CoachInsightKinds.OBSERVATION,
          }),
        )
      : [];

    const insights = [...fromSection];
    if (reasoning?.trim()) {
      insights.push(
        freezeInsight({
          id: slugId("insight", insights.length),
          text: reasoning.trim(),
          kind: CoachInsightKinds.REASONING,
        }),
      );
    }

    return Object.freeze(insights);
  }
}

export const insightExtractor = new InsightExtractor();
