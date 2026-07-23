import type { CoachFormattingResult } from "../models/CoachFormattingResult";
import { CoachOutputFormats } from "../models/CoachFormatting";
import type { CoachResponse } from "../models/CoachResponse";
import { freezeFormattingResult } from "../utils/freezeObjects";

/**
 * Format CoachResponse as rich structured content (text payload only).
 */
export class RichContentFormatter {
  format(
    response: CoachResponse,
    formattedAt: string,
  ): CoachFormattingResult {
    const sections: Record<string, string> = {
      message: response.message.text,
      intent: response.intent,
      confidence: String(response.confidence.score),
      recommendations: JSON.stringify(response.recommendations),
      warnings: JSON.stringify(response.warnings),
      actions: JSON.stringify(response.actions),
      exercises: JSON.stringify(response.exercises),
      nutrition: JSON.stringify(response.nutrition),
      recovery: JSON.stringify(response.recovery),
      questions: JSON.stringify(response.questions),
      citations: JSON.stringify(response.citations),
      insights: JSON.stringify(response.insights),
      reasoning: response.reasoning ?? "",
    };

    const content = JSON.stringify(
      {
        kind: "rich",
        message: response.message.text,
        intent: response.intent,
        confidence: response.confidence,
        recommendations: response.recommendations,
        warnings: response.warnings,
        actions: response.actions,
        exercises: response.exercises,
        nutrition: response.nutrition,
        recovery: response.recovery,
        questions: response.questions,
        citations: response.citations,
        insights: response.insights,
        reasoning: response.reasoning,
      },
      null,
      2,
    );

    return freezeFormattingResult({
      responseId: response.id,
      format: CoachOutputFormats.RICH,
      content,
      sections: Object.freeze(sections),
      response,
      formattedAt,
    });
  }
}

export const richContentFormatter = new RichContentFormatter();
