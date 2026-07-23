import type { CoachResponse } from "../models/CoachResponse";
import type { CoachValidationIssue } from "../models/CoachValidationIssue";
import { CoachValidationCodes } from "../models/CoachValidationIssue";
import { isValidConfidence } from "../utils/confidenceHelpers";
import { freezeValidationIssue } from "../utils/freezeObjects";

function issue(
  code: CoachValidationIssue["code"],
  message: string,
  path: string | null = null,
): CoachValidationIssue {
  return freezeValidationIssue({ code, message, path });
}

/**
 * Validate required fields and structural integrity of a CoachResponse.
 * Provider-independent.
 */
export function validateCoachResponse(
  response: CoachResponse,
): readonly CoachValidationIssue[] {
  const issues: CoachValidationIssue[] = [];

  if (!response.id.trim()) {
    issues.push(issue(CoachValidationCodes.MISSING_ID, "Response id is required", "id"));
  }

  if (!response.message) {
    issues.push(
      issue(
        CoachValidationCodes.MISSING_MESSAGE,
        "Response message is required",
        "message",
      ),
    );
  } else if (!response.message.text.trim()) {
    issues.push(
      issue(
        CoachValidationCodes.EMPTY_MESSAGE,
        "Response message text must not be empty",
        "message.text",
      ),
    );
  }

  if (!isValidConfidence(response.confidence.score)) {
    issues.push(
      issue(
        CoachValidationCodes.INVALID_CONFIDENCE,
        "Confidence score must be between 0 and 1",
        "confidence.score",
      ),
    );
  }

  response.recommendations.forEach((rec, index) => {
    if (!rec.id.trim() || !rec.text.trim()) {
      issues.push(
        issue(
          CoachValidationCodes.INVALID_RECOMMENDATION,
          "Recommendation requires id and text",
          `recommendations[${index}]`,
        ),
      );
    }
  });

  response.actions.forEach((action, index) => {
    if (!action.id.trim() || !action.label.trim()) {
      issues.push(
        issue(
          CoachValidationCodes.INVALID_ACTION,
          "Action requires id and label",
          `actions[${index}]`,
        ),
      );
    }
  });

  if (
    response.metadata.tags === undefined ||
    response.metadata.attributes === undefined
  ) {
    issues.push(
      issue(
        CoachValidationCodes.INVALID_METADATA,
        "Metadata must include tags and attributes",
        "metadata",
      ),
    );
  }

  response.sections.forEach((section, index) => {
    if (!section.id.trim() || section.order < 0) {
      issues.push(
        issue(
          CoachValidationCodes.INVALID_SECTION,
          "Section requires id and non-negative order",
          `sections[${index}]`,
        ),
      );
    }
  });

  if (
    !response.sourceResponseId.trim() ||
    !response.createdAt.trim() ||
    !response.frozenAt.trim()
  ) {
    issues.push(
      issue(
        CoachValidationCodes.INCOMPLETE_RESPONSE,
        "Response is missing source or timestamp fields",
        null,
      ),
    );
  }

  if (
    !response.formatting ||
    !response.formatting.preferredFormat ||
    !response.formatting.tone
  ) {
    issues.push(
      issue(
        CoachValidationCodes.FORMATTING_INTEGRITY,
        "Formatting hints are incomplete",
        "formatting",
      ),
    );
  }

  return Object.freeze(issues);
}
