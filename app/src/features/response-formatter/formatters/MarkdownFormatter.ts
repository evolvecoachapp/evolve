import type { CoachFormattingResult } from "../models/CoachFormattingResult";
import { CoachOutputFormats } from "../models/CoachFormatting";
import type { CoachResponse } from "../models/CoachResponse";
import { freezeFormattingResult } from "../utils/freezeObjects";
import { bulletList, joinLines } from "../utils/formattingHelpers";

/**
 * Format CoachResponse as markdown text (no UI).
 */
export class MarkdownFormatter {
  format(
    response: CoachResponse,
    formattedAt: string,
  ): CoachFormattingResult {
    const parts: string[] = [];
    const sections: Record<string, string> = {};

    parts.push(`# Coach Response`);
    parts.push("");
    parts.push(response.message.text);
    sections.message = response.message.text;

    if (response.recommendations.length > 0) {
      const block = bulletList(response.recommendations.map((r) => r.text));
      parts.push("", "## Recommendations", block);
      sections.recommendations = block;
    }
    if (response.warnings.length > 0) {
      const block = bulletList(response.warnings.map((w) => w.text));
      parts.push("", "## Warnings", block);
      sections.warnings = block;
    }
    if (response.actions.length > 0 && response.formatting.includeActions) {
      const block = bulletList(response.actions.map((a) => a.label));
      parts.push("", "## Actions", block);
      sections.actions = block;
    }
    if (response.exercises.length > 0) {
      const block = bulletList(
        response.exercises.map((e) => {
          const detail = [e.name];
          if (e.sets != null) detail.push(String(e.sets));
          if (e.reps) detail.push(e.reps);
          return detail.join(" | ");
        }),
      );
      parts.push("", "## Exercises", block);
      sections.exercises = block;
    }
    if (response.nutrition.length > 0) {
      const block = bulletList(response.nutrition.map((n) => n.text));
      parts.push("", "## Nutrition", block);
      sections.nutrition = block;
    }
    if (response.recovery.length > 0) {
      const block = bulletList(response.recovery.map((r) => r.text));
      parts.push("", "## Recovery", block);
      sections.recovery = block;
    }
    if (response.questions.length > 0) {
      const block = bulletList(response.questions.map((q) => q.text));
      parts.push("", "## Questions", block);
      sections.questions = block;
    }
    if (
      response.citations.length > 0 &&
      response.formatting.includeCitations
    ) {
      const block = bulletList(
        response.citations.map((c) =>
          c.url ? `[${c.title}](${c.url})` : c.title,
        ),
      );
      parts.push("", "## Citations", block);
      sections.citations = block;
    }
    if (response.insights.length > 0) {
      const block = bulletList(response.insights.map((i) => i.text));
      parts.push("", "## Insights", block);
      sections.insights = block;
    }
    if (response.reasoning) {
      parts.push("", "## Reasoning", response.reasoning);
      sections.reasoning = response.reasoning;
    }

    parts.push(
      "",
      `## Confidence`,
      `${response.confidence.score} (${response.confidence.label})`,
    );
    sections.confidence = String(response.confidence.score);

    return freezeFormattingResult({
      responseId: response.id,
      format: CoachOutputFormats.MARKDOWN,
      content: joinLines(parts),
      sections: Object.freeze(sections),
      response,
      formattedAt,
    });
  }
}

export const markdownFormatter = new MarkdownFormatter();
