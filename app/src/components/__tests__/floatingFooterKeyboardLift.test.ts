import {
  floatingFooterAnchorBottom,
  floatingFooterKeyboardLift,
} from "../floatingFooterKeyboardLift";

const ANDROID_WINDOW = 840;
const NAV_INSET = 48;
const TAB_BAR_OFFSET = NAV_INSET + 64 + 12;

describe("floatingFooterKeyboardLift Android", () => {
  const android = { platform: "android", windowHeight: ANDROID_WINDOW };

  it("lifts by the keyboard overlap with the window, without subtracting the nav inset", () => {
    const keyboardTop = ANDROID_WINDOW - 336;
    const lift = floatingFooterKeyboardLift(
      { endCoordinates: { height: 336 + NAV_INSET, screenY: keyboardTop } },
      android,
    );

    expect(lift).toBe(336);
    expect(lift).toBeGreaterThan(NAV_INSET);
  });

  it("still lifts when edge-to-edge reports height 0 but screenY marks the keyboard top", () => {
    expect(
      floatingFooterKeyboardLift(
        { endCoordinates: { height: 0, screenY: ANDROID_WINDOW - 320 } },
        android,
      ),
    ).toBe(320);
  });

  it("does not subtract the tab-bar rest offset from the keyboard lift", () => {
    const lift = floatingFooterKeyboardLift(
      { endCoordinates: { height: 300, screenY: ANDROID_WINDOW - 300 } },
      android,
    );

    expect(lift).toBe(300);
    expect(floatingFooterAnchorBottom(lift, TAB_BAR_OFFSET)).toBe(300);
    expect(floatingFooterAnchorBottom(lift, TAB_BAR_OFFSET)).not.toBe(
      300 + TAB_BAR_OFFSET,
    );
  });

  it("does not lift again when the window already resized to the keyboard", () => {
    expect(
      floatingFooterKeyboardLift(
        { endCoordinates: { height: 300, screenY: 540 } },
        { platform: "android", windowHeight: 540 },
      ),
    ).toBe(0);
  });

  it("returns 0 for a closed keyboard event", () => {
    expect(
      floatingFooterKeyboardLift(
        { endCoordinates: { height: 0, screenY: 0 } },
        android,
      ),
    ).toBe(0);
  });
});

describe("floatingFooterAnchorBottom", () => {
  it("returns to the tab-bar rest position when the keyboard closes", () => {
    expect(floatingFooterAnchorBottom(0, TAB_BAR_OFFSET)).toBe(TAB_BAR_OFFSET);
  });
});

describe("floatingFooterKeyboardLift iOS", () => {
  it("uses the reported keyboard height", () => {
    expect(
      floatingFooterKeyboardLift(
        { endCoordinates: { height: 336, screenY: 500 } },
        { platform: "ios", windowHeight: 844 },
      ),
    ).toBe(336);
  });
});
