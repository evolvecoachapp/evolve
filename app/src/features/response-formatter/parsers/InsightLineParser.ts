import type { CoachInsight } from "../models/CoachInsight";
import { CoachInsightKinds } from "../models/CoachInsight";
import type { CoachSection } from "../models/CoachSection";
import { CoachSectionKinds } from "../models/CoachSection";
import { freezeInsight } from "../utils/freezeObjects";
import { slugId, stripBulletPrefix } from "../utils/formattingHelpers";
import {
  extractBulletLines,
  findSectionContent,
} from "./sectionHelpers";

/**
 * Parse insight lines from dedicated sections.
 */
export class InsightLineParser {
  parse(sections: readonly CoachSection[]): readonly CoachInsight[] {
    const content =
      findSectionContent(sections, CoachSectionKinds.INSIGHTS) ?? "";
    if (!content.trim()) {
      return Object.freeze([]);
    }

    return Object.freeze(
      extractBulletLines(content).map((line, index) => {
        const text = stripBulletPrefix(line);
        return freezeInsight({
          id: slugId("insight", index),
          text,
          kind: CoachInsightKinds.OBSERVATION,
        });
      }),
    );
  }
}

export const insightLineParser = new InsightLineParser();
