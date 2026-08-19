/**
 * Extra scroll padding while the software keyboard is open.
 *
 * FloatingFooterAnchor already swaps tab-bar offset for keyboard lift, so this
 * only adds the delta. Adding keyboardLift on top of tab-bar reserve would
 * double-count the overlapping region.
 */
export function coachKeyboardOverlapPadding(
  keyboardLift: number,
  tabAwareBottom: number,
): number {
  if (keyboardLift <= 0) {
    return 0;
  }

  return Math.max(0, keyboardLift - tabAwareBottom);
}
