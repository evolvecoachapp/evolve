import { useSafeAreaInsets } from "react-native-safe-area-context";
import { floatingFooterMetrics, tabBarMetrics } from "./layout";
import { spacing } from "./spacing";

/** Total bottom scroll padding for tab screens — clears the floating tab bar. */
export function useTabSceneBottomReserve(): number {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, spacing.sm);
  return tabBarMetrics.reservedSpace + bottomOffset;
}

/** Bottom offset for absolute floating footers — sits just above the tab bar pill. */
export function useFloatingFooterBottomOffset(): number {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, spacing.sm);
  return bottomOffset + tabBarMetrics.height + floatingFooterMetrics.bottomGap;
}
