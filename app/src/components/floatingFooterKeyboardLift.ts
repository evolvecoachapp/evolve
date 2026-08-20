export interface FloatingFooterKeyboardCoordinates {
  readonly height: number;
  readonly screenY: number;
}

export interface FloatingFooterKeyboardLayout {
  readonly platform: string;
  readonly windowHeight: number;
}

/**
 * Bottom offset that places a floating footer above the software keyboard.
 *
 * iOS reports keyboard height directly. Android edge-to-edge often reports
 * `height: 0` or a height that still includes the nav bar; the overlap between
 * the window bottom and `screenY` (keyboard top) is the lift that matches
 * `position: absolute; bottom`.
 *
 * When the window already resized (`adjustResize`), `screenY` sits at the
 * window bottom and overlap is 0 — do not add keyboard height on top of that.
 */
export function floatingFooterKeyboardLift(
  event: { readonly endCoordinates: FloatingFooterKeyboardCoordinates },
  layout: FloatingFooterKeyboardLayout,
): number {
  const { height, screenY } = event.endCoordinates;

  if (layout.platform === "ios") {
    return Math.max(0, height);
  }

  if (Number.isFinite(screenY) && screenY > 0 && layout.windowHeight > 0) {
    return Math.max(0, layout.windowHeight - screenY);
  }

  return Math.max(0, height);
}

/**
 * Keyboard lift replaces the tab-bar offset — never add both.
 * Hidden keyboard (lift 0) returns to the tab-bar / stack rest position.
 */
export function floatingFooterAnchorBottom(
  keyboardLift: number,
  baseBottom: number,
): number {
  return keyboardLift > 0 ? keyboardLift : baseBottom;
}
