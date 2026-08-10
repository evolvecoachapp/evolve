import { StyleSheet, Text } from "react-native";
import { AppCard } from "../../../components/AppCard";
import { useThemedStyles } from "../../../theme/useThemedStyles";

export function RecoveryEmpty() {
  const styles = useThemedStyles(({ colors, typography }) =>
    StyleSheet.create({
      title: { ...typography.title3, color: colors.text, marginBottom: 8 },
      body: { ...typography.bodyRelaxed, color: colors.inkSecondary },
    }),
  );

  return (
    <AppCard>
      <Text style={styles.title}>No recovery data yet</Text>
      <Text style={styles.body}>
        Log sleep and update readiness to unlock recovery guidance.
      </Text>
    </AppCard>
  );
}
