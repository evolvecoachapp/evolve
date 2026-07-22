import { detectPromptIntent, resolvePromptIntent } from "../detectPromptIntent";

describe("detectPromptIntent", () => {
  it("detects WORKOUT intent from training keywords", () => {
    expect(detectPromptIntent("What should I train today?")).toBe("WORKOUT");
    expect(detectPromptIntent("Help me plan my sets and reps")).toBe("WORKOUT");
  });

  it("detects PROGRAM intent", () => {
    expect(detectPromptIntent("Build a mesocycle program")).toBe("PROGRAM");
  });

  it("detects NUTRITION intent", () => {
    expect(detectPromptIntent("How much protein should I eat?")).toBe(
      "NUTRITION",
    );
  });

  it("detects RECOVERY intent", () => {
    expect(detectPromptIntent("I feel sore and need recovery advice")).toBe(
      "RECOVERY",
    );
  });

  it("detects TECHNIQUE intent", () => {
    expect(detectPromptIntent("Fix my squat technique")).toBe("TECHNIQUE");
  });

  it("detects GOAL intent", () => {
    expect(detectPromptIntent("My goal is hypertrophy")).toBe("GOAL");
  });

  it("detects PROGRESS intent", () => {
    expect(detectPromptIntent("Am I hitting a plateau?")).toBe("PROGRESS");
  });

  it("detects GENERAL_CHAT greetings", () => {
    expect(detectPromptIntent("Hello coach")).toBe("GENERAL_CHAT");
  });

  it("allows UNKNOWN for unmatched messages", () => {
    expect(detectPromptIntent("asdf qwer")).toBe("UNKNOWN");
  });

  it("returns UNKNOWN for empty messages", () => {
    expect(detectPromptIntent("   ")).toBe("UNKNOWN");
  });

  it("honors intent overrides", () => {
    expect(resolvePromptIntent("hello", "NUTRITION")).toBe("NUTRITION");
  });
});
