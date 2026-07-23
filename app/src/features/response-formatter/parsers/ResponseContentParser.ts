import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { CoachParsingResult } from "../models/CoachParsingResult";
import { CoachSectionKinds } from "../models/CoachSection";
import { WhitespaceNormalizer } from "../normalizers/WhitespaceNormalizer";
import { freezeParsingResult } from "../utils/freezeObjects";
import { MessageParser } from "./MessageParser";
import {
  extractBulletLines,
  findSectionContent,
  parseSections,
} from "./sectionHelpers";

function linesFor(
  sections: ReturnType<typeof parseSections>,
  kind: (typeof CoachSectionKinds)[keyof typeof CoachSectionKinds],
): readonly string[] {
  const content = findSectionContent(sections, kind) ?? "";
  if (!content.trim()) {
    return Object.freeze([]);
  }
  return extractBulletLines(content);
}

/**
 * Orchestrates isolated section parsing into a CoachParsingResult.
 * Deterministic. Provider-independent.
 */
export class ResponseContentParser {
  constructor(
    private readonly whitespaceNormalizer = new WhitespaceNormalizer(),
    private readonly messageParser = new MessageParser(),
  ) {}

  parse(response: AIResponse): CoachParsingResult {
    const rawContent = this.whitespaceNormalizer.normalize(response.content);
    const sections = parseSections(rawContent);
    const message = this.messageParser.parse(sections, rawContent);

    return freezeParsingResult({
      messageText: message.text,
      recommendationLines: linesFor(
        sections,
        CoachSectionKinds.RECOMMENDATIONS,
      ),
      warningLines: linesFor(sections, CoachSectionKinds.WARNINGS),
      actionLines: linesFor(sections, CoachSectionKinds.ACTIONS),
      exerciseLines: linesFor(sections, CoachSectionKinds.EXERCISES),
      nutritionLines: linesFor(sections, CoachSectionKinds.NUTRITION),
      recoveryLines: linesFor(sections, CoachSectionKinds.RECOVERY),
      questionLines: linesFor(sections, CoachSectionKinds.QUESTIONS),
      citationLines: linesFor(sections, CoachSectionKinds.CITATIONS),
      insightLines: linesFor(sections, CoachSectionKinds.INSIGHTS),
      reasoningText: findSectionContent(
        sections,
        CoachSectionKinds.REASONING,
      ),
      confidenceRaw: findSectionContent(
        sections,
        CoachSectionKinds.CONFIDENCE,
      ),
      sections,
      rawContent,
    });
  }
}

export const responseContentParser = new ResponseContentParser();
