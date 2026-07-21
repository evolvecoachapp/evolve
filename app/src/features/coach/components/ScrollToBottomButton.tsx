import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { AnimatedPressable } from "../../../animation/AnimatedPressable";
import { useTheme } from "../../../theme/ThemeContext";
import { radius, spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

export interface ScrollToBottomButtonProps {
  visible: boolean;
  onPress: () => void;
}

/** Floating control to jump to the latest message — presentation only. */
export function ScrollToBottomButton({
  visible,
  onPress,
}: ScrollToBottomButtonProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors, shadows }) =>
    StyleSheet.create({
      button: {
        alignSelf: "center",
        marginBottom: spacing.sm,
        width: spacing["2xl"] + spacing.sm,
        height: spacing["2xl"] + spacing.sm,
        borderRadius: radius.full,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.glass,
        borderWidth: 1,
        borderColor: colors.borderGlass,
        ...shadows.floating,
      },
    }),
  );

  if (!visible) {
    return null;
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="Scroll to latest message"
      onPress={onPress}
      variant="floating"
      haptic="light"
      style={styles.button}
    >
      <Ionicons name="chevron-down" size={spacing.icon.lg} color={colors.ink} />
    </AnimatedPressable>
  );
}
