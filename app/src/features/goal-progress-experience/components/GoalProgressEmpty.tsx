import { StyleSheet, Text } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { useThemedStyles } from "../../../theme/useThemedStyles";

export function GoalProgressEmpty() {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      title: { ...typography.title3, color: colors.text, marginBottom: 8 },
      body: { ...typography.bodyRelaxed, color: colors.inkSecondary },
    }),
  );

  return (
    <AppCard>
      <Text style={styles.title}>No goals yet</Text>
      <Text style={styles.body}>
        Set a training goal to start tracking progress and milestones.
      </Text>
    </AppCard>
  );
}
