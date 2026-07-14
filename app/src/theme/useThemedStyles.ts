import { useMemo } from "react";
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";
import { useTheme } from "./ThemeContext";
import type { ThemeTokens } from "./theme";

type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle;
};

/**
 * Create StyleSheet styles that react to theme changes.
 * Pass a factory that receives the active token set.
 */
export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (theme: ThemeTokens) => T,
): T {
  const theme = useTheme();
  // Factory is intentionally excluded — callers pass inline lambdas; theme identity tracks mode changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- theme is the sole reactive dependency
  return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
}
