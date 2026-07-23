import type { CoachAction } from "../models/CoachAction";
import type { CoachCitation } from "../models/CoachCitation";
import type { CoachConfidence } from "../models/CoachConfidence";
import {
  DEFAULT_COACH_CONFIDENCE,
} from "../models/CoachConfidence";
import type { CoachExercise } from "../models/CoachExercise";
import type { CoachFormatting } from "../models/CoachFormatting";
import {
  DEFAULT_COACH_FORMATTING,
} from "../models/CoachFormatting";
import type { CoachInsight } from "../models/CoachInsight";
import type { CoachMessage } from "../models/CoachMessage";
import { createCoachMessage } from "../models/CoachMessage";
import type { CoachMetadata } from "../models/CoachMetadata";
import { EMPTY_COACH_METADATA } from "../models/CoachMetadata";
import type { CoachNutritionAdvice } from "../models/CoachNutritionAdvice";
import type { CoachQuestion } from "../models/CoachQuestion";
import type { CoachRecommendation } from "../models/CoachRecommendation";
import type { CoachRecoveryAdvice } from "../models/CoachRecoveryAdvice";
import type { CoachResponse } from "../models/CoachResponse";
import type { CoachResponseIntent } from "../models/CoachResponseIntent";
import { CoachResponseIntents } from "../models/CoachResponseIntent";
import type { CoachSection } from "../models/CoachSection";
import type { CoachWarning } from "../models/CoachWarning";
import { freezeResponse } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable CoachResponse.
 */
export class CoachResponseBuilder {
  private id = "";
  private sourceResponseId = "";
  private message: CoachMessage = createCoachMessage("message:1", "");
  private intent: CoachResponseIntent = CoachResponseIntents.UNKNOWN;
  private recommendations: readonly CoachRecommendation[] = Object.freeze([]);
  private warnings: readonly CoachWarning[] = Object.freeze([]);
  private insights: readonly CoachInsight[] = Object.freeze([]);
  private actions: readonly CoachAction[] = Object.freeze([]);
  private exercises: readonly CoachExercise[] = Object.freeze([]);
  private nutrition: readonly CoachNutritionAdvice[] = Object.freeze([]);
  private recovery: readonly CoachRecoveryAdvice[] = Object.freeze([]);
  private questions: readonly CoachQuestion[] = Object.freeze([]);
  private citations: readonly CoachCitation[] = Object.freeze([]);
  private sections: readonly CoachSection[] = Object.freeze([]);
  private confidence: CoachConfidence = DEFAULT_COACH_CONFIDENCE;
  private formatting: CoachFormatting = DEFAULT_COACH_FORMATTING;
  private metadata: CoachMetadata = EMPTY_COACH_METADATA;
  private reasoning: string | null = null;
  private createdAt = "";
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withSourceResponseId(sourceResponseId: string): this {
    this.sourceResponseId = sourceResponseId;
    return this;
  }

  withMessage(message: CoachMessage): this {
    this.message = message;
    return this;
  }

  withIntent(intent: CoachResponseIntent): this {
    this.intent = intent;
    return this;
  }

  withRecommendations(
    recommendations: readonly CoachRecommendation[],
  ): this {
    this.recommendations = recommendations;
    return this;
  }

  withWarnings(warnings: readonly CoachWarning[]): this {
    this.warnings = warnings;
    return this;
  }

  withInsights(insights: readonly CoachInsight[]): this {
    this.insights = insights;
    return this;
  }

  withActions(actions: readonly CoachAction[]): this {
    this.actions = actions;
    return this;
  }

  withExercises(exercises: readonly CoachExercise[]): this {
    this.exercises = exercises;
    return this;
  }

  withNutrition(nutrition: readonly CoachNutritionAdvice[]): this {
    this.nutrition = nutrition;
    return this;
  }

  withRecovery(recovery: readonly CoachRecoveryAdvice[]): this {
    this.recovery = recovery;
    return this;
  }

  withQuestions(questions: readonly CoachQuestion[]): this {
    this.questions = questions;
    return this;
  }

  withCitations(citations: readonly CoachCitation[]): this {
    this.citations = citations;
    return this;
  }

  withSections(sections: readonly CoachSection[]): this {
    this.sections = sections;
    return this;
  }

  withConfidence(confidence: CoachConfidence): this {
    this.confidence = confidence;
    return this;
  }

  withFormatting(formatting: CoachFormatting): this {
    this.formatting = formatting;
    return this;
  }

  withMetadata(metadata: CoachMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withReasoning(reasoning: string | null): this {
    this.reasoning = reasoning;
    return this;
  }

  withCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): CoachResponse {
    if (!this.id || !this.sourceResponseId || !this.createdAt || !this.frozenAt) {
      throw new Error("CoachResponseBuilder missing required fields");
    }

    return freezeResponse({
      id: this.id,
      sourceResponseId: this.sourceResponseId,
      message: this.message,
      intent: this.intent,
      recommendations: this.recommendations,
      warnings: this.warnings,
      insights: this.insights,
      actions: this.actions,
      exercises: this.exercises,
      nutrition: this.nutrition,
      recovery: this.recovery,
      questions: this.questions,
      citations: this.citations,
      sections: this.sections,
      confidence: this.confidence,
      formatting: this.formatting,
      metadata: this.metadata,
      reasoning: this.reasoning,
      createdAt: this.createdAt,
      frozenAt: this.frozenAt,
    });
  }
}
