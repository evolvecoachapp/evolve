import {
  parseCoachMarkdown,
  unescapeCoachText,
} from "../coachMarkdown";
import { coachKeyboardOverlapPadding } from "../coachComposerInsets";

describe("unescapeCoachText", () => {
  it("turns escaped newline sequences into real line breaks", () => {
    expect(unescapeCoachText("Line 1\\nLine 2")).toBe("Line 1\nLine 2");
    expect(unescapeCoachText("Line 1\\r\\nLine 2")).toBe("Line 1\nLine 2");
  });

  it("preserves already-real newlines", () => {
    expect(unescapeCoachText("Line 1\nLine 2")).toBe("Line 1\nLine 2");
  });
});

describe("parseCoachMarkdown", () => {
  it("parses bold spans", () => {
    const blocks = parseCoachMarkdown("Stay **tight** today.");
    expect(blocks).toEqual([
      {
        type: "paragraph",
        inlines: [
          { type: "text", value: "Stay " },
          { type: "bold", value: "tight" },
          { type: "text", value: " today." },
        ],
      },
    ]);
  });

  it("keeps line breaks as separate paragraphs", () => {
    const blocks = parseCoachMarkdown("First line\\nSecond line");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({
      type: "paragraph",
      inlines: [{ type: "text", value: "First line" }],
    });
    expect(blocks[1]).toEqual({
      type: "paragraph",
      inlines: [{ type: "text", value: "Second line" }],
    });
  });

  it("groups unordered list items", () => {
    const blocks = parseCoachMarkdown("- Sleep 8 hours\n- Eat protein\n- Walk");
    expect(blocks).toEqual([
      {
        type: "list",
        ordered: false,
        items: [
          [{ type: "text", value: "Sleep 8 hours" }],
          [{ type: "text", value: "Eat protein" }],
          [{ type: "text", value: "Walk" }],
        ],
      },
    ]);
  });

  it("groups ordered list items with bold", () => {
    const blocks = parseCoachMarkdown("1. **Warm up**\n2. Main sets");
    expect(blocks[0]).toEqual({
      type: "list",
      ordered: true,
      items: [
        [{ type: "bold", value: "Warm up" }],
        [{ type: "text", value: "Main sets" }],
      ],
    });
  });
});

describe("coachKeyboardOverlapPadding", () => {
  it("is zero when the keyboard is hidden", () => {
    expect(coachKeyboardOverlapPadding(0, 120)).toBe(0);
  });

  it("adds only the keyboard lift above the tab-bar footer offset", () => {
    expect(coachKeyboardOverlapPadding(300, 120)).toBe(180);
  });

  it("does not double-count when keyboard lift is below the tab-bar offset", () => {
    expect(coachKeyboardOverlapPadding(80, 120)).toBe(0);
  });

  it("uses the full Android keyboard overlap rather than stacking it on the tab bar", () => {
    const tabAwareBottom = 48 + 64 + 12;
    const androidKeyboardLift = 320;
    expect(
      coachKeyboardOverlapPadding(androidKeyboardLift, tabAwareBottom),
    ).toBe(androidKeyboardLift - tabAwareBottom);
  });
});
