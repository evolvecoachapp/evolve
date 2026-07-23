import { ResponseIntentClassifier } from "../classifiers/ResponseIntentClassifier";
import { SeverityClassifier } from "../classifiers/SeverityClassifier";
import { ConfidenceClassifier } from "../classifiers/ConfidenceClassifier";
import { RecommendationClassifier } from "../classifiers/RecommendationClassifier";
import { freezeParsingResult } from "../utils/freezeObjects";
import { CoachResponseIntents } from "../models/CoachResponseIntent";

describe("response-formatter classifiers", () => {
  it("ResponseIntentClassifier detects mixed intent", () => {
    const parsing = freezeParsingResult({
      messageText: "Hello",
      recommendationLines: Object.freeze(["- train"]),
      warningLines: Object.freeze(["- caution"]),
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
      rawContent: "Hello",
    });

    expect(new ResponseIntentClassifier().classify(parsing)).toBe(
      CoachResponseIntents.MIXED,
    );
  });

  it("SeverityClassifier maps critical language", () => {
    expect(
      new SeverityClassifier().classify("Stop immediately if pain appears"),
    ).toBe("critical");
  });

  it("ConfidenceClassifier parses percent and labels", () => {
    expect(new ConfidenceClassifier().classify("85%").score).toBeCloseTo(0.85);
    expect(new ConfidenceClassifier().classify("high").label).toBe("high");
  });

  it("RecommendationClassifier categorizes domains", () => {
    const classifier = new RecommendationClassifier();
    expect(classifier.classify("Increase weekly training volume")).toBe(
      "training",
    );
    expect(classifier.classify("Prioritize protein intake")).toBe("nutrition");
    expect(classifier.classify("Sleep eight hours")).toBe("recovery");
  });
});
