import { CoachResponseBuilder } from "../builders/CoachResponseBuilder";
import { CoachSummaryBuilder } from "../builders/CoachSummaryBuilder";
import { CoachResponsePackageBuilder } from "../builders/CoachResponsePackageBuilder";
import { createCoachMessage } from "../models/CoachMessage";
import { DEFAULT_COACH_CONFIDENCE } from "../models/CoachConfidence";
import { DEFAULT_COACH_FORMATTING } from "../models/CoachFormatting";
import { EMPTY_COACH_METADATA } from "../models/CoachMetadata";
import { CoachResponseIntents } from "../models/CoachResponseIntent";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";
import { freezeParsingResult } from "../utils/freezeObjects";

describe("response-formatter builders", () => {
  it("CoachResponseBuilder builds a frozen response", () => {
    const response = new CoachResponseBuilder()
      .withId("coach:1")
      .withSourceResponseId("ai-resp:1")
      .withMessage(createCoachMessage("message:1", "Hello athlete"))
      .withIntent(CoachResponseIntents.INFORMATIONAL)
      .withConfidence(DEFAULT_COACH_CONFIDENCE)
      .withFormatting(DEFAULT_COACH_FORMATTING)
      .withMetadata(EMPTY_COACH_METADATA)
      .withCreatedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(response)).toBe(true);
    expect(response.message.text).toBe("Hello athlete");
  });

  it("CoachSummaryBuilder summarizes a response", () => {
    const response = new CoachResponseBuilder()
      .withId("coach:2")
      .withSourceResponseId("ai-resp:2")
      .withMessage(createCoachMessage("message:1", "Train hard, recover harder."))
      .withIntent(CoachResponseIntents.INFORMATIONAL)
      .withCreatedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    const summary = new CoachSummaryBuilder().withResponse(response).build();
    expect(summary.responseId).toBe("coach:2");
    expect(summary.messagePreview).toContain("Train hard");
  });

  it("CoachResponsePackageBuilder requires response and parsing", () => {
    const response = new CoachResponseBuilder()
      .withId("coach:3")
      .withSourceResponseId("ai-resp:3")
      .withMessage(createCoachMessage("message:1", "Keep going"))
      .withIntent(CoachResponseIntents.INFORMATIONAL)
      .withCreatedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    const parsing = freezeParsingResult({
      messageText: "Keep going",
      recommendationLines: Object.freeze([]),
      warningLines: Object.freeze([]),
      actionLines: Object.freeze([]),
      exerciseLines: Object.freeze([]),
      nutritionLines: Object.freeze([]),
      recoveryLines: Object.freeze([]),
      questionLines: Object.freeze([]),
      citationLines: Object.freeze([]),
      insightLines: Object.freeze([]),
      reasoningText: null,
      confidenceRaw: null,
      sections: Object.freeze([]),
      rawContent: "Keep going",
    });

    const pkg = new CoachResponsePackageBuilder()
      .withResponse(response)
      .withParsing(parsing)
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(pkg)).toBe(true);
    expect(pkg.snapshot.summary.responseId).toBe("coach:3");
  });
});
