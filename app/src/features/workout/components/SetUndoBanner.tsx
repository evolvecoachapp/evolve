import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { chipEntering } from "../../../animation/entering";
import { useReduceMotion } from "../../../animation/useReduceMotion";
import { AppButton } from "../../../components/AppButton";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface SetUndoBannerProps {
  secondsRemaining: number;
  onUndo: () => void;
  onDismiss: () => void;
}

/** Short-lived undo affordance shown after completing a set. */
export function SetUndoBanner({ secondsRemaining, onUndo, onDismiss }: SetUndoBannerProps) {
  const reduceMotion = useReduceMotion();
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      banner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.borderPulse,
      },
      copy: {
        flex: 1,
        gap: spacing.xs,
      },
      title: {
        ...typography.callout,
        fontWeight: "600",
      },
      subtitle: {
        ...typography.caption,
        color: colors.inkSecondary,
      },
      actions: {
        flexDirection: "row",
        gap: spacing.sm,
      },
    }),
  );

  return (
    <Animated.View entering={chipEntering(0, reduceMotion)}>
      <View style={styles.banner}>
        <View style={styles.copy}>
          <Text style={styles.title}>Set logged</Text>
          <Text style={styles.subtitle}>Undo within {secondsRemaining}s</Text>
        </View>
        <View style={styles.actions}>
          <AppButton label="Undo" variant="secondary" size="sm" onPress={onUndo} />
          <AppButton label="Dismiss" variant="ghost" size="sm" onPress={onDismiss} />
        </View>
      </View>
    </Animated.View>
  );
}
