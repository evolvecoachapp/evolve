import { Text, View } from "react-native";
import { useThemedStyles } from "../../../theme/useThemedStyles";
import { spacing } from "../../../theme/theme";

export function CoachEmptyState() {
  const styles = useThemedStyles(({ typography, colors }) => ({
    container: {
      paddingVertical: spacing["3xl"],
      gap: spacing.md,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      ...typography.title3,
      color: colors.ink,
      textAlign: "center",
    },
    subtitle: {
      ...typography.callout,
      color: colors.inkMuted,
      textAlign: "center",
      maxWidth: 280,
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>No coaching updates yet.</Text>
      <Text style={styles.subtitle}>
        Complete workouts and follow your nutrition plan to receive personalized coaching.
      </Text>
    </View>
  );
}
