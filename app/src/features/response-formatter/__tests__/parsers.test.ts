import { parseSections } from "../parsers/sectionHelpers";
import { MessageParser } from "../parsers/MessageParser";
import { RecommendationParser } from "../parsers/RecommendationParser";
import { WarningParser } from "../parsers/WarningParser";
import { ActionParser } from "../parsers/ActionParser";
import { ExerciseParser } from "../parsers/ExerciseParser";
import { NutritionParser } from "../parsers/NutritionParser";
import { RecoveryParser } from "../parsers/RecoveryParser";
import { QuestionParser } from "../parsers/QuestionParser";
import { CitationParser } from "../parsers/CitationParser";
import { MetadataParser } from "../parsers/MetadataParser";
import {
  createAIResponseFixture,
  STRUCTURED_COACH_CONTENT,
} from "../testSupport/fixtures";
import { CoachSectionKinds } from "../models/CoachSection";

describe("response-formatter parsers", () => {
  const sections = parseSections(STRUCTURED_COACH_CONTENT);

  it("MessageParser extracts message text", () => {
    const message = new MessageParser().parse(sections, STRUCTURED_COACH_CONTENT);
    expect(message.text).toContain("controlled tempo");
    expect(message.role).toBe("coach");
  });

  it("RecommendationParser extracts recommendations", () => {
    const items = new RecommendationParser().parse(sections);
    expect(items.length).toBe(3);
    expect(items[0].text).toContain("back squats");
    expect(Object.isFrozen(items[0])).toBe(true);
  });

  it("WarningParser extracts warnings with severity", () => {
    const items = new WarningParser().parse(sections);
    expect(items).toHaveLength(1);
    expect(items[0].severity).toBe("critical");
  });

  it("ActionParser extracts actions", () => {
    const items = new ActionParser().parse(sections);
    expect(items.length).toBe(2);
    expect(items[0].kind).toBe("start_workout");
  });

  it("ExerciseParser parses pipe and NxM formats", () => {
    const items = new ExerciseParser().parse(sections);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      name: "Back Squat",
      sets: 3,
      reps: "5",
    });
    expect(items[1].sets).toBe(3);
    expect(items[1].reps).toBe("8");
  });

  it("NutritionParser and RecoveryParser extract advice", () => {
    expect(new NutritionParser().parse(sections)[0].timing).toBe(
      "within 1 hour",
    );
    expect(new RecoveryParser().parse(sections)[0].focus).toBe("Sleep");
  });

  it("QuestionParser and CitationParser extract items", () => {
    const questions = new QuestionParser().parse(sections);
    expect(questions[0].optional).toBe(true);
    const citations = new CitationParser().parse(sections);
    expect(citations[0].url).toBe("https://example.com/nsca");
  });

  it("MetadataParser maps AIResponse metadata", () => {
    const meta = new MetadataParser().parse(createAIResponseFixture());
    expect(meta.providerId).toBe("openai");
    expect(meta.sourceResponseId).toBe("ai-resp:1");
  });

  it("parseSections classifies known headers", () => {
    expect(sections.some((s) => s.kind === CoachSectionKinds.EXERCISES)).toBe(
      true,
    );
  });
});
