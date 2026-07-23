import type { AIResponse } from "../../ai-provider/models/AIResponse";
import { CoachResponseBuilder } from "../builders/CoachResponseBuilder";
import { CoachResponsePackageBuilder } from "../builders/CoachResponsePackageBuilder";
import { ResponseIntentClassifier } from "../classifiers/ResponseIntentClassifier";
import { ConfidenceExtractor } from "../extractors/ConfidenceExtractor";
import { InsightExtractor } from "../extractors/InsightExtractor";
import { ReasoningExtractor } from "../extractors/ReasoningExtractor";
import { ReferenceExtractor } from "../extractors/ReferenceExtractor";
import type { CoachFormatting } from "../models/CoachFormatting";
import type { CoachOutputFormat } from "../models/CoachFormatting";
import type { CoachResponse } from "../models/CoachResponse";
import type { CoachResponsePackage } from "../models/CoachResponsePackage";
import type { CoachSummary } from "../models/CoachSummary";
import type { CoachValidationIssue } from "../models/CoachValidationIssue";
import { ActionNormalizer } from "../normalizers/ActionNormalizer";
import { CitationNormalizer } from "../normalizers/CitationNormalizer";
import { FormattingNormalizer } from "../normalizers/FormattingNormalizer";
import { RecommendationNormalizer } from "../normalizers/RecommendationNormalizer";
import { ActionParser } from "../parsers/ActionParser";
import { CitationParser } from "../parsers/CitationParser";
import { ExerciseParser } from "../parsers/ExerciseParser";
import { MessageParser } from "../parsers/MessageParser";
import { MetadataParser } from "../parsers/MetadataParser";
import { NutritionParser } from "../parsers/NutritionParser";
import { QuestionParser } from "../parsers/QuestionParser";
import { RecommendationParser } from "../parsers/RecommendationParser";
import { RecoveryParser } from "../parsers/RecoveryParser";
import { ResponseContentParser } from "../parsers/ResponseContentParser";
import { WarningParser } from "../parsers/WarningParser";
import { ResponseFormatterRouter } from "../formatters/ResponseFormatterRouter";
import { createCoachMessage } from "../models/CoachMessage";
import { summarizeCoachResponse } from "../utils/summarizeResponse";
import { validateCoachResponse } from "../validators/validateCoachResponse";
import { freezeSnapshot } from "../utils/freezeObjects";
import { computeResponseStatistics } from "../utils/responseStatistics";

export interface FormatResponseOptions {
  readonly response: AIResponse;
  readonly formatting?: Partial<CoachFormatting> | null;
  readonly outputFormat?: CoachOutputFormat | null;
  readonly createdAt?: string;
  readonly responseId?: string;
}

/**
 * Coordinates deterministic AIResponse → CoachResponse transformation.
 * No networking. No provider SDKs. No business logic.
 */
export class ResponseFormatterService {
  constructor(
    private readonly contentParser = new ResponseContentParser(),
    private readonly messageParser = new MessageParser(),
    private readonly recommendationParser = new RecommendationParser(),
    private readonly warningParser = new WarningParser(),
    private readonly actionParser = new ActionParser(),
    private readonly exerciseParser = new ExerciseParser(),
    private readonly nutritionParser = new NutritionParser(),
    private readonly recoveryParser = new RecoveryParser(),
    private readonly questionParser = new QuestionParser(),
    private readonly citationParser = new CitationParser(),
    private readonly metadataParser = new MetadataParser(),
    private readonly reasoningExtractor = new ReasoningExtractor(),
    private readonly insightExtractor = new InsightExtractor(),
    private readonly confidenceExtractor = new ConfidenceExtractor(),
    private readonly referenceExtractor = new ReferenceExtractor(),
    private readonly intentClassifier = new ResponseIntentClassifier(),
    private readonly recommendationNormalizer = new RecommendationNormalizer(),
    private readonly actionNormalizer = new ActionNormalizer(),
    private readonly citationNormalizer = new CitationNormalizer(),
    private readonly formattingNormalizer = new FormattingNormalizer(),
    private readonly formatterRouter = new ResponseFormatterRouter(),
  ) {}

  buildCoachResponse(
    aiResponse: AIResponse,
    options: {
      readonly formatting?: Partial<CoachFormatting> | null;
      readonly createdAt?: string;
      readonly responseId?: string;
    } = {},
  ): CoachResponse {
    const createdAt = options.createdAt ?? new Date().toISOString();
    const parsing = this.contentParser.parse(aiResponse);
    const sections = parsing.sections;

    const message = this.messageParser.parse(
      sections,
      parsing.rawContent,
      "message:1",
    );
    const recommendations = this.recommendationNormalizer.normalize(
      this.recommendationParser.parse(sections),
    );
    const warnings = this.warningParser.parse(sections);
    const actions = this.actionNormalizer.normalize(
      this.actionParser.parse(sections),
    );
    const exercises = this.exerciseParser.parse(sections);
    const nutrition = this.nutritionParser.parse(sections);
    const recovery = this.recoveryParser.parse(sections);
    const questions = this.questionParser.parse(sections);

    const parsedCitations = this.citationParser.parse(sections);
    const extractedRefs =
      parsedCitations.length > 0
        ? parsedCitations
        : this.referenceExtractor.extract(parsing.rawContent);
    const citations = this.citationNormalizer.normalize(extractedRefs);

    const reasoning =
      this.reasoningExtractor.extract(sections, parsing.rawContent) ??
      parsing.reasoningText;
    const insights = this.insightExtractor.extract(sections, reasoning);
    const confidence = this.confidenceExtractor.extract(
      sections,
      parsing.rawContent,
    );
    const intent = this.intentClassifier.classify(parsing);
    const metadata = this.metadataParser.parse(aiResponse);
    const formatting = this.formattingNormalizer.normalize(options.formatting);

    const responseId =
      options.responseId ?? `coach-response:${aiResponse.id}`;

    return new CoachResponseBuilder()
      .withId(responseId)
      .withSourceResponseId(aiResponse.id)
      .withMessage(
        createCoachMessage(message.id, message.text, formatting.tone),
      )
      .withIntent(intent)
      .withRecommendations(recommendations)
      .withWarnings(warnings)
      .withInsights(insights)
      .withActions(actions)
      .withExercises(exercises)
      .withNutrition(nutrition)
      .withRecovery(recovery)
      .withQuestions(questions)
      .withCitations(citations)
      .withSections(sections)
      .withConfidence(confidence)
      .withFormatting(formatting)
      .withMetadata(metadata)
      .withReasoning(reasoning)
      .withCreatedAt(createdAt)
      .withFrozenAt(createdAt)
      .build();
  }

  formatResponse(options: FormatResponseOptions): CoachResponsePackage {
    const createdAt = options.createdAt ?? new Date().toISOString();
    const parsing = this.contentParser.parse(options.response);
    const response = this.buildCoachResponse(options.response, {
      formatting: options.formatting,
      createdAt,
      responseId: options.responseId,
    });
    const validationIssues = validateCoachResponse(response);
    const formatting = this.formatterRouter.format(
      response,
      options.outputFormat ?? response.formatting.preferredFormat,
      createdAt,
    );
    const snapshot = freezeSnapshot({
      response,
      summary: summarizeCoachResponse(response),
      statistics: computeResponseStatistics(response),
      capturedAt: createdAt,
    });

    return new CoachResponsePackageBuilder()
      .withResponse(response)
      .withParsing(parsing)
      .withFormatting(formatting)
      .withValidationIssues(validationIssues)
      .withSnapshot(snapshot)
      .withCreatedAt(createdAt)
      .build();
  }

  summarizeResponse(response: CoachResponse): CoachSummary {
    return summarizeCoachResponse(response);
  }

  validateResponse(response: CoachResponse): readonly CoachValidationIssue[] {
    return validateCoachResponse(response);
  }
}

export function createResponseFormatterService(): ResponseFormatterService {
  return new ResponseFormatterService();
}
