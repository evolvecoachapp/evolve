import { forwardRef } from "react";
import { ScrollView, StyleSheet, type ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackground } from "./GradientBackground";
import { spacing } from "../theme/theme";

export interface ScreenContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  withHeader?: boolean;
  /** Apply warm canvas gradient instead of flat background. */
  gradient?: boolean;
  /** Extra bottom padding for floating footers (in addition to safe area). */
  footerReserve?: number;
  /**
   * Include device bottom safe-area inset in scroll padding.
   * Disable on tab screens — use TabScreenContainer instead.
   */
  reserveBottomInset?: boolean;
  /** Space to clear a floating tab bar — set via TabScreenContainer on tab screens. */
  tabBarReserve?: number;
}

export const ScreenContainer = forwardRef<ScrollView, ScreenContainerProps>(
  function ScreenContainer(
    {
      children,
      withHeader = true,
      gradient = true,
      footerReserve = 0,
      reserveBottomInset = true,
      tabBarReserve = 0,
      contentContainerStyle,
      style,
      ...scrollProps
    },
    ref,
  ) {
    const insets = useSafeAreaInsets();
    const bottomInset = tabBarReserve > 0 ? tabBarReserve : reserveBottomInset ? insets.bottom : 0;

    const scroll = (
      <ScrollView
        ref={ref}
        style={[styles.scroll, style]}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: bottomInset + spacing.xl + footerReserve,
            paddingTop: withHeader ? 0 : insets.top + spacing.md,
          },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...scrollProps}
      >
        {children}
      </ScrollView>
    );

    if (gradient) {
      return <GradientBackground variant="canvas">{scroll}</GradientBackground>;
    }

    return scroll;
  },
);

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.section,
  },
});
