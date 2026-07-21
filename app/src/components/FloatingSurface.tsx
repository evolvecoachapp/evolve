import { useEffect, useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  View,
  type KeyboardEvent,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { floatingFooterMetrics, spacing } from "../theme/theme";
import { useFloatingFooterBottomOffset } from "../theme/useTabLayout";
import { useThemedStyles } from "../theme/useThemedStyles";

type FloatingSurfaceVariant = "bar" | "footer";

/** Nearly-opaque floating chrome — shared with FloatingTabBar treatment. */
const FLOATING_GLASS = {
  light: {
    base: "rgba(255,255,255,0.94)",
    frost: "rgba(255,255,255,0.55)",
    tint: "rgba(247,246,244,0.45)",
    border: "rgba(12,12,14,0.14)",
  },
  dark: {
    base: "rgba(30,30,34,0.96)",
    frost: "rgba(255,255,255,0.08)",
    tint: "rgba(21,21,24,0.5)",
    border: "rgba(250,250,250,0.16)",
  },
} as const;

interface FloatingSurfaceProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Show top hairline separator — default for bar variant only. */
  bordered?: boolean;
  /** `footer` — elevated glass panel for bottom CTAs and input bars. */
  variant?: FloatingSurfaceVariant;
}

/**
 * Fixed bottom bar / floating panel — nearly-opaque glass elevated surface.
 * Use `variant="footer"` for workout CTA, coach input, and future floating actions.
 */
export function FloatingSurface({
  children,
  style,
  bordered,
  variant = "bar",
}: FloatingSurfaceProps) {
  const { mode } = useTheme();
  const glass = FLOATING_GLASS[mode];

  const styles = useThemedStyles(({ colors, shadows }) => ({
    barSurface: {
      backgroundColor: glass.base,
      paddingHorizontal: spacing.screenPadding,
      paddingTop: spacing.md,
      borderWidth: 1,
      borderColor: glass.border,
      ...shadows.floating,
    },
    footerSurface: {
      backgroundColor: glass.base,
      borderWidth: 1,
      borderColor: glass.border,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#0C0C0E",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
        },
        android: {
          elevation: 12,
        },
        default: {},
      }),
    },
    frostOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: glass.frost,
    },
    tintOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: glass.tint,
    },
    bordered: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
  }));

  const isFooter = variant === "footer";

  return (
    <View
      style={[
        isFooter ? styles.footerSurface : styles.barSurface,
        isFooter && { borderRadius: floatingFooterMetrics.radius },
        !isFooter && bordered !== false && styles.bordered,
        style,
      ]}
    >
      {isFooter ? (
        <>
          <View style={styles.frostOverlay} pointerEvents="none" />
          <View style={styles.tintOverlay} pointerEvents="none" />
        </>
      ) : null}
      {children}
    </View>
  );
}

/** Anchor wrapper for absolute-positioned floating footers above the tab bar. */
export function FloatingFooterAnchor({
  children,
  style,
  keyboardAware = false,
  onKeyboardHeightChange,
  aboveTabBar = true,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Lift above the software keyboard — use for text composers only. */
  keyboardAware?: boolean;
  /** Reports keyboard lift used for bottom offset — 0 when hidden. Use for chat scroll insets. */
  onKeyboardHeightChange?: (lift: number) => void;
  /**
   * When true (default), sit above the floating tab bar.
   * Set false on stack screens that hide the tab bar.
   */
  aboveTabBar?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const tabAwareBottom = useFloatingFooterBottomOffset();
  const stackBottom =
    Math.max(insets.bottom, spacing.sm) + floatingFooterMetrics.bottomGap;
  const baseBottom = aboveTabBar ? tabAwareBottom : stackBottom;
  const [keyboardLift, setKeyboardLift] = useState(0);

  useEffect(() => {
    if (!keyboardAware) {
      return;
    }

    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (event: KeyboardEvent) => {
      const { height } = event.endCoordinates;
      const lift =
        Platform.OS === "ios"
          ? height
          : Math.max(0, height - insets.bottom);
      setKeyboardLift(lift);
      onKeyboardHeightChange?.(lift);
    };
    const onHide = () => {
      setKeyboardLift(0);
      onKeyboardHeightChange?.(0);
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom, keyboardAware, onKeyboardHeightChange]);

  const bottom = keyboardLift > 0 ? keyboardLift : baseBottom;

  const styles = useThemedStyles(() => ({
    anchor: {
      position: "absolute",
      left: 0,
      right: 0,
      paddingHorizontal: floatingFooterMetrics.horizontalInset,
      pointerEvents: "box-none",
    },
  }));

  return (
    <View style={[styles.anchor, { bottom }, style]} pointerEvents="box-none">
      {children}
    </View>
  );
}

export { floatingFooterMetrics };
