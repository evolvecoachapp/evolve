import { CoachResponseBuilder } from "../builders/CoachResponseBuilder";
import { createCoachMessage } from "../models/CoachMessage";
import { CoachResponseIntents } from "../models/CoachResponseIntent";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";
import { validateCoachResponse } from "../validators/validateCoachResponse";
import { CoachValidationCodes } from "../models/CoachValidationIssue";
import { CoachConfidenceSources } from "../models/CoachConfidence";
import { CoachConfidenceLabels } from "../models/CoachConfidence";

describe("response-formatter validators", () => {
  it("accepts a complete response", () => {
    const response = new CoachResponseBuilder()
      .withId("coach:ok")
      .withSourceResponseId("ai-resp:ok")
      .withMessage(createCoachMessage("message:1", "Solid work"))
      .withIntent(CoachResponseIntents.INFORMATIONAL)
      .withCreatedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(validateCoachResponse(response)).toHaveLength(0);
  });

  it("flags empty message and invalid confidence", () => {
    const response = new CoachResponseBuilder()
      .withId("coach:bad")
      .withSourceResponseId("ai-resp:bad")
      .withMessage(createCoachMessage("message:1", "   "))
      .withIntent(CoachResponseIntents.UNKNOWN)
      .withConfidence({
        score: 1.5,
        label: CoachConfidenceLabels.HIGH,
        source: CoachConfidenceSources.DEFAULT,
      })
      .withCreatedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    const codes = validateCoachResponse(response).map((i) => i.code);
    expect(codes).toContain(CoachValidationCodes.EMPTY_MESSAGE);
    expect(codes).toContain(CoachValidationCodes.INVALID_CONFIDENCE);
  });
});
