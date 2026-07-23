import type { CoachFormattingResult } from "../models/CoachFormattingResult";
import { CoachOutputFormats } from "../models/CoachFormatting";
import type { CoachResponse } from "../models/CoachResponse";
import { freezeFormattingResult } from "../utils/freezeObjects";
import { joinLines } from "../utils/formattingHelpers";

/**
 * Format CoachResponse as plain text (no UI).
 */
export class PlainTextFormatter {
  format(
    response: CoachResponse,
    formattedAt: string,
  ): CoachFormattingResult {
    const parts: string[] = [response.message.text];
    const sections: Record<string, string> = {
      message: response.message.text,
    };

    const append = (title: string, key: string, lines: readonly string[]) => {
      if (lines.length === 0) return;
      const block = lines.map((line) => `- ${line}`).join("\n");
      parts.push("", `${title}:`, block);
      sections[key] = block;
    };

    append(
      "Recommendations",
      "recommendations",
      response.recommendations.map((r) => r.text),
    );
    append("Warnings", "warnings", response.warnings.map((w) => w.text));
    append("Actions", "actions", response.actions.map((a) => a.label));
    append(
      "Exercises",
      "exercises",
      response.exercises.map((e) => e.name),
    );
    append(
      "Nutrition",
      "nutrition",
      response.nutrition.map((n) => n.text),
    );
    append(
      "Recovery",
      "recovery",
      response.recovery.map((r) => r.text),
    );
    append(
      "Questions",
      "questions",
      response.questions.map((q) => q.text),
    );
    append(
      "Citations",
      "citations",
      response.citations.map((c) => c.title),
    );
    append("Insights", "insights", response.insights.map((i) => i.text));

    if (response.reasoning) {
      parts.push("", "Reasoning:", response.reasoning);
      sections.reasoning = response.reasoning;
    }

    parts.push("", `Confidence: ${response.confidence.score}`);
    sections.confidence = String(response.confidence.score);

    return freezeFormattingResult({
      responseId: response.id,
      format: CoachOutputFormats.PLAIN,
      content: joinLines(parts),
      sections: Object.freeze(sections),
      response,
      formattedAt,
    });
  }
}

export const plainTextFormatter = new PlainTextFormatter();
