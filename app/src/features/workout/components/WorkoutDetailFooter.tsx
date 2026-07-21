import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../../components/AppButton";
import { FloatingFooterAnchor, FloatingSurface } from "../../../components/FloatingSurface";
import { spacing } from "../../../theme/theme";
import { useThemedStyles } from "../../../theme/useThemedStyles";

interface WorkoutDetailFooterProps {
  summary: string;
  onBack: () => void;
  label?: string;
}

/** Floating footer CTA for returning from workout detail. */
export function WorkoutDetailFooter({
  summary,
  onBack,
  label = "Back to history",
}: WorkoutDetailFooterProps) {
  const styles = useThemedStyles(({ colors, typography, radius }) =>
    StyleSheet.create({
      summary: {
        ...typography.callout,
        color: colors.inkSecondary,
        fontWeight: "600",
        textAlign: "center",
      },
      cta: {
        minHeight: spacing["3xl"],
        borderRadius: radius.lg,
      },
    }),
  );

  return (
    <FloatingFooterAnchor aboveTabBar={false}>
      <FloatingSurface variant="footer">
        <View>
          <Text style={styles.summary}>{summary}</Text>
        </View>
        <AppButton
          label={label}
          size="lg"
          onPress={onBack}
          style={styles.cta}
          interaction="floating"
          haptic="medium"
        />
      </FloatingSurface>
    </FloatingFooterAnchor>
  );
}
